import { MdOutlineAttachFile } from "react-icons/md";

function FileLabel({message,audioSrc,isRecording}) {
  return (
    <label
      htmlFor="media"
      className={` flex justify-center items-center bg-[var(--muted)] rounded-full w-12 h-12 lg:w-14 lg:h-14 z-50 hover:bg-stone-700 ${
        message.length > 0 || audioSrc || isRecording
          ? "hover:cursor-not-allowed"
          : "hover:cursor-pointer"
      }`}
    >
      <MdOutlineAttachFile className="text-[var(--text)] text-2xl" />
    </label>
  );
}

export default FileLabel;
