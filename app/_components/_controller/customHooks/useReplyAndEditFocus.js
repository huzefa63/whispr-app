import { useEffect } from "react";

export default function useReplyAndEditFocus(
  editMessage,
  replyMessage,
  inputRef,
  setMessage
) {
  useEffect(() => {
    if (editMessage?.text) {
      setMessage(editMessage.text);
      inputRef?.current?.focus();
    }
    if (replyMessage.text) inputRef?.current?.focus();
  }, [editMessage.text, replyMessage.text, inputRef, setMessage]);
}
