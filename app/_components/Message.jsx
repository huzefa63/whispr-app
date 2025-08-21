import { BiCheck, BiCheckDouble } from "react-icons/bi";
import AudioMessage from "./AudioMessage";
import ImageMessage from "./ImageMessage";
import TextMessage from "./TextMessage";
import { format } from "date-fns";

function Message({ message, currentUserId }) {
  const time = format(new Date(message?.time), "HH:mm");
  if (message.Type === "text" || message.Type === "text-reply") return <TextMessage message={message} currentUserId={currentUserId} time={time}/>
  if (message.Type === "image") return <ImageMessage message={message} currentUserId={currentUserId} time={time}/> 
  if (message.Type === "audio") return <AudioMessage message={message} time={time} currentUserId={currentUserId}/>
}
export default Message;