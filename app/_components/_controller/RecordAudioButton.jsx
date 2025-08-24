import { IoMdMic, IoMdMicOff } from "react-icons/io";

function RecordAudioButton({ isRecording, mediaUrl, setIsRecording, streamRef }) {
  function startRecording() {
    setIsRecording(true);
  }
  function stopRecording() {
    setIsRecording(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((tracks) => tracks.stop());
    }
  }
  return (
    <button
      onClick={!isRecording ? startRecording : stopRecording}
      disabled={mediaUrl}
      type="button"
      className="disabled:cursor-not-allowed"
    >
      <div
        className={`${
          isRecording && "bg-red-500  transition-all hover:bg-red-600"
        } bg-green-500 hover:bg-green-600 p-3 rounded-full flex justify-center items-center w-12 h-12`}
      >
        {!isRecording && <IoMdMic className="text-[var(--text)] text-2xl" />}
        {isRecording && <IoMdMicOff className="text-[var(--text)] text-2xl" />}
      </div>
    </button>
  );
}

export default RecordAudioButton;
