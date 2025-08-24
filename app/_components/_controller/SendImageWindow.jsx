import { IoIosSend } from "react-icons/io";
import Spinner from "../Spinner";

function SendImageWindow({loading,caption,setCaption,mediaUrl,closeModelWindow}) {
    return (
      <form className="bg-[var(--background)] z-[10000] relative flex flex-col p-10 w-[95%] rounded-2xl lg:w-fit min-h-fit max-h-[95%] lg:min-h-3/4 lg:max-h-[90%] border-[var(--border)] border-1  overflow-auto">
        <div className="w-full">
          <img
            src={mediaUrl}
            className="lg:w-1/2 w-[90%] mx-auto bg-green-800"
          ></img>
        </div>
        <div className="flex gap-2 mt-3">
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            type="text"
            placeholder=" write caption here..."
            className="border-gray-400 resize-none border-1 bg-[var(--surface)] lg:py-1 px-5 w-full  text-[var(--text)]"
          />
          <button
            type="submit"
            className="hover:cursor-pointer bg-[var(--muted)] p-2 hover:bg-stone-700 relative"
          >
            <IoIosSend
              className={`text-[var(--text)] lg:text-3xl text-2xl ${
                loading && "opacity-0"
              }`}
            />
            {loading && <Spinner />}
          </button>
        </div>
        <button
          onClick={closeModelWindow}
          type="button"
          className="absolute hover:cursor-pointer  text-[var(--text)]  top-2 right-2 text-2xl lg:p-1 lg:px-1 px-2 h-12 w-12 hover:bg-[var(--muted)]"
        >
          x
        </button>
      </form>
    );
}

export default SendImageWindow
