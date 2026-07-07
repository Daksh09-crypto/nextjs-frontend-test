import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

// Helper function to extract and verify userId from request cookies
 export async function getAuthenticatedUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  try {
    const client = await clientPromise;
    const db = client.db("eng-app");

    // 1. Check if token is flagged inside the blacklisted tokens collection
    const isBlacklisted = await db.collection("tokens").findOne({ token: token });
    
    if (isBlacklisted) {
      console.warn("🚫 Security Alert: Blocked access attempt using a blacklisted token.");
      return null; 
    }

    // 2. FIXED: Await jwtVerify and destructure payload for jose
    const { payload } = await jwtVerify(token, secret);
    return payload.userid; // Returns the verified user's ID string 
  } catch (err) {
    return null;
  }
}

// ==========================================================================
// 1. POST: SAVE A WORD FOR A SPECIFIC USER
// ==========================================================================
export async function POST(req) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized. Please log in." }, { status: 401 });
    }

    const body = await req.json();
    const { result } = body;

    if (!result || !result.word) {
      return NextResponse.json({ success: false, message: "Missing required word data." }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("eng-app"); // FIXED: Switched from linguist_engine to eng-app

    // B. Verify User Exists in the 'users' Collection
    const userExists = await db.collection("users").findOne({ _id: new ObjectId(userId) });
    if (!userExists) {
      return NextResponse.json({ success: false, message: "User profile verification failed." }, { status: 403 });
    }

    // C. Check Duplicates ONLY within this specific user's vault space
    const existingWord = await db.collection("vault").findOne({
      userId: userId,
      word: { $regex: new RegExp(`^${result.word.trim()}$`, "i") }
    });

    if (existingWord) {
      return NextResponse.json({ success: false, message: "Already saved in your vault! 🛡️" }, { status: 400 });
    }

    // D. Inject userId into document structure before inserting
    const documentToSave = {
      ...result,
      userId: userId,
      createdAt: new Date()
    };

    await db.collection("vault").insertOne(documentToSave);

    return NextResponse.json({ 
      success: true, 
      message: `"${result.word}" saved securely to your personal vault.` 
    });

  } catch (error) {
    return NextResponse.json({ success: false, message: "Internal server execution failure." }, { status: 500 });
  }
}

// ==========================================================================
// 2. GET: FETCH WORDS BELONGING EXCLUSIVELY TO THE AUTHENTICATED USER
// ==========================================================================
export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized. Please log in." }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("eng-app");

    const userExists = await db.collection("users").findOne({ _id: new ObjectId(userId) });
    if (!userExists) {
      return NextResponse.json({ success: false, message: "Access forbidden." }, { status: 403 });
    }

    const userSavedWords = await db
      .collection("vault")
      .find({ userId: userId }) 
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      vault: userSavedWords,
    });

  } catch (error) {
    return NextResponse.json({ success: false, message: "Database server pipeline error." }, { status: 500 });
  }
}

// ==========================================================================
// 3. DELETE: PURGE A SPECIFIC WORD OWNED BY THE AUTHENTICATED USER
// ==========================================================================
export async function DELETE(req) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized. Please log in." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const targetId = searchParams.get("id");

    if (!targetId) {
      return NextResponse.json({ success: false, message: "Missing item identifier parameter." }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("eng-app");

    const vaultItem = await db.collection("vault").findOne({
      _id: new ObjectId(targetId)
    });

    if (!vaultItem) {
      return NextResponse.json({ success: false, message: "Word item not found in data logs." }, { status: 404 });
    }

    // Verify ownership
    if (vaultItem.userId !== userId) {
      return NextResponse.json(
        { success: false, message: "Forbidden. You do not have permission to delete this entry! 🚫" }, 
        { status: 403 }
      );
    }

    const queryResult = await db.collection("vault").deleteOne({
      _id: new ObjectId(targetId),
      userId: userId 
    });
          
    if (queryResult.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Word not found or unauthorized to manage this resource." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Document successfully wiped from database vault stack." });

  } catch (error) {
    return NextResponse.json({ success: false, message: "Internal server deletion breakdown." }, { status: 500 });
  }
}