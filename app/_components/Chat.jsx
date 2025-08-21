'use client';
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import ChatContainer from "./ChatContainer"
import ChatController from "./ChatController"
import ChatProfile from "./ChatProfile"
import { Poppins } from "next/font/google";
import { useEffect, useRef, useState } from "react";
import { BsChatDotsFill, BsFillChatLeftTextFill } from "react-icons/bs";
import "react-h5-audio-player/lib/styles.css";
import { useGlobalState } from "./GlobalStateProvider";

const p = Poppins({
    subsets:['latin'],
    variable:'p',
    weight:'400'
})

function Chat({ startVideoCall, startCall, chats, params }) {
  const containerRef = useRef(null);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const {editMessage,replyMessage,userTypingId} = useGlobalState();
  useEffect(() => {
    if (!chats || chats?.chats?.length < 1) return;
    const isChat = chats?.chats?.some(
      (el) => el?.userId == params || el?.user2Id == params
    );
    if (!isChat) {
      const params = new URLSearchParams(searchParams);
      params.delete("friendId");
      router.replace(`${pathname}?${params}`);
    }
  }, [params, chats]);
  if (!params)
    return (
      <div
        className={`${p.className} hidden lg:flex bg-[var(--surface)] flex-col gap-25 text-[var(--text)] tracking-wider text-3xl items-center justify-center w-full h-full`}
      >
        <div className="flex flex-col gap-3 opacity-70">
          <div className="text-blue-500 justify-center my-3 flex gap-2 items-center text-3xl tracking-wide">
            <BsFillChatLeftTextFill />
            <p className="font-bold">WHISPR</p>
          </div>
          <p> an chatting platform for web</p>
          <p className={`${p.className} text-center mt-2 text-2xl`}>
            deliver real time messages
          </p>
        </div>
      </div>
    );
  return (
    <div
      className={`w-full h-full flex flex-col ${!params && "hidden lg:flex"}`}
    >
      {chats?.chats?.length > 0 && (
        <div className="lg:h-[10%] h-[9%] w-full lg:relative fixed top-0 left-0 z-[1000]">
          <ChatProfile
            startVideoCall={startVideoCall}
            startCall={startCall}
            params={params}
          />
        </div>
      )}

      <div
        className={`${
          editMessage?.isEditing || replyMessage?.isReplying ? "z-0" : "z-[999]"
        } lg:h-[80%] h-[83%] w-full lg:relative fixed top-[9%] bottom-[8%] lg:top-0 lg:bottom-0 border-white `}
      >
        <ChatContainer
          chats={chats?.chats}
          params={params}
          containerRef={containerRef}
        />
        {userTypingId == searchParams.get("friendId") && (
          <div className="absolute bottom-5 left-5  w-fit   rounded-3xl flex items-center gap-3">
            <BsChatDotsFill className=" text-xl text-green-500" />
          </div>
        )}
      </div>

      {chats?.chats?.length > 0 && (
        <div
          className={`lg:h-[10%]  h-[8%] w-full lg:relative fixed bottom-0 left-0 z-50`}
        >
          <ChatController />
        </div>
      )}
    </div>
  );
}
export default Chat