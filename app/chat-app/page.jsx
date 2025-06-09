'use client';
import { cookies } from "next/headers";
import Chat from "../_components/Chat"
import ChatController from "../_components/ChatController"
import SideChat from "../_components/SideChat"
import { redirect } from "next/navigation";
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

async function Page({searchParams}) {
    // const paramObj = await searchParams;
    // const userId = await verfiyUser();
    
     return (
       <div className="w-full h-screen overflow-hidden">
         <div className="flex h-full">
           <SideChat />
           <div className="h-full w-full">
             <Suspense fallback={<div>loading chat...</div>}>
               <Chat />
             </Suspense>
           </div>
         </div>
       </div>
     );
}

export default Page
