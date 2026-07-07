import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getAuthenticatedUserId } from "../save/route";
import { ObjectId } from "mongodb";
export async function POST(request) {
  try {
    const token = request.cookies.get("token")?.value;

    if (token) {
      const client = await clientPromise;
      const db = client.db("eng-app");
      
      // Blacklist the token so it cannot be used again
      await db.collection("tokens").insertOne({
        token,
        blacklistedAt: new Date(),
        // Fixed: 7 * 24... is 7 days later, not 1 hour. Adjusting text label comment
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) 
      });
    }

    // 🎯 FIXED: Create the response object
    const response = NextResponse.json({
      success: true,
      message: "Session ended successfully."
    });

    // 🎯 FIXED: Expire the token cookie ON THE ACTUAL OBJECT WE RETURN
    response.cookies.set("token", "", {
      expires: new Date(0),
      path: "/",
      httpOnly: true, // Security best practice
      secure: process.env.NODE_ENV === "production"
    });  

    return response;

  } catch (error) {
   // console.log(`error : ${error}`)
    return NextResponse.json({
      success: false,
      message: "Request failed, try again later."
    }, { status: 500 });
  }
}    
export async function DELETE(){
   try{const userId=await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized. Please log in." }, { status: 401 });
    }   

    const client =await clientPromise;
    const db=client.db("eng-app");
 const userExists = await db.collection("users").findOne({ _id: new ObjectId(userId) });
    if (!userExists) {
      return NextResponse.json({ success: false, message: "User profile verification failed." }, { status: 403 });
    }
   // const vault=await db.collection("vault").find({userId:userId}).toArray()

    await db.collection("vault").deleteMany({userId:userId});
    return Response.json({
      success:true,
      message:"storage deleted begin your search !"
    })
}catch(error){
  return Response.json({
    success:false,message:"failed !"
  })
}}