'use client';
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import ChatContainer from "./ChatContainer"
import ChatController from "./ChatController"
import ChatProfile from "./ChatProfile"
import { Poppins } from "next/font/google";
import { useEffect, useRef, useState } from "react";
import { UseSocketContext } from "./SocketProvider";
import { BsFillChatLeftTextFill } from "react-icons/bs";
const p = Poppins({
    subsets:['latin'],
    variable:'p',
    weight:'400'
})
function Chat({chats,userTypingId,setUserTypingId,messages,setMessages,setFriendId,friendId,params,scroll,setScroll}) {
    // const params = useSearchParams();
    const containerRef = useRef(null);
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();
    useEffect(()=>{
      if(!chats || chats?.chats?.length < 1) return;
      const isChat = chats?.chats?.some(el => el?.userId == params || el?.user2Id == params)
      if(!isChat){
        const params = new URLSearchParams(searchParams);
        params.delete('friendId');
        router.replace(`${pathname}?${params}`);
      }
    },[params,chats])
    // useEffect(() => {
    //   console.log(router);

    //   // if(typeof window === 'undefined') return;
    //   const jwt = localStorage.getItem("jwt");
    //   console.log("jwt", jwt);
    //   if (jwt === null) {
    //     router.replace("/auth/signin");
    //     return;
    //   }
    //   const payload = jwtDecode(jwt);
    //   if (payload.exp < Date.now() / 1000) {
    //     router.replace("/auth/signin");
    //   }
    // }, []);
    if(!params) return (
      <div className={`${p.className} hidden lg:flex bg-[var(--surface)] flex-col gap-25 text-[var(--text)] tracking-wider text-3xl items-center justify-center w-full h-full`}>
        <div className="flex flex-col gap-3 opacity-70">
          <div className="text-blue-500 justify-center my-3 flex gap-2 items-center text-3xl tracking-wide">
                  <BsFillChatLeftTextFill />
                  <p className="font-bold">WHISPR</p>
                </div>
          <p> an chatting platform for web</p>
        <p className={`${p.className} text-center mt-2 text-2xl`}>deliver real time messages</p>
        </div>
      </div>
    );
    return (
      <div
        className={`w-full  ${
          !params && "hidden lg:flex"
        } h-full flex flex-col`}
      >
        {chats?.chats?.length > 0 && <div className="lg:h-[10%] w-full h-[9%] lg:relative lg:top-0 lg:left-0 fixed top-0 left-0 z-50">
          <ChatProfile setMessages={setMessages} params={params} chats={chats}/>
        </div>}
        {/* <div className="lg:h-[80%] h-screen  border-white "> */}
        {chats?.chats?.length > 0 && <div className="lg:h-[80%] h-[83%] w-full lg:relative fixed top-[9%] bottom-[8%] lg:top-0 lg:bottom-0  border-white ">
          <ChatContainer
          friendId={friendId}
          params={params}
          setFriendId={setFriendId}
          containerRef={containerRef}
            messages={messages}
            setMessages={setMessages}
            scroll={scroll}
            setScroll={setScroll}
          />
        </div>}
        {chats?.chats?.length > 0 && <div className="lg:h-[10%] w-full h-[8%] lg:relative lg:top-0 lg:left-0 fixed bottom-0 left-0 z-50">
          <ChatController userTypingId={userTypingId} setMessages={setMessages} setScroll={setScroll} containerRef={containerRef}/>
        </div>}
      </div>
    );
}

export default Chat
