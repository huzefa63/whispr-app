'use client';
import SideChatProfile from "./SideChatProfile";
import { useRouter, useSearchParams } from "next/navigation";
import { BsFillChatLeftTextFill } from "react-icons/bs";
import AddFriend from "./AddFriend";
import { Poppins } from "next/font/google";

import Spinner from "./Spinner";
import { useEffect, useRef, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { BiDotsVertical } from "react-icons/bi";
import { contextMenu, Item, Menu, Separator, useContextMenu } from "react-contexify";
import { IoAddOutline, IoPersonAddOutline } from "react-icons/io5";
import { CiLogout } from "react-icons/ci";
import ModelWindow from "./ModelWindow";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import axios from "axios";
const p = Poppins({
  subsets: ["latin"],
  variable: "p",
  weight: "400",
});

const MENU_ID = 'add-friend';

function SideChat({isPending,isLoading,userTypingId,setChats,chats}) {
  const searchParams = useSearchParams();
  const inputRef = useRef(null);
  const {show} = useContextMenu({
    id:MENU_ID,
  })
  const router = useRouter();
  const [filteredChats,setFilteredChats] = useState(null);
  const [isMenu,setIsMenu] = useState(false);
  const [addFriend,setAddFriend] = useState(false);
   const [number, setNumber] = useState("");
   const queryClient = useQueryClient();
   const { mutateAsync } = useMutation({
     mutationFn: handleAddFriend,
     onSuccess: () => queryClient.invalidateQueries(["chats"]),
   });
   const [disableSubmit, setDisableSubmit] = useState();
   async function handleAddFriend(number) {
    console.log(number)
     try {
       const jwt = localStorage.getItem("jwt");
       if (!jwt) return false;
       if (disableSubmit) return;
       setDisableSubmit(true);
       const chatRes = await axios.get(
         `${process.env.NEXT_PUBLIC_BACKEND_URL}/chat/createChat/${number}`,
         { headers: { Authorization: `jwt=${jwt}` } }
       );
       return true;
     } catch (err) {
       return Promise.reject(err);
     } finally {
       setNumber("");
       setDisableSubmit(false);
     }
   }
   function handleSubmit(e) {
     e.preventDefault();
     setAddFriend(false);
     toast.promise(mutateAsync(number), {
       loading: "adding friend...",
       success: () => {
      // setAddFriend(false);
      return <b>Friend added!</b>;
    },
       error: (err) => <b>{err?.response?.data?.message}</b>,
      });
   }
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
  function handleShowMenu(e,width){
    if(isMenu) {
      return contextMenu.hideAll();
    }
    const rect =  e.target.closest('button').getBoundingClientRect();
    show({
      event:e,
      position:{
        x:rect.x - width,
        y:rect.y + rect.height + 5
      }
    })
    setIsMenu(true)
  }

  function handleLogout(){
      localStorage.removeItem("jwt");
      router.replace("/auth/signin");
  }
  function handleShowAddMenu(){
    setAddFriend(true);
  }
   return (
     <div
       className={`h-full ${
         searchParams.get("friendId") && "hidden lg:flex"
       } min-w-full lg:max-w-[25%] lg:min-w-[25%] relative bg-[var(--background)] shadow-sm flex flex-col border-r-1 border-[var(--border)]`}
     >
       <div className="relative">
         <div className="text-blue-500 relative my-3 px-3 lg:px-0 flex lg:flex-col gap-4 items-center  tracking-wide">
           <div className="flex items-center gap-2 lg:text-3xl text-2xl">
             <BsFillChatLeftTextFill />
             <p className="font-bold ">WHISPR</p>
           </div>
           <div className="flex items-center w-full lg:px-3 gap-1">
             <input
               ref={inputRef}
               // value= {value}
               onChange={handleFilter}
               placeholder="search contact here"
               type="text"
               className="bg-[var(--surface)] lg:w-[95%] w-full text-sm placeholder:text-sm h-fit focus:outline-none focus:border-[var(--border)] border-2 border-[var(--muted)] rounded-full px-5 py-2 lg:py-3 text-[var(--text)]"
             />
             <button onClick={e => handleShowMenu(e,200)}>
               <BiDotsVertical className="hover:bg-gray-600 text-3xl hidden lg:flex hover:cursor-pointer w-6 h-6 text-white" />
             </button>
             <button onClick={e => handleShowMenu(e,170)}>
               <BiDotsVertical className="hover:bg-gray-600 text-3xl lg:hidden hover:cursor-pointer w-6 h-6 text-white" />
             </button>
             {addFriend && (
               <ModelWindow close={() => setAddFriend(false)}>
                 <div className="absolute lg:w-1/4 w-3/4 left-1/2 top-1/2 -translate-1/2 flex items-center justify-center z-50">
                   <form onSubmit={handleSubmit} className="bg-[var(--surface)] rounded-xl w-full p-6 shadow-lg border-[var(--muted)] border-1">
                     {/* Title */}
                     <h2 className="text-lg font-bold text-white mb-4">
                       Add a Friend
                     </h2>

                     {/* Input */}
                     <input
                     disabled={disableSubmit}
                       type="number"
                       value={number}
                       onChange={(e) => setNumber(e.target.value)}
                       placeholder="Enter phone number"
                       className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                     />

                     {/* Buttons */}
                     <div className="flex justify-end gap-2 mt-4">
                       <button
                         onClick={() => setAddFriend(false)}
                         className="px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-500"
                       >
                         Cancel
                       </button>
                       <button
                         className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                       >
                         <IoPersonAddOutline size={20} />
                         Add
                       </button>
                     </div>
                   </form>
                 </div>
               </ModelWindow>
             )}
           </div>
         </div>
         <Menu
           onVisibilityChange={(visible) => setIsMenu(visible)}
           id={MENU_ID}
           theme="dark"
           animation="slide"
           className=""
         >
           <Item id="edit" className="w-full" onClick={handleShowAddMenu}>
             <span className="w-full flex items-center gap-2">
               <IoAddOutline /> Add friend
             </span>
           </Item>
           <Separator />
           <Item id="delete" onClick={handleLogout} className="w-full">
             <span className="flex items-center gap-2 w-full">
               <CiLogout className="" /> Logout
             </span>
           </Item>
         </Menu>
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