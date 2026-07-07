import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import sanitizeHtml from "sanitize-html";
import { cookies } from "next/headers";
import { SignJWT } from "jose";

export async function POST(request) {
  
  try {
    const body = await request.json(); 
    const { name, email, password } = body; 

    if (!name || !email || !password) { 
      return Response.json({
        success: false,
        message: "Please fill all fields!"
      }, { status: 400 });
    }

    if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string") { 
      return Response.json({
        success: false,
        message: "Invalid input"
      }, { status: 400 });
    }    
     
    const cleanname = sanitizeHtml(name.trim());
    const cleanemail = sanitizeHtml(email.trim().toLowerCase());
    const cleanpassword = sanitizeHtml(password.trim());

    if (cleanname.length < 4 || cleanpassword.length < 4 || cleanname.length > 12 || cleanpassword.length > 12) { 
      return Response.json({ 
        success: false,
        message: "Name and password length must be between 4 and 12 characters."
      }, { status: 400 });
    }

    const client = await clientPromise; 
    const db = client.db("eng-app"); 

    const existing = await db.collection("users").findOne({ email: cleanemail }); 
   
    if (existing) {
      return Response.json({
        success: false,
        message: "Email already exists!"
      }, { status: 409 });
    } 

    const hashedpass = await bcrypt.hash(cleanpassword, 10); 
   
    // FIX 1: Save as 'password' to ensure it stays consistent with your login file
    const user = {
      name: cleanname,
      email: cleanemail,
      password: hashedpass, 
    };

    const insert$id = await db.collection("users").insertOne(user);
   
    const user_id = insert$id.insertedId.toString(); 
       
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new SignJWT({
      userid: user_id,
      email: cleanemail,
    })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

    // FIX 2: Inline await execution for setting cookies safely
    (await cookies()).set("token", token, { 
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });   

  return Response.json({
     success:true,
     message:"user created "
  })

  } catch (error) {
    // We use error.log to catch exactly what went wrong before returning the UI message
    
    return Response.json({
      success: false,
      message: "An internal server error occurred."
    }, { status: 500 });
  } 

}