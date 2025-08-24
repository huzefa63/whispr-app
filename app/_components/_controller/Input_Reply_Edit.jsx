import { Poppins } from "next/font/google";

const poppins = Poppins({
    subsets:['latin'],
    variable:'poppins',
    weight:'500'
})
function Input_Reply_Edit({inputRef,editMessage,replyMessage,message,setMessage,mediaUrl}) {
    return (
      <div
        className={`${
          editMessage.isEditing || replyMessage.isReplying
            ? "col-span-5"
            : "col-span-6"
        } lg:flex-1 h-3/4 relative`}
      >
        {replyMessage.isReplying && (
          <div className="min-h-12 z-[1000] flex items-center px-1 justify-between text-white absolute -top-1 -translate-y-full rounded-md w-full py-2 break-words bg-gray-700">
            <div className="w-full border-l-5 border-green-500 bg-gray-600/50 pl-3 py-2 rounded-sm">
              <p className="text-sm opacity-80">{replyMessage.senderName}</p>
              <p className="">{replyMessage.text}</p>
            </div>
          </div>
        )}

        {editMessage.isEditing && (
          <div className="min-h-12 z-[1000] flex items-center px-4 justify-between text-white absolute -top-1 -translate-y-full rounded-md w-full py-1 break-words bg-gray-600">
            <div className="w-full">
              <p className="text-sm opacity-80">Editing message</p>
              <p className="">{editMessage.text}</p>
            </div>
          </div>
        )}

        <input
          disabled={mediaUrl}
          onChange={(e) => setMessage(e.target.value)}
          value={message}
          ref={inputRef}
          type="text"
          placeholder="Type a message"
          className={`${poppins.className} w-full h-full bg-[var(--muted)] rounded-full  disabled:cursor-not-allowed   focus:outline-none  text-[var(--text)] px-5  tracking-wider`}
        />
      </div>
    );
}

export default Input_Reply_Edit