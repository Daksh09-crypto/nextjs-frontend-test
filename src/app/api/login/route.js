import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import sanitizeHtml from "sanitize-html";
import { cookies } from "next/headers";
import { SignJWT } from "jose";

export async function POST(request) {
  // FIX 1: Default to false so it doesn't accidentally redirect during an error


  try { 
    const body = await request.json(); 
    const { email, password } = body;
    
    if (!email || !password) {
      return Response.json({
        success: false,
        message: "please fill all fields !"
      }, { status: 400 });  
    }

    if (typeof email !== "string" || typeof password !== "string") {
      return Response.json({
        success: false,
        message: "invalid input "
      }, { status: 403 });
    }
    
    const cleanemail = sanitizeHtml(email.trim().toLowerCase());
    const cleanpassword = sanitizeHtml(password.trim());
    
    if (cleanpassword.length < 4 || cleanpassword.length > 12) {
      return Response.json({ 
        success: false,
        message: "! please check lenth of !password<4 or !password>12"
      }, { status: 400 });
    }

    const client =  await clientPromise;
   // console.log(error)
    const db = client.db("eng-app");
   // console.log(`error ---------  ${db}`)
    const user = await db.collection('users').findOne({ email: cleanemail });  
    
    
    if (!user) {
      return Response.json({
        success: false,
        message: "user not exist ,please create account!"
      }, { status: 403 });
    }
    
    const isMatch = await bcrypt.compare(cleanpassword, user.password);

    if (!isMatch) {
      return Response.json({
        success: false,
        message: "Wrong password!"
      }, { status: 401 });
    }

  // JWT verification setup
   if (!process.env.JWT_SECRET) {
    throw new Error("CRITICAL: JWT_SECRET environment variable is missing!");
   }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new SignJWT({
      userid: user._id.toString(),
      email: cleanemail,
    })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

    // FIX 2: Inline await assignment for reliable header handling
    (await cookies()).set("token", token, {      
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });   

    // ONLY flip to true when everything goes perfectly right
    return Response.json({
      success:true,
      message:"user verified login"  
    })

  } catch (error) {
   console.error("The exact error is:", error);
    return Response.json({
      success: false,
      message: "unknown error please check your internet."
    }, { status: 500 }); // Swapped to 500 (Internal Server Error)
  }
  }
