import { BiCheckDouble } from "react-icons/bi";
import AudioPlayer from "react-h5-audio-player";

function AudioMessage({ message, time, currentUserId }) {
  return (
    <div className="w-full">
      <div
        className={`relative py-2  w-[85%] lg:w-fit lg:min-w-[35%] lg:max-w-[35%]
        ${ currentUserId === Number(message?.senderId) ? "ml-auto " : "" }`}
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
export default AudioMessage;