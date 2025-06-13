'use client';
import AuthRedirect from "../_components/AuthRedirect";
import Chat from "../_components/Chat"
import ChatWrapper from "../_components/ChatWrapper";
import SideChat from "../_components/SideChat"
import { Suspense } from "react";
async function verfiyUser(){
  // try{
  //   const jwt = (await cookies()).get('jwt');
  //   console.log('req for cookies')
  //   const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/verifyUser`,{headers:{Cookie:`jwt=${jwt}`}});
  //   const user = await res.json();
  //   return user?.user?.id;
  // }catch(err){
  //   console.log(err);
  //   redirect('/auth/signin');
  // }
}

function Page({searchParams}) {
    // const paramObj = await searchParams;
    // const userId = await verfiyUser();
    
     return (
       <div className="w-full h-screen overflow-hidden">
         <ChatWrapper />
       </div>
     );
}

export default Page
