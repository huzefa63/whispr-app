import { BiCheck, BiCheckDouble } from "react-icons/bi";

function TextMessage({message, currentUserId, time}) {
  return (
    <div
      className={`w-full rounded-sm message-div`}
      data-message={message?.message}
      data-id={message?.id}
      data-senderid={message?.senderId}
      data-sendername={message?.sender?.name}
    >
      <p
        className={`message relative flex flex-col message rounded-sm px-2 py-2 w-fit max-w-3/4 lg:max-w-[45%]  break-words 
        ${ Number(currentUserId) === Number(message?.senderId) ? "ml-auto bg-green-900" : "bg-[var(--muted)]" }`}>
        {message?.isEdited && (
          <span className="messageChild pl-2 tracking-wider text-xs opacity-90 mb-1">
            edited
          </span>
        )}
        {message.Type === "text-reply" && <ReplyMessage message={message} currentUserId={currentUserId}/>}
        <span className="messageChild mr-17 pl-2">{message?.message}</span>
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
}
export default TextMessage;

function ReplyMessage({currentUserId, message}){
    return(
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
    )
}