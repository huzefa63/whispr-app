"use client";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Spinner from "./Spinner";
import { useGlobalState } from "./GlobalStateProvider";
import { useContextMenu } from "react-contexify";
import Message from "./Message";
import { ShowDate } from "./ShowDate";
import handleContextMenu from "../_services/contextMenu";
import CustomMenu from "./CustomMenu";
import { getMessages, markRead } from "../_services/message";
import {scrollChatContainer,updateChatRecentMessageToRead,} from "../_services/chat";
import { returnJwtAndUserId } from "../_services/auth";
import { differenceInCalendarDays } from "date-fns";
import StartChat from "./StartChat";
const MENU_ID = "my-menu";

function ChatContainer({ chats, containerRef, params }) {
  const { messages, setMessages, scroll, setScroll, friendId, setFriendId } =
    useGlobalState();
  const [showEditItem, setShowEditItem] = useState();
  const [currentUserId, setCurrentUserId] = useState(null);
  const { show } = useContextMenu({ id: MENU_ID });
  const queryClient = useQueryClient();
  const { isFetching } = useQuery({
    queryKey: ["messages", params],
    queryFn: () => getMessages(params, setScroll, setMessages),
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    // this effect will run first so just set current user id if not
    const { jwt, userId } = returnJwtAndUserId();
    if (!jwt) return;
    if (!currentUserId) setCurrentUserId(userId);
    // works only when chat changes , in short friendId changes
    setFriendId(Number(params));
    // mark messages as read
    markRead(params, jwt);
    // find and update chat recent message to read if not already read
    updateChatRecentMessageToRead(queryClient, userId, params);
  }, [params]);

  useEffect(() => {
    // scroll container
    if (containerRef.current && !isFetching) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [params, isFetching, scroll]);

  useEffect(() => {
    const { jwt, userId } = returnJwtAndUserId();
    if (!jwt) return;
    if(messages?.length < 1) return;
    const lastMessage = messages.at(-1);
    // if last message was sent by me then return cause all messages are already read
    if (lastMessage?.senderId == userId) return;

    // if messages was sent by friend and it was also read then also just return
    if (
      lastMessage.senderId == friendId &&
      lastMessage.isRead === true
    )
      return;

    // otherwise just read messages
    markRead(params, jwt);
  }, [messages?.length, params]);

  useEffect(() => {
    const { jwt, userId } = returnJwtAndUserId();
    if (!jwt) return;
    if(messages?.length < 1) return;
    // scroll chat if all the conditions met
    scrollChatContainer(messages, userId, containerRef);
  }, [scroll, messages?.length]);

  return (
    <div
      onContextMenu={(e) =>
        handleContextMenu(e, show, currentUserId, setShowEditItem)
      }
      ref={containerRef}
      className="chat-container bg-[var(--surface)] py-7  lg:pb-7 lg:pt-5 relative h-full overflow-auto text-[var(--text)] px-5 flex flex-col gap-3"
    >
      {isFetching && <Spinner />}

      {!isFetching &&
        chats?.length > 0 && currentUserId &&
        messages
          ?.filter((el) => !el.deletedBy.includes(currentUserId))
          .map((el, i, arr) => (
            <div key={i}>
              {i === 0 && <ShowDate dateString={el?.time} />}
              {i !== 0 &&
                differenceInCalendarDays(
                  new Date(el.time),
                  new Date(arr[i - 1].time)
                ) > 0 && <ShowDate dateString={el?.time} key={el?.time} />}
              <Message
                currentUserId={currentUserId}
                key={el.id}
                message={el}
                setScroll={setScroll}
                setMessages={setMessages}
              />
            </div>
          ))}

      {!isFetching && chats?.length > 0 && (
        <CustomMenu showEditItem={showEditItem} MENU_ID={MENU_ID} />
      )}

      {!isFetching && messages?.length < 1 && <StartChat />}
    </div>
  );
}
export default ChatContainer;