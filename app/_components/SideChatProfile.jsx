'use client';
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { usePathname, useSearchParams,useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import toast from "react-hot-toast";
import { BiCheckDouble } from "react-icons/bi";
import { BiDotsVertical } from "react-icons/bi";
import { RiAccountCircleFill } from "react-icons/ri";
function SideChatProfile({chat,currentUserId,userTypingId}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter()
  const [showMenu,setShowMenu] = useState(false);
  // const [userId,setUserId] = useState(null);
  const queryClient = useQueryClient();
  const buttonRef = useRef(null);
  function handleClick(){
    const params = new URLSearchParams(searchParams);
    const friendId = chat?.user?.id === currentUserId ? chat?.user2?.id : chat?.user?.id;
    params.set('friendId',friendId);
    router.replace(`${pathname}?${params.toString()}`);
  }
  useEffect(() => {
    function handleClick(e) {
      if (showMenu && e.target !== buttonRef.current) {
        setShowMenu(false);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [showMenu]);
  async function deleteChat(){
    const params = new URLSearchParams(searchParams);
    const jwt = localStorage.getItem('jwt');
      try{
        await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/chat/deleteChat?user=${chat?.user?.id}&user2=${chat?.user2?.id}`,{
          headers:{
            Authorization:`jwt=${jwt}`
          }
        });
        if (
          chat?.user?.id == params.get("friendId") ||
          chat?.user2?.id == params.get("friendId")
        ){
          params.delete('friendId');
          router.replace(`${pathname}?${params.toString()}`);
        }
          queryClient.invalidateQueries(["chats"]);
      }catch(err){
        console.log(err);
        toast.error('failed to delete chat!');
      }
  }
  
  function hightlightUser(){
    const me = currentUserId === chat?.userId;
    const friendId = searchParams.get('friendId');
    if(me){
      return chat?.user2Id === Number(friendId);
    }
    if(!me){
      return chat?.userId === Number(friendId);
    }
  }
  function showTyping(){
    if(chat?.user?.id != userTypingId && chat?.user2?.id != userTypingId) return false;
    let friendId;
    if(chat?.user?.id == currentUserId){
      friendId = chat?.user2?.id;
    }
    else{
      friendId = chat?.user?.id;
    }
    return friendId;
  }
  function isProfileImage(){
    if(currentUserId === chat?.user?.id) return chat?.user2?.profileImage;
    else return chat?.user?.profileImage;
  }
  const profileImage = isProfileImage();
  const typingId = showTyping();
  // console.log('userTypingId: ',userTypingId, " ",' chatId: ',chat?.id);
    return (
      <div className="h-[15%] w-[95%] relative">
        <div
          onClick={handleClick}
          className={`w-full pr-8 rounded-lg overflow-hidden border-1 grid grid-cols-5 h-full relative hover:bg-[var(--surface)] ${
            hightlightUser()
              ? "bg-neutral-800 border-neutral-700"
              : "border-neutral-800"
          } hover:cursor-pointer transition-all duration-300 ease-in-out border-[var(--muted)] flex items-center px-2`}
        >
          {profileImage ? (
            <img
              src={profileImage}
              alt=""
              className="border-white lg:w-32 w-16 h-16 object-cover lg:h-[75%] rounded-full"
            />
          ) : (
            <div>
              <RiAccountCircleFill className="text-5xl text-[var(--text)]" />
            </div>
          )}
          <div className="text-[var(--textDark)] ml-4 w-full col-span-4 space-y-1 tracking-wider  flex-1">
            <p className="text-left">
              {chat?.user?.id === currentUserId
                ? chat?.user2?.name
                : chat?.user?.name}
            </p>

            <div className="w-full pr-3 flex-1 text-left">
              <p
                className={`brightness-80 ${
                  chat?.recentMessageSenderId != currentUserId &&
                  !chat?.isRecentMessageRead &&
                  "text-green-500"
                } truncate font-thin text-left flex gap-1 items-center`}
              >
                {chat?.recentMessageSenderId === currentUserId && !typingId && (
                  <span>
                    <BiCheckDouble
                      className={`text-lg  ${
                        chat?.isRecentMessageRead && "text-blue-400"
                      }`}
                    />
                  </span>
                )}
                {!typingId && chat?.recentMessage}
                {typingId == userTypingId && (
                  <span className="text-green-500 tracking-wider">
                    typing...
                  </span>
                )}
              </p>
            </div>
          </div>
          {/* <p className="absolute h-6 w-6 rounded-full text-stone-700 flex items-center justify-center bg-green-400 dark:bg-green-600 right-3 top-1/2 -translate-y-1/2">4</p> */}
        </div>
        <div className="absolute right-2 top-2  z-[500] text-white">
          <span ref={buttonRef} onClick={() => setShowMenu(!showMenu)}>
            <BiDotsVertical className="hover:bg-gray-600 lg:text-lg text-sm hover:cursor-pointer w-6 h-6" />
          </span>
          {showMenu && (
            <div className="w-30  flex justify-center items-center h-10 border-1 border-neutral-600 rounded-sm  absolute top-7 right-2  ">
              <button
                onClick={() =>
                  toast.promise(deleteChat(), {
                    loading: "deleting chat...",
                    success: <b>chat deleted!</b>,
                    error: <b>Could not delete chat.</b>,
                  })
                }
                className="hover:cursor-pointer transition-all duration-300 ease-in-out hover:bg-red-600 bg-red-500 rounded-sm h-full w-full"
              >
                delete chat
              </button>
            </div>
          )}
        </div>
      </div>
    );
}

export default SideChatProfile
