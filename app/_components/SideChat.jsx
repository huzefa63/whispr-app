'use client';
import { MdPersonAddAlt1 } from "react-icons/md";
import SideChatProfile from "./SideChatProfile";
import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import AddFriend from "./AddFriend";
import { Poppins } from "next/font/google";
import { UseSocketContext } from "./SocketProvider";
import Spinner from "./Spinner";
const p = Poppins({
  subsets: ["latin"],
  variable: "p",
  weight: "400",
});
function SideChat({userTypingId}) {
  const pathanme = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const {socket} = UseSocketContext();
  const queryClient = useQueryClient();
  const {data:chats,isFetching} = useQuery({
    queryKey:['chats'],
    queryFn:getChats,
    refetchOnWindowFocus:false
  });

  
    
    

  async function getChats(){
    try {
      const jwt = localStorage.getItem('jwt');
      if(!jwt) return [];
      const chatRes = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/chat/getChats`,{headers:{Authorization:`jwt=${jwt}`}}
      );
      console.log('chats',chatRes.data)
      return chatRes.data;
      
    } catch (err) {
      console.log(err);
      return [];
    }
  }
   return (
     <div
       className={`h-full ${
         searchParams.get("friendId") && "hidden lg:flex"
       } min-w-full lg:max-w-[25%] lg:min-w-[25%] relative bg-[var(--background)] shadow-sm flex flex-col border-r-1 border-[var(--border)]`}
     >
       <h1 className="text-center mt-3 text-3xl text-[var(--text)]">WHISPR</h1>
       <AddFriend />
       {chats?.chats && chats?.chats?.length < 1 && (
         <div
           className={`${p.className} absolute left-1/2 text-center  text-[var(--text)] flex flex-col gap-3 top-1/2 -translate-1/2 w-full`}
         >
           <p className={` w-full `}>you don't have any friends added</p>
           <p>add friends to start chatting</p>
         </div>
       )}
       {!isFetching ? (
         <div className="flex flex-col gap-2 items-center border-[var(--border)] w-full flex-1 overflow-auto mt-3 py-3">
           {chats?.chats?.map((el, i) => (
             <SideChatProfile
               userTypingId={userTypingId}
               key={i}
               chat={el}
               currentUserId={chats?.currentUserId}
             />
           ))}
         </div>
       ) : (
         <Spinner />
       )}
     </div>
   );
}

export default SideChat;
