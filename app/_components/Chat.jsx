'use client';
import { useSearchParams } from "next/navigation";
import ChatContainer from "./ChatContainer"
import ChatController from "./ChatController"
import ChatProfile from "./ChatProfile"
import { Poppins } from "next/font/google";
import { useState } from "react";
const p = Poppins({
    subsets:['latin'],
    variable:'p',
    weight:'400'
})
function Chat() {
    const params = useSearchParams();
    const [messages,setMessages] = useState([]);
    const [scroll, setScroll] = useState(false);
    
    if(!params.get('friendId')) return (
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
          !params.get("friendId") && "hidden lg:flex"
        } h-full flex flex-col`}
      >
        <div className="lg:h-[10%] w-full h-[9%] lg:relative lg:top-0 lg:left-0 fixed top-0 left-0 z-50">
          <ChatProfile />
        </div>
        <div className="lg:h-[80%] h-screen  border-white ">
          <ChatContainer
            messages={messages}
            setMessages={setMessages}
            scroll={scroll}
            setScroll={setScroll}
          />
        </div>
        <div className="lg:h-[10%] w-full h-[8%] lg:relative lg:top-0 lg:left-0 fixed bottom-0 left-0 z-50">
          <ChatController setMessages={setMessages} setScroll={setScroll} />
        </div>
      </div>
    );
}

export default Chat
