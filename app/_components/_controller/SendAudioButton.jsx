import { IoIosSend } from "react-icons/io";
import Spinner from "../Spinner";

function SendAudioButton({mediaUrl,isRecording,isSendingAudio}) {
    return (
      <button
        disabled={mediaUrl || isRecording || isSendingAudio}
        type="submit"
        className="disabled:cursor-not-allowed"
      >
        <div
          className={`${
            isRecording && "bg-red-500  transition-all hover:bg-red-600"
          } bg-green-500 hover:bg-green-600 p-3 rounded-full flex justify-center items-center relative w-12 h-12`}
        >
          <div className={`${isSendingAudio && "opacity-0"}`}>
            <IoIosSend className="text-[var(--text)] text-2xl" />
          </div>
          {isSendingAudio && <Spinner />}
        </div>
      </button>
    );
}

export default SendAudioButton
