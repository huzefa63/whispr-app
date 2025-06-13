'use client';
import { useSearchParams } from "next/navigation";
import ChatContainer from "./ChatContainer"
import ChatController from "./ChatController"
import ChatProfile from "./ChatProfile"
import { Poppins } from "next/font/google";
import { useEffect, useRef, useState } from "react";
import { UseSocketContext } from "./SocketProvider";
const p = Poppins({
    subsets:['latin'],
    variable:'p',
    weight:'400'
})
function Chat({userTypingId,setUserTypingId,messages,setMessages,setFriendId,friendId,params,scroll,setScroll}) {
    // const params = useSearchParams();
    const containerRef = useRef(null);
    
    

    if(!params) return (
      <div className={`${p.className} hidden lg:flex bg-[var(--surface)] flex-col gap-25 text-[var(--text)] tracking-wider text-3xl items-center justify-center w-full h-full`}>
        <div className="flex flex-col gap-3 opacity-70">
          <h1 className="text-center">Whispr</h1>
          <p> an chatting platform for web</p>
        </div>
        <p className={`${p.className} text-2xl`}>deliver real time messages</p>
      </div>
    );
    return (
      <div
        className={`w-full  ${
          !params && "hidden lg:flex"
        } h-full flex flex-col`}
      >
        <div className="lg:h-[10%] w-full h-[9%] lg:relative lg:top-0 lg:left-0 fixed top-0 left-0 z-50">
          <ChatProfile />
        </div>
        <div className="lg:h-[80%] h-screen  border-white ">
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
        </div>
        <div className="lg:h-[10%] w-full h-[8%] lg:relative lg:top-0 lg:left-0 fixed bottom-0 left-0 z-50">
          <ChatController userTypingId={userTypingId} setMessages={setMessages} setScroll={setScroll} containerRef={containerRef}/>
        </div>
      </div>
    );
}

export default Chat
