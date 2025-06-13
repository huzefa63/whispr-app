'use client';
import { Suspense, useEffect, useState } from "react";
import SideChat from "./SideChat";
import Chat from "./Chat";
import { UseSocketContext } from "./SocketProvider";

function ChatWrapper() {
    const [userTypingId, setUserTypingId] = useState(null);
    const {socket} = UseSocketContext();
    useEffect(() => {
      if (!socket) return;
      let timeout;
      socket.on("typing", (userId) => {
        console.log(userId);
        setUserTypingId(userId);
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          setUserTypingId(null);
        }, 1000);
      });
      return () => socket.off("typing");
    }, [socket]);
    return (
      <div className="flex h-full  w-full">
        <Suspense>
          <SideChat userTypingId={userTypingId}/>
        </Suspense>
        <div className="h-screen w-full">
          <Suspense fallback={<div>loading chat...</div>}>
            <Chat userTypingId={userTypingId} setUserTypingId={setUserTypingId}/>
          </Suspense>
        </div>
      </div>
    );
}

export default ChatWrapper
