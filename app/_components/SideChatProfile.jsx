'use client';
import { jwtDecode } from "jwt-decode";
import { usePathname, useSearchParams,useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { BiCheckDouble } from "react-icons/bi";
import { RiAccountCircleFill } from "react-icons/ri";
function SideChatProfile({chat,currentUserId,userTypingId}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter()
  // const [userId,setUserId] = useState(null);
  function handleClick(){
    const params = new URLSearchParams(searchParams);
    const friendId = chat?.user?.id === currentUserId ? chat?.user2?.id : chat?.user?.id;
    params.set('friendId',friendId);
    router.replace(`${pathname}?${params.toString()}`);
  }
  // const highlight = 
  // useEffect(()=>{
  //   const jwt = localStorage.getItem('jwt');
  //   if(!jwt) return;
  //   const payload = jwtDecode(jwt);
  //   console.log(payload);
  //   setUserId(payload?.id);
  // },[])
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
    return (
      <button
        onClick={handleClick}
        className={`w-full overflow-hidden border-b-1 grid grid-cols-5 h-[15%] relative hover:bg-[var(--surface)] ${
          hightlightUser() ? "bg-[var(--muted)]" : ""
        } hover:cursor-pointer transition-all duration-300 ease-in-out border-[var(--muted)] flex items-center px-2`}
      >
        {chat?.friend?.profileImage ? (
          <img
            src="data:image/jpeg;base64,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"
            alt=""
            className="border-white w-[20%] h-3/4 rounded-full"
          />
        ) : (
          <div>
            <RiAccountCircleFill className="text-5xl text-[var(--text)]" />
          </div>
        )}
        <div className="text-[var(--textDark)] w-full col-span-4 space-y-2 tracking-wider  flex-1">
          <p className="text-left">
            {chat?.user?.id === currentUserId
              ? chat?.user2?.name
              : chat?.user?.name}
          </p>
          {chat?.recentMessage || userTypingId == chat?.id && (
            <div className="w-full pr-3 flex-1">
              <p className="brightness-80  truncate font-thin text-left flex gap-1 items-center">
                {chat?.recentMessageSenderId === currentUserId && (
                  <span>
                    <BiCheckDouble
                      className={`text-lg  ${
                        chat?.isRecentMessageRead && "text-blue-400"
                      }`}
                    />
                  </span>
                )}
                {userTypingId != chat?.id && chat?.recentMessage}
                {userTypingId == chat?.id && <span className="text-green-500 ">typing...</span>}
              </p>
            </div>
          )}
        </div>
        {/* <p className="absolute h-6 w-6 rounded-full text-stone-700 flex items-center justify-center bg-green-400 dark:bg-green-600 right-3 top-1/2 -translate-y-1/2">4</p> */}
      </button>
    );
}

export default SideChatProfile
