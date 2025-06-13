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
function ChatContainer({ messages, setMessages,scroll,setScroll,containerRef,params,friendId,setFriendId }) {
  const searchParams = useSearchParams();
  const { socket } = UseSocketContext();
  // const [scroll, setScroll] = useState(true);
  const queryClient = useQueryClient();
  const { data, isLoading,isFetching } = useQuery({
    queryKey: ["messages", params],
    queryFn: () => getMessages(params),
    refetchOnWindowFocus: false,
    placeholderData: [],
  });
  async function getMessages(params) {
    if (!params) return [];
    console.log("fetch friend ", params);
    const jwt = localStorage.getItem("jwt");
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
    containerRef.current.scrollTop = containerRef.current.scrollHeight;
    console.log("from effect of id: ", params);
    const jwt = localStorage.getItem("jwt");
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
  }, [params]);

  useEffect(()=>{
    const jwt = localStorage.getItem("jwt");
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
    const currentUserId = jwtDecode(jwt)?.id;
      if (
        ((containerRef.current &&
          scroll &&
          messages[messages.length - 1]?.Type === "image") )||
        messages[messages.length - 1]?.placeholder || 
        messages[messages.length - 1]?.senderId !== currentUserId
      ) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      // setScroll(false);

      }
  }, [scroll,messages?.length]);
 
  return (
    <div
      ref={containerRef}
      className="bg-[var(--surface)] pt-[20%] pb-[calc(130px+env(safe-area-inset-bottom))]  lg:pb-7 lg:pt-5 relative h-full overflow-auto text-[var(--text)] px-5 flex flex-col gap-3"
    >
      {isFetching && <Spinner />}
      {!isFetching &&
        messages?.map((el, i) => (
          <Message key={i} message={el} setScroll={setScroll} />
        ))}
      {/* {[
          {
            time: "2025-06-07 09:40:59.216",
            senderId:1,
            Type: "image",
            mediaUrl,
            caption: "am i looking good in this outfit ?",
          },
        ].map((el, i) => (
          <Message key={i} message={el} />
        ))} */}
    </div>
  );
}

export default ChatContainer;

function Message({ message, setScroll }) {
  if (typeof window === "undefined") return;
  const token = localStorage.getItem("jwt");
  const currentUserId = jwtDecode(token)?.id;

  const time = format(new Date(message?.time), "HH:mm");
  if (message.Type !== "image")
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
                  className={`text-lg ${message?.placeholder ?'hidden':'block'} ${message?.isRead && "text-blue-400"}`}
                />
                <BiCheck
                  className={`text-lg ${message?.placeholder ? 'block':'hidden'}`}
                />
              </>
            )}
          </span>
        </p>
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
            <p className="tracking-wide">{message.caption}</p>
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
}
