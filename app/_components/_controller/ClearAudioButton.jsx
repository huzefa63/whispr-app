import { FaTrash } from "react-icons/fa";

function ClearAudioButton({setIsRecording,setAudioBlob,setAudioSrc}) {
  function clearAudio() {
    setIsRecording(false);
    setAudioBlob(null);
    setAudioSrc("");
  }
  return (
    <button
      onClick={clearAudio}
      type="button"
      className=" flex hover:cursor-pointer justify-center items-center bg-red-500 hover:bg-red-600 rounded-full w-12 h-12 lg:w-14 lg:h-14 z-50"
    >
      <FaTrash className="text-[var(--text)] text-xl" />
    </button>
  );
}

export default ClearAudioButton;
