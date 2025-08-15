'use client';
import SideChatProfile from "./SideChatProfile";
import { useSearchParams } from "next/navigation";
import { BsFillChatLeftTextFill } from "react-icons/bs";
import AddFriend from "./AddFriend";
import { Poppins } from "next/font/google";

import Spinner from "./Spinner";
import { useEffect, useRef, useState } from "react";
import { jwtDecode } from "jwt-decode";
const p = Poppins({
  subsets: ["latin"],
  variable: "p",
  weight: "400",
});

function SideChat({isPending,isLoading,userTypingId,setChats,chats}) {
  const searchParams = useSearchParams();
  const inputRef = useRef(null);
  const [filteredChats,setFilteredChats] = useState(null);
  function preventTextSelection(){
    window.getSelection().removeAllRanges();
  }
  
  function handleFilter(e){
    const id = jwtDecode(localStorage.getItem('jwt')).id;
    const filteredChats = chats?.chats?.filter(el => {
      const otherUser = el.userId === id ? el.user2 : el.user;
      return otherUser?.name.toLowerCase()?.includes(e.target.value.toLowerCase());
    })
    console.log(filteredChats)
    setFilteredChats({chats:filteredChats});
  }
  
   return (
     <div
       className={`h-full ${
         searchParams.get("friendId") && "hidden lg:flex"
       } min-w-full lg:max-w-[25%] lg:min-w-[25%] relative bg-[var(--background)] shadow-sm flex flex-col border-r-1 border-[var(--border)]`}
     >
       <div className="relative">
         <div className="text-blue-500 my-3 px-5 lg:px-0 flex lg:flex-col gap-5 items-center  tracking-wide">
           <div className="flex items-center gap-2 lg:text-3xl text-2xl">
             <BsFillChatLeftTextFill />
             <p className="font-bold ">WHISPR</p>
           </div>
           <input
             ref={inputRef}
             // value= {value}
             onChange={handleFilter}
             placeholder="search contact here"
             type="text"
             className="bg-[var(--surface)] lg:w-[95%] w-full text-sm placeholder:text-sm h-fit focus:outline-none focus:border-[var(--border)] border-2 border-[var(--muted)] rounded-full px-5 py-2 lg:py-3 text-[var(--text)]"
           />
         </div>
       </div>
       {/* <div className="relative">
         <div className="text-blue-500 justify-center my-3 flex gap-2 items-center text-3xl tracking-wide">
           <BsFillChatLeftTextFill />
           <p className="font-bold ">WHISPR</p>
         </div>
       </div> */}

       {/* <AddFriend /> */}
       {chats?.chats && chats?.chats?.length < 1 && !isPending && (
         <div
           className={`${p.className} absolute left-1/2 text-center  text-[var(--text)] flex flex-col gap-3 top-1/2 -translate-1/2 w-full`}
         >
           <p className={` w-full `}>you don't have any friends added</p>
           <p>add friends to start chatting</p>
         </div>
       )}
       {!isLoading ? (
         <div
           onClick={preventTextSelection}
           onContextMenu={preventTextSelection}
           className="flex  flex-col gap-2 items-center border-[var(--border)] w-full flex-1 overflow-auto mt-3 py-3"
         >
           {!filteredChats || filteredChats?.chats.length < 1
             ? chats?.chats?.map((el, i) => (
                 <SideChatProfile
                   userTypingId={userTypingId}
                   key={i}
                   chat={el}
                   currentUserId={chats?.currentUserId}
                 />
               ))
             : filteredChats?.chats?.map((el, i) => (
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
