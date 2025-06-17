"use client";
import { format } from "date-fns";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { UseSocketContext } from "./SocketProvider";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Spinner from "./Spinner";
import { BiCheckDouble,BiCheck } from "react-icons/bi";
import { IoChevronDownSharp } from "react-icons/io5";
import AudioPlayer from "react-h5-audio-player";
function ChatContainer({chats, messages, setMessages,scroll,setScroll,containerRef,params,friendId,setFriendId }) {
  const searchParams = useSearchParams();
  const { socket } = UseSocketContext();
  // const [scroll, setScroll] = useState(true);
  const queryClient = useQueryClient();
  const { data, isLoading,isFetching } = useQuery({
    queryKey: ["messages", params],
    queryFn: () => getMessages(params),
    refetchOnWindowFocus: false,
  });
  async function getMessages(params) {
    if (!params) return [];
    console.log("fetch friend ", params);
    const jwt = localStorage.getItem("jwt");
    setScroll(false);
    // const params = new URLSearchParams(searchParams).toString();
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/message/getMessages?friendId=${params}`,
        {
          headers: {
            Authorization: `jwt=${jwt}`,
          },
        }
      );

      console.log(res);
      console.log(res.data.messages)
      setMessages(res.data.messages);
      return res.data.messages;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  

  useEffect(() => {
    setFriendId(Number(params));
    
    console.log("from effect of id: ", params);
    const jwt = localStorage.getItem("jwt");
    if(!jwt) return;
    const userId = jwtDecode(jwt)?.id;
    async function markRead() {
      const res2 = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/message/readMessages/${params}`,
        {
          headers: {
            Authorization: `jwt=${jwt}`,
          },
        }
      );
    }
    markRead();
    queryClient.setQueryData(['chats'],(previousChats) => {
      // console.log('no chats');
      if(previousChats?.chats?.length < 1 || !previousChats) return previousChats;
      // console.log(previousChats);
      // console.log(...previousChats?.chats)
      // console.log('starting recent msg');
      const index = previousChats?.chats?.findIndex(el => (el?.userId == userId && el?.user2Id == params) || (el?.userId == params && el?.user2Id == userId))
      console.log('index',index);
      if(index === -1) return previousChats
      // console.log('after index')
      // console.log('isReaded: ',previousChats?.chats[index]?.isRecentMessageRead);
      // console.log('isSendedByMe: ',previousChats?.chats[index]?.recentMessageSenderId == userId);
      if(previousChats?.chats[index]?.isRecentMessageRead || previousChats?.chats[index]?.recentMessageSenderId == userId) return previousChats;
      // console.log('setting recent message to true');
      // console.log('chats ?: ',previousChats?.chats)
      // console.log("Array check:", Array.isArray(previousChats?.chats));
      // console.log("Type:", typeof previousChats?.chats);
      // console.log(...previousChats?.chats);
      const copy = [...previousChats?.chats];
      copy[index].isRecentMessageRead = true;
      console.log('final recent msg obj: ',{...previousChats,chats:copy});
      return {...previousChats,chats:copy}
    })
  }, [params]);

  useEffect(()=>{
    if(containerRef.current && !isFetching){
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  },[params,isFetching,scroll])

  useEffect(()=>{
    const jwt = localStorage.getItem("jwt");
    if(!jwt) return;
    const userId = jwtDecode(jwt);
    console.log('from read effect: ',friendId);
    if(messages[messages.length - 1]?.senderId == userId || friendId != (messages[messages.length - 1]?.senderId)) return;
    if(messages[messages.length - 1]?.senderId == friendId && messages[messages.length - 1]?.isRead === true) return;
    async function markRead() {
      const res2 = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/message/readMessages/${params}`,
        {
          headers: {
            Authorization: `jwt=${jwt}`,
          },
        }
      );
    }
    markRead();
  },[messages?.length,params])
  useEffect(() => {
    const jwt = localStorage.getItem('jwt');
    if(!jwt) return;
    const currentUserId = jwtDecode(jwt)?.id;
      if (
        ((containerRef.current &&
          scroll &&
          messages[messages.length - 1]?.Type === "image" || messages[messages.length -1]?.Type === 'audio') )||
        messages[messages.length - 1]?.placeholder || 
        messages[messages.length - 1]?.senderId !== currentUserId
      ) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      // setScroll(false);

      }
  }, [scroll,messages?.length]);
  // pb-[calc(130px+env(safe-area-inset-bottom))]
  return (
    <div
      ref={containerRef}
      className="bg-[var(--surface)] py-7  lg:pb-7 lg:pt-5 relative h-full overflow-auto text-[var(--text)] px-5 flex flex-col gap-3"
      // className="bg-[var(--surface)] pt-[20%] pb-[calc(130px+env(safe-area-inset-bottom))]  lg:pb-7 lg:pt-5 relative h-full overflow-auto text-[var(--text)] px-5 flex flex-col gap-3"
    >
      {isFetching && <Spinner />}
      {!isFetching && chats?.length > 0 &&
        messages?.map((el, i) => (
          <Message key={i} message={el} setScroll={setScroll} />
        ))}
      {!isFetching && messages?.length < 1 && (
        
          <div className="text-center flex items-center text-lg lg:text-xl flex-col justify-center text-gray-400 mt-5  h-full">
            <p className="">
              This chat is{" "}
              <span className="font-semibold text-gray-300">
                end-to-end encrypted
              </span>
              .
            </p>
            <p>Only you and your contact can read the messages.</p>
            <p className="mt-2 italic">Start the conversation securely.</p>
          </div>
        
      )}
    </div>
  );
}

export default ChatContainer;

function Message({ message, setScroll }) {
  if (typeof window === "undefined") return;
  const token = localStorage.getItem("jwt");
  if(!token) return;
  const currentUserId = jwtDecode(token)?.id;

  const time = format(new Date(message?.time), "HH:mm");
  if (message.Type === "text")
    return (
      <div className="w-full">
        <p
          className={`relative rounded-sm pl-3 pr-20 p-2 w-fit max-w-3/4 lg:max-w-[45%]  break-words ${
            currentUserId === Number(message?.senderId)
              ? "ml-auto bg-green-900"
              : "bg-[var(--muted)]"
          }`}
        >
          {message?.message}
          <span className="text-xs right-2 bottom-1 absolute flex gap-1 items-center">
            {time}
            {message?.senderId === currentUserId && (
              <>
                <BiCheckDouble
                  className={`text-lg ${
                    message?.placeholder ? "hidden" : "block"
                  } ${message?.isRead && "text-blue-400"}`}
                />
                <BiCheck
                  className={`text-lg ${
                    message?.placeholder ? "block" : "hidden"
                  }`}
                />
              </>
            )}
          </span>
        </p>
        {/* <audio
          controls
          src="https://res.cloudinary.com/dkqsfm61z/video/upload/v1750058725/iogykmwmsqdnggo3ulwg.webm"
        className="min-w-full" /> */}
      </div>
    );
  if (message.Type === "image")
    
    return (
      <div className="w-full gap-2 ">
        <div
          className={`flex flex-col relative  gap-3 bg-[var(--muted)] p-2 rounded-sm min-w-[60%] max-w-[60%]  lg:w-fit lg:min-w-[30%] lg:max-w-[30%] ${
            currentUserId === Number(message?.senderId)
              ? "ml-auto bg-green-900"
              : "bg-[var(--muted)]"
          }`}
        >
          <img src={message?.mediaUrl} alt="" onLoad={() => setScroll(true)} />
          {message?.caption && (
            <p className="tracking-wide ">{message.caption}</p>
          )}
          <span
            className={`text-xs ${
              message?.caption ? "right-2 bottom-1" : "right-3 bottom-2"
            }  absolute flex gap-1 items-center`}
          >
            {time}
            {message?.senderId === currentUserId &&  (
              <BiCheckDouble
                className={`text-lg ${message?.isRead && "text-blue-400"}`}
              />
            )}
          </span>
        </div>
      </div>
    );
  if (message.Type === "audio")
    
    return (
      <div className="w-full">
        <div
          className={`relative py-2  min-w-[60%] max-w-[70%] lg:w-fit lg:min-w-[30%] lg:max-w-[30%] ${
            currentUserId === Number(message?.senderId) ? "ml-auto " : ""
          }`}
        >
          {/* <audio
            controls
            src={message?.mediaUrl}
            className="w-full hidden lg:block" // You can adjust `h-8` to control height
            onLoadedData={() => setScroll(true)} // correct event for audio
          /> */}
          <AudioPlayer
            src={message?.mediaUrl}
            className={message?.senderId === currentUserId ? 'audio-player audio-sended':'audio-player audio-recieved'}
            layout="horizontal-reverse"
            defaultDuration={["00:00"]}
            defaultCurrentTime={["00:00"]}
            showJumpControls={false}
            preload="metadata"
            customAdditionalControls={[]} // ❗ Make sure this is not hiding play
            customVolumeControls={["volume"]} // Optional
          />
          {/* ); */}
          <span className="text-xs text-white absolute right-2 bottom-2 flex gap-1 items-center">
            {time}
            {message?.senderId === currentUserId && (
              <BiCheckDouble
                className={`text-lg ${message?.isRead ? "text-blue-400" : ""}`}
              />
            )}
          </span>
        </div>
      </div>
    );
}
