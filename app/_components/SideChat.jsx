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
const p = Poppins({
  subsets: ["latin"],
  variable: "p",
  weight: "400",
});
function SideChat() {
  const pathanme = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const {socket} = UseSocketContext();
  const queryClient = useQueryClient();
  const {data:chats,isPending} = useQuery({
    queryKey:['chats'],
    queryFn:getChats,
    refetchOnWindowFocus:false
  });

  useEffect(() => {
    if (!socket) return;

    socket.on("connect", () => console.log("connected"));
    socket.on("revalidate-chats", (chat) => {
      // queryClient.invalidateQueries('chats');
      console.log(chat);
      queryClient.setQueryData(['chats'],(oldChats) => {
        if(!oldChats) return [];
        console.log('old',oldChats)
        console.log('recent',chat);
        const index = oldChats?.chats.findIndex(
          (el) =>
            (el?.userId == chat?.senderId && el?.user2Id == chat?.recieverId) ||
            (el?.userId == chat?.recieverId && el?.user2Id == chat?.senderId)
        );
        // console.log(chat);
        // console.log('from query client index: ',index);
        if(index){
          let newChat = oldChats?.chats?.slice(index,index + 1);
          const otherChats = oldChats?.chats?.slice();
          console.log('other',otherChats)
          const r = otherChats.splice(index,1);
          console.log('removed',r);
          console.log('new',newChat)
          console.log('newly updated',{...newChat,recentMessage:chat?.message})
          console.log('final chats',{
            chats: [
               ...newChat ,
              ...otherChats,
            ],
            currentUserId: oldChats?.currentUserId,
            status: oldChats?.status,
          });
          newChat[0].recentMessage = chat?.message;
          return {chats:[...newChat,...otherChats],currentUserId:oldChats?.currentUserId,status:oldChats?.status};
        }
      })
    });

    socket?.on('messageRecieved',() =>{
      queryClient.invalidateQueries(['chats']);
    })
    
    return () => {
      socket?.off?.("connect");
      socket?.off?.("revalidate-chats");
    };
  }, [socket]);

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
    <div className="h-full max-w-[25%] min-w-[25%] relative bg-[var(--background)] shadow-sm flex flex-col border-r-1 border-[var(--border)]">
      <h1 className="text-center mt-3 text-3xl text-[var(--text)]">WHISPR</h1>
      <AddFriend />
      {chats?.chats && chats?.chats?.length < 1 && (
        <div className={`${p.className} absolute left-1/2 text-center  text-[var(--text)] flex flex-col gap-3 top-1/2 -translate-1/2 w-full`}>
          <p className={` w-full `}>you don't have any friends added</p>
          <p>add friends to start chatting</p>
        </div>
      )}
      <div className="border- border-[var(--border)] w-full flex-1 overflow-auto mt-3 py-3">
        {chats?.chats?.map((el, i) => (
          <SideChatProfile
            key={i}
            chat={el}
            currentUserId={chats?.currentUserId}
          />
        ))}
      </div>
    </div>
  );
}

export default SideChat;
