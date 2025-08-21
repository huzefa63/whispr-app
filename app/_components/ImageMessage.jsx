'use client';
import { BiCheckDouble } from "react-icons/bi";
import { useGlobalState } from "./GlobalStateProvider";

function ImageMessage({message, currentUserId, time}) {
  const {setScroll} = useGlobalState();
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
}

export default ImageMessage;
