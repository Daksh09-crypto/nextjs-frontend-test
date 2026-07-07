import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request){
const token= request.cookies.get("token")?.value;
const secret=new TextEncoder().encode(process.env.JWT_SECRET); 
   const { pathname } = request.nextUrl; 
let isauthpage=pathname==="/login"||pathname==="/signup";
let isvalideuser=false; 
       if(token){
        try{
          await jwtVerify(token,secret);
          isvalideuser=true;
        }catch(error){
          isvalideuser=false;
        };
       };   
     if(isauthpage){
      if(isvalideuser){
        return NextResponse.redirect(new URL("/dashboard",request.url));
      }else{
        return NextResponse.next(); /// this is very important here to prevent from infinite loop because if user at signup at find he doesnot have token then he stays there not redirect to login . if request not from login or signup and invalide then stays at same page . if this fucntion not run means request not from dasboard so if invalide retunr to login . 
      };
     };
     if(!isvalideuser){
      return NextResponse.redirect(new URL("/login",request.url));
     };

     return NextResponse.next();
}
export const config = {
  matcher: ["/dashboard","/dashboard/:path*","/login","/signup"],
};      