'use client';
import { MdPersonAddAlt1 } from "react-icons/md";
import SideChatProfile from "./SideChatProfile";
import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import AddFriend from "./AddFriend";

function SideChat() {
  const pathanme = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const {data:chats,isPending} = useQuery({
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
    <div className="h-full w-[30%] bg-[var(--background)] shadow-sm flex flex-col border-r-1 border-[var(--border)]">
      <h1 className="text-center mt-3 text-3xl text-[var(--text)]">WHISPR</h1>
      <AddFriend />
      <div className="border- border-[var(--border)] w-full flex-1 overflow-auto mt-3 py-3">
        {chats?.chats?.map((el,i) => <SideChatProfile key={i} chat={el} currentUserId={chats?.currentUserId}/> )}
      </div>
    </div>
  );
}

export default SideChat;
