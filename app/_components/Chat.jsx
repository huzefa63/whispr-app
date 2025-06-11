'use client';
import { useSearchParams } from "next/navigation";
import ChatContainer from "./ChatContainer"
import ChatController from "./ChatController"
import ChatProfile from "./ChatProfile"
import { Poppins } from "next/font/google";
const p = Poppins({
    subsets:['latin'],
    variable:'p',
    weight:'400'
})
function Chat({messages}) {
    const params = useSearchParams();
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
        <div className={`w-full ${!params.get('friendId') && 'hidden lg:flex'} h-full flex flex-col`}>
            <ChatProfile />
            <ChatContainer />
            <ChatController />
        </div>
    )
}

export default Chat
