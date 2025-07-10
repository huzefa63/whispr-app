"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { RiAccountCircleFill } from "react-icons/ri";
import { IoIosArrowRoundBack } from "react-icons/io";
import { BiDotsVertical } from "react-icons/bi";
import { useEffect, useRef, useState } from "react";
import { MdCall } from "react-icons/md";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { FaVideo } from "react-icons/fa";
import { useGlobalState } from "./GlobalStateProvider";
function ChatProfile({startVideoCall,startCall, params }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { data: friend } = useQuery({
    queryKey: ["friend", searchParams.toString()],
    queryFn: getFriend,
    refetchOnWindowFocus: false,
  });
  const [showContext, setShowContext] = useState(false);
  const queryClient = useQueryClient();
  const buttonRef = useRef(null);
  const { setMessages } = useGlobalState();
  
  async function getFriend() {
    if (!searchParams.get("friendId")) return [];
    try {
      const res = await axios.get(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL
        }/user/getFriend/${searchParams.get("friendId")}`
      );
      return res.data.friend;
    } catch (err) {
      return {};
    }
  }
  useEffect(() => {
    function handleClick(e) {
      if (showContext && e.target !== buttonRef.current) {
        setShowContext(false);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [showContext]);
  async function deleteMessages() {
    const jwt = localStorage.getItem("jwt");
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/message/deleteMessages/${params}`,
        {
          headers: {
            Authorization: `jwt=${jwt}`,
          },
        }
      );
      queryClient.setQueryData(["messages", params], (oldData) => {
        setMessages([]);
        return [];
      });
      queryClient.setQueryData(["chats"], (oldData) => {
        if (!oldData) return oldData;
        const oldChats = [...oldData?.chats];
        const index = oldChats?.findIndex(
          (el) => el?.userId == params || el?.user2Id == params
        );
        oldChats[index].recentMessage = null;
        oldChats[index].recentMessageSenderId = null;
        oldChats[index].isRecentMessageRead = false;
        oldChats[index].recentMessageCreatedAt = null;
        return { ...oldData, chats: oldChats };
      });
    } catch (err) {
      console.log(err);
      toast.error("failed to clear chat!");
    }
  }
  let lastSeen;
  if (friend?.lastSeen) {
    lastSeen = format(new Date(friend?.lastSeen), "HH:mm");
  }
  return (
    <div className="h-full bg-[var(--muted)] lg:px-5 pr-3 flex justify-between items-center  w-full">
      <div className="h-full gap-7 hover:cursor-pointer transition-all overflow-hidden mr-5  duration-300 ease-in-out flex items-center px-2">
        <div className="flex items-center ">
          <IoIosArrowRoundBack
            onClick={() => {
              const newParams = new URLSearchParams(searchParams);
              newParams.delete("friendId");
              router.replace(`${pathname}?${newParams.toString()}`);
            }}
            className="text-3xl block lg:hidden text-[var(--text)]"
          />
          {friend?.profileImage ? (
            <img
              src={friend?.profileImage}
              alt=""
              className="border-white  w-12 h-12 object-cover  rounded-full"
            />
          ) : (
            <RiAccountCircleFill className="text-5xl text-[var(--text)]" />
          )}
        </div>
        <div className="pl-1 text-[var(--textDark)] tracking-wider">
          <p className="text-sm lg:text-lg overflow-hidden truncate ">ddfhfjkdsf fdfdsfsdf dfsdfsdf fsdfd sdfdsfds dsfsdf</p>
          <p className="text-xs ">
            {friend?.status === "offline" &&
              lastSeen &&
              `last seen at ${lastSeen}`}
            {friend?.status === "online" && (
              <span className="text-green-500">online</span>
            )}
            {!friend?.status && friend?.contactNumber && `+91 ${friend?.contactNumber}`}
          </p>
        </div>
      </div>

      <div className="flex lg:gap-5 gap-2 text-white items-center">
        <div
          className="lg:text-3xl text-2xl p-1 hover:bg-gray-600 hover:cursor-pointer"
          onClick={async () => await startCall()}
        >
          <MdCall />
        </div>
        <div
          className="lg:text-3xl text-2xl p-1 hover:bg-gray-600 hover:cursor-pointer"
          onClick={async () => await startVideoCall()}
        >
          <FaVideo />
        </div>
        <div className=" relative z-[500] text-white">
          <span ref={buttonRef} className="">
            <BiDotsVertical
              className="hover:bg-gray-600 lg:text-lg text-sm hover:cursor-pointer w-6 h-6"
              onClick={() => setShowContext(!showContext)}
            />
          </span>
          {showContext && (
            <button
              onClick={deleteMessages}
              className=" hover:cursor-pointer absolute top-7 right-2 transition-all duration-300 ease-in-out hover:bg-green-600 bg-green-500 rounded-sm h-fit whitespace-nowrap py-2 px-3"
            >
              clear chat
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatProfile;
