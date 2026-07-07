import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: "No token discovered." }, { status: 401 });
    }

    // Decode the raw payload properties natively
    const { payload } = await jwtVerify(token, secret);
    
    const client = await clientPromise;
    const db = client.db("eng-app"); 

    // Extract values from your token profile
    const tokenEmail = payload.email;
    const rawUserId = payload.userId || payload.userid || payload.id;
    const cleanIdString = rawUserId ? String(rawUserId).replace(/["']/g, "").trim() : "";

    // Build a smart polymorphic lookup array
    const searchConditions = [];

    // Add email lookup if it exists in your JWT payload
    if (tokenEmail) {
      searchConditions.push({ email: tokenEmail.trim() });
    }

    // Add raw text ID lookup
    if (cleanIdString) {
      searchConditions.push({ _id: cleanIdString });
      
      // Add casted ObjectId lookup if valid
      if (ObjectId.isValid(cleanIdString)) {
        searchConditions.push({ _id: new ObjectId(cleanIdString) });
      }
    }

    if (searchConditions.length === 0) {
      return NextResponse.json({ success: false, message: "Token contains no identifying claims." }, { status: 400 });
    }

    // Search using $or across all parsed parameters
    const user = await db.collection("users").findOne({
      $or: searchConditions
    }, { projection: { password: 0 } });

    if (!user) {
      return NextResponse.json({ success: false, message: "User profile does not exist in this database." }, { status: 404 });
    }

    // Fetch user vault metrics count
    const vaultCount = await db.collection("vault").countDocuments({ userId: cleanIdString });

    return NextResponse.json({
      success: true,
      profile: {
        name: user.name || "English Learner",
        email: user.email,
        createdAt: user.createdAt || new Date(),
        vaultCount: vaultCount
      }
    });

  } catch (error) {
    // This will now execute perfectly because NextResponse is imported above!
    return NextResponse.json({ success: false, message: "Internal Server Error", error: error.message }, { status: 500 });
  }
} 