'use client';
import { Suspense, useEffect, useState } from "react";
import SideChat from "./SideChat";
import Chat from "./Chat";
import { UseSocketContext } from "./SocketProvider";
import { useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { jwtDecode } from "jwt-decode";

function ChatWrapper() {
    const searchParams = useSearchParams();
    const [userTypingId, setUserTypingId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [friendId, setFriendId] = useState(null);
    const params = searchParams.get("friendId");
    const {socket} = UseSocketContext();
    const queryClient = useQueryClient();
        const [scroll, setScroll] = useState(false);
    
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

    useEffect(() => {
      document.documentElement.scrollTop =
        document.documentElement.scrollHeight;
    }, []); // removed scroll
    useEffect(() => {
      if (!socket) return;

      socket.on("connect", () => console.log("connected"));
      socket.on("messageRecieved", (data) => {
        queryClient.setQueryData(["chats"], (previousChats) => {
          if (!previousChats) return [...data?.chat];
          const latestChatIndex = previousChats?.chats.findIndex(
            (el) => data?.chat[0]?.id === el?.id
          );
          const newChats = [...previousChats.chats];
          newChats[latestChatIndex] = data?.chat[0];

          newChats.sort((a, b) =>
            b?.recentMessageCreatedAt.localeCompare(a?.recentMessageCreatedAt)
          );
          return { ...previousChats, chats: newChats };
        });
        const token = localStorage.getItem("jwt");
        const currentUserId = jwtDecode(token)?.id;
        if (data?.Type === "image" || data?.senderId !== currentUserId)
          setScroll(false);
        if (data?.senderId == friendId || data?.senderId === currentUserId) {
          // setMessages(el=>[...el,data]);
          setMessages((el) => {
            if (data?.Type === "image" || data?.senderId !== currentUserId) {
              if (data?.senderId !== currentUserId && data?.Type !== "image")
                setScroll(true);
              return [...el, data];
            }
            const newState = [...el];
            const index = newState.findIndex(
              (el) => el?.uniqueId === data?.uniqueId
            );
            newState[index] = data;
            return [...newState];
          });
          // if (data.Type !== "image") setScroll(true);
        }
      });
      socket.on("message-read", ({ userId, friendId }) => {
        setMessages((el) => {
          return el.map((msg) => {
            return { ...msg, isRead: true };
          });

        });
        queryClient.setQueryData(["chats"], (oldData) => {
          console.log('from message read top',oldData);
          if (!oldData) return [];
          const index = oldData?.chats?.findIndex(
            (el) =>
              (el.userId === userId && el.user2Id === friendId) ||
              (el.userId === friendId && el.user2Id === userId)
          );
          console.log("from messageREad: ", index);
          if (index || index === 0) {
            const chatsCopy = [...oldData?.chats];
            chatsCopy[index].isRecentMessageRead = true;
            console.log('message read copy: ',chatsCopy);
            return { ...oldData, chats: chatsCopy };
          }
          
          return oldData;
        });
      });
      return () => {
        socket?.off?.("connect");
        socket?.off?.("messageRecieved");
        socket?.off?.("message-read");
      };
    }, [socket, friendId]);
    return (
      <div className="flex h-full  w-full">
        <Suspense>
          <SideChat userTypingId={userTypingId}/>
        </Suspense>
        <div className="h-screen w-full bg-[var(--surface)]">
          <Suspense fallback={<div>loading chat...</div>}>
            <Chat friendId={friendId} scroll={scroll} setScroll={setScroll} messages={messages} params={params}  setFriendId={setFriendId} setMessages={setMessages} userTypingId={userTypingId} setUserTypingId={setUserTypingId}/>
          </Suspense>
        </div>
      </div>
    );
}

export default ChatWrapper
