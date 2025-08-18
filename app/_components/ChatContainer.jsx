"use client";
import { differenceInCalendarDays, format } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Spinner from "./Spinner";
import { BiCheckDouble, BiCheck } from "react-icons/bi";
import "react-contexify/dist/ReactContexify.css";
import AudioPlayer from "react-h5-audio-player";
import { useGlobalState } from "./GlobalStateProvider";
import { MdCopyAll, MdModeEditOutline } from "react-icons/md";
import { Item, Menu, Separator, useContextMenu, hideall, contextMenu } from "react-contexify";
import { FaEdit, FaTrash } from "react-icons/fa";
import { GoReply } from "react-icons/go";
const MENU_ID = 'my-menu'
function ChatContainer({ chats, containerRef, params }) {
  const { messages, setMessages, scroll, setScroll, friendId, setFriendId, editMessage } =
    useGlobalState();
  // const [scroll, setScroll] = useState(true);
  const queryClient = useQueryClient();
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["messages", params],
    queryFn: () => getMessages(params),
    refetchOnWindowFocus: false,
  });
  async function getMessages(params) {
    if (!params) return [];
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
      setMessages(res.data.messages);
      console.log(res.data.messages);
      return res.data.messages;
    } catch (err) {
      return [];
    }
  }

  useEffect(() => {
    setFriendId(Number(params));

    const jwt = localStorage.getItem("jwt");
    if (!jwt) return;
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
    queryClient.setQueryData(["chats"], (previousChats) => {
      if (previousChats?.chats?.length < 1 || !previousChats)
        return previousChats;
      const index = previousChats?.chats?.findIndex(
        (el) =>
          (el?.userId == userId && el?.user2Id == params) ||
          (el?.userId == params && el?.user2Id == userId)
      );

      if (index === -1) return previousChats;
      if (
        previousChats?.chats[index]?.isRecentMessageRead ||
        previousChats?.chats[index]?.recentMessageSenderId == userId
      )
        return previousChats;
      const copy = [...previousChats?.chats];
      copy[index].isRecentMessageRead = true;
      return { ...previousChats, chats: copy };
    });
  }, [params]);

  useEffect(() => {
    if (containerRef.current && !isFetching) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [params, isFetching, scroll]);

  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) return;
    const userId = jwtDecode(jwt);
    if (
      messages[messages?.length - 1]?.senderId == userId ||
      friendId != messages[messages?.length - 1]?.senderId
    )
      return;
    if (
      messages[messages.length - 1]?.senderId == friendId &&
      messages[messages.length - 1]?.isRead === true
    )
      return;
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
  }, [messages?.length, params]);
  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) return;
    const currentUserId = jwtDecode(jwt)?.id;
    if (
      (containerRef.current &&
        scroll &&
        messages[messages.length - 1]?.Type === "image") ||
      messages[messages.length - 1]?.Type === "audio" ||
      messages[messages.length - 1]?.placeholder ||
      messages[messages.length - 1]?.senderId !== currentUserId
    ) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
      // setScroll(false);
    }
  }, [scroll, messages?.length]);
  const {setEditMessage,setReplyMessage} = useGlobalState();
  const [showEditItem,setShowEditItem] = useState();
  const {show} = useContextMenu({
    id:MENU_ID
  });
  // const currentUserId = jwtDecode(localStorage.getItem('jwt')).id;
  // pb-[calc(130px+env(safe-area-inset-bottom))]
  async function handleDelete({ props }) {
    console.log('deleting')
    setMessages((mess) => {
      return mess.filter((el) => el.id !== Number(props.messId));
    });
    contextMenu.hideAll();
    const jwt = localStorage.getItem("jwt");
    try {
      await axios.delete(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL
        }/message/deleteMessage?messageId=${
          props?.messId
        }&otherUser=${params}`,
        {
          headers: {
            Authorization: `jwt=${jwt}`,
          },
        }
      );
    } catch (err) {
      console.log(err);
    }
  }

  function handleUpdate({ props }) {
    contextMenu.hideAll();
    setEditMessage({
      isEditing: true,
      messageId: Number(props.messId),
      text: props.text,
    });
  }
  function handleReply({ props }) {
    contextMenu.hideAll();
    console.log('from handle reply: ',props);
    setReplyMessage({
      isReplying: true,
      messageId: Number(props.messId),
      text: props.text,
      senderId:props.senderId,
      senderName:props.senderName,

    });
  }
  const [currentUserId,setCurrentUserId] = useState(null);
  useEffect(()=>{
    setCurrentUserId(jwtDecode(localStorage.getItem('jwt')).id);
  },[])
  return (
    <div
      onContextMenu={(e) => {
        e.preventDefault();
        const currentUserId = jwtDecode(localStorage.getItem("jwt")).id;
        const isMessageDiv = e.target.classList.contains("message-div");
        const isMessage =
          e.target.classList.contains("message") ||
          e.target.classList.contains("messageChild");
        if (isMessageDiv) {
          const div = e.target.closest(".message-div");
          const { id, message, senderid: senderId, sendername:senderName } = div.dataset;
          if (currentUserId !== Number(senderId)) setShowEditItem(false);
          else setShowEditItem(true);
          window.getSelection().removeAllRanges();
          show({
            props: { messId: id, text: message,senderId, senderName },
            event: e,
          });
          return;
        }
        if (isMessage) {
          const messageDiv = e.target.closest(".message-div");
          const {
            id,
            message,
            senderid: senderId,
            sendername: senderName,
          } = messageDiv.dataset;
          if (currentUserId !== Number(senderId)) setShowEditItem(false);
          else setShowEditItem(true);
          window.getSelection().removeAllRanges();
          show({
            props: { messId: id, text: message,senderId, senderName },
            event: e,
          });
          return;
        }
      }}
      ref={containerRef}
      className="chat-container bg-[var(--surface)] py-7  lg:pb-7 lg:pt-5 relative h-full overflow-auto text-[var(--text)] px-5 flex flex-col gap-3"
    >
      {isFetching && <Spinner />}
      {!isFetching &&
        chats?.length > 0 &&
        messages?.map((el, i, arr) => (
          <div key={i}>
            {i === 0 && <ShowDate dateString={el?.time} />}
            {i !== 0 &&
              (new Date(el?.time).getDate() !==
                new Date(arr[i - 1]?.time).getDate() ||
                new Date(el?.time).getMonth() !==
                  new Date(arr[i - 1]?.time).getMonth() ||
                new Date(el?.time).getFullYear() !==
                  new Date(arr[i - 1]?.time).getFullYear()) && (
                <ShowDate dateString={el?.time} />
              )}
            <Message
              currentUserId={currentUserId}
              key={i}
              message={el}
              setScroll={setScroll}
              setMessages={setMessages}
            />
          </div>
        ))}
      {!isFetching && chats?.length > 0 && (
        <Menu id={MENU_ID} theme="dark" animation="slide">
          {showEditItem && (
              <Item id="edit" onClick={handleUpdate} className="w-full">
                <span className="w-full flex items-center gap-2">
                  <FaEdit className="text-blue-400 " /> Edit
                </span>
              </Item>
          )}
          {showEditItem && <Separator />}
         {showEditItem && <Item
            id="delete"
            onClick={handleDelete}
            // onClick={handleItemClick}
            className="w-full"
          >
            <span className="flex items-center gap-2 w-full">
              <FaTrash className="text-red-400" /> Delete
            </span>
          </Item>}
          {showEditItem && <Separator />}
          <Item
            id="copy"
            onClick={({ props }) => {
              window.navigator.clipboard.writeText(props?.text);
            }}
            // onClick={handleItemClick}
            className="w-full"
          >
            <span className="flex items-center gap-2 w-full">
              <MdCopyAll /> Copy
            </span>
          </Item>
          <Separator />
          <Item
            id="copy"
            onClick={handleReply}
            // onClick={handleItemClick}
            className="w-full"
          >
            <span className="flex items-center gap-2 w-full">
              <GoReply /> Reply
            </span>
          </Item>
        </Menu>
      )}
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

function ShowDate({ dateString }) {
  const dateObj = new Date(dateString);

  const day = dateObj.getDate();
  const month = dateObj.getMonth();
  const year = dateObj.getFullYear();

  const today = new Date();
  const isToday =
    today.getDate() === day &&
    today.getMonth() === month &&
    today.getFullYear() === year;

  let date = `${day} ${dateObj.toLocaleString("default", {
    month: "long",
  })}, ${year}`;

  const differenceInDays = Math.abs(differenceInCalendarDays(dateObj, today));

  if (differenceInDays < 7) {
    date = format(dateObj, "EEEE");
  }

  return (
    <div className="w-full my-3 text-sm lg:text-md flex justify-center items-center">
      <p className="bg-[var(--muted)] py-2 px-4 rounded-md shadow-sm">
        {isToday ? "Today" : date}
      </p>
    </div>
  );
}


export default ChatContainer;
function Message({ message, setScroll, setMessages, currentUserId }) {
  const time = format(new Date(message?.time), "HH:mm");
  if (message.Type === "text" || message.Type === "text-reply")
    return (
      <div
        className={`w-full rounded-sm message-div`}
        data-message={message?.message}
        data-id={message?.id}
        data-senderid={message?.senderId}
        data-sendername={message?.sender?.name}
      >
        <p
          className={`message relative flex flex-col message rounded-sm px-2 py-2 w-fit max-w-3/4 lg:max-w-[45%]  break-words ${
            currentUserId === Number(message?.senderId)
              ? "ml-auto bg-green-900"
              : "bg-[var(--muted)]"
          }`}
        >
          {message?.isEdited && (
            <span className="messageChild pl-2 tracking-wider text-xs opacity-90 mb-1">
              edited
            </span>
          )}
          {message.Type === "text-reply" && (
            <>
              <span
                className={`messageChild ${
                  currentUserId === message?.senderId
                    ? "bg-green-400/10 border-l-green-400"
                    : "bg-gray-500/10 border-l-green-800"
                }  border-l-5  text-sm flex flex-col px-2 py-1 gap-1 mb-2 w-[100%] rounded-sm`}
              >
                <span className="messageChild text-green-500 font-bold">
                  {Number(message?.replyTextSenderId) === currentUserId
                    ? "You"
                    : message?.replyTextSender?.name}
                </span>
                <span className="messageChild">{message?.replyText}</span>
              </span>
              <span className="messageChild messageChild text-xs right-2 bottom-1 absolute flex gap-1 items-center"></span>
            </>
          )}
          <span className="messageChild mr-17 pl-2">{message?.message}</span>
          {/* {message?.message} */}
          <span className="messageChild text-xs right-2 bottom-1 absolute flex gap-1 items-center">
            {time}
            {message?.senderId === currentUserId && (
              <>
                <BiCheckDouble
                  className={`text-lg messageChild ${
                    message?.placeholder ? "hidden" : "block"
                  } ${message?.isRead && "text-blue-400"}`}
                />
                <BiCheck
                  className={`text-lg messageChild ${
                    message?.placeholder ? "block" : "hidden"
                  }`}
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
            <p className="tracking-wide ">{message.caption}</p>
          )}
          <span
            className={`text-xs ${
              message?.caption ? "right-2 bottom-1" : "right-3 bottom-2"
            }  absolute flex gap-1 items-center`}
          >
            {time}
            {message?.senderId === currentUserId && (
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
          className={`relative py-2  w-[85%] lg:w-fit lg:min-w-[35%] lg:max-w-[35%] ${
            currentUserId === Number(message?.senderId) ? "ml-auto " : ""
          }`}
        >
          <AudioPlayer
            src={message?.mediaUrl}
            className={
              message?.senderId === currentUserId
                ? "audio-player audio-sended"
                : "audio-player audio-recieved"
            }
            layout="horizontal-reverse"
            defaultDuration={["00:00"]}
            defaultCurrentTime={["00:00"]}
            showJumpControls={false}
            preload="metadata"
            customAdditionalControls={[]} // ❗ Make sure this is not hiding play
            customVolumeControls={["volume"]} // Optional
          />
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
