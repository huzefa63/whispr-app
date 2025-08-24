import { IoMdCheckmark } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";

function Save_Discard_reply_Edit_Button({editMessage,replyMessage,setEditMessage,setReplyMessage}) {
    return (
      <div className="flex items-center gap-1 min-w-fit lg:w-32 flex-1">
        <button
          type="button"
          onClick={() => {
            if (editMessage.isEditing)
              setEditMessage({
                isEditing: false,
                messageId: null,
                text: "",
              });
            else
              setReplyMessage({
                isReplying: false,
                messageId: null,
                text: "",
              }) && !replyMessage.isReplying;
          }}
          className="lg:py-3 py-2 px-3 hover:bg-red-600 hover:cursor-pointer lg:px-4 rounded-md bg-red-500 lg:text-xl"
        >
          <RxCross2 />
        </button>
        <button className="lg:py-3 py-2 px-3 hover:bg-green-600 hover:cursor-pointer lg:px-4 rounded-md bg-green-500">
          <IoMdCheckmark className="lg:text-xl" />
        </button>
      </div>
    );
}

export default Save_Discard_reply_Edit_Button
