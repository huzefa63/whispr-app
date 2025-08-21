import axios from "axios";
import { contextMenu } from "react-contexify";

export async function getMessages(params, setScroll, setMessages) {
  if (!params) return [];
  const jwt = localStorage.getItem("jwt");
  setScroll(false);
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/message/getMessages?friendId=${params}`,
      {
        headers: {
          Authorization: `jwt=${jwt}`,
        },
      }
    );
    setMessages(res.data.messages);
    console.log(res.data.messages);
    return res.data.messages;
  } catch (err) {
    return [];
  }
}

export async function handleDelete(props, deleteFor, setMessages) {
  const jwt = localStorage.getItem("jwt");
  if (!jwt) return;
  setMessages((mess) => {
    return mess.filter((el) => el.id !== Number(props.messId));
  });
  contextMenu.hideAll();
  try {
    await axios.delete(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/message/deleteMessage?messageId=${props?.messId}&otherUser=${params}&deleteFor=${deleteFor}`,
      {
        headers: {
          Authorization: `jwt=${jwt}`,
        },
      }
    );
  } catch (err) {
    console.log(err);
  }
}

export function handleUpdate(props, setEditMessage) {
  contextMenu.hideAll();
  setEditMessage({
    isEditing: true,
    messageId: Number(props.messId),
    text: props.text,
  });
}

export function handleReply(props, setReplyMessage) {
  contextMenu.hideAll();
  setReplyMessage({
    isReplying: true,
    messageId: Number(props.messId),
    text: props.text,
    senderId: props.senderId,
    senderName: props.senderName,
  });
}

export async function markRead(params, jwt) {
  const res2 = await axios.get(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/message/readMessages/${params}`,
    {
      headers: {
        Authorization: `jwt=${jwt}`,
      },
    }
  );
}

export async function handleMediaSubmit(
  media,
  caption,
  jwt,
  recieverId,
  fileRef,
  stateUpdaters
) {
  const formData = new FormData();
  formData.append("media", media);
  formData.append("caption", caption || "");
  formData.append("recieverId", recieverId);
  try {
    stateUpdaters.setLoading(true);
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/message/sendMessage`,
      formData,
      {
        headers: {
          Authorization: `jwt=${jwt}`,
        },
      }
    );
    console.log(res);
    stateUpdaters.setMessage("");
  } catch (err) {
    console.log(err);
  } finally {
    fileRef.current.value = "";
    stateUpdaters.setLoading(false);
    stateUpdaters.setMediaUrl("");
    stateUpdaters.setCaption("");
    stateUpdaters.setMedia(null);
  }
}

export async function handleAudioSubmit(
  audioBlob,
  jwt,
  recieverId,
  stateUpdaters
) {
  const formData = new FormData();
  formData.append("media", audioBlob);
  formData.append("recieverId", recieverId);
  try {
    stateUpdaters.setIsSendingAudio(true);
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/message/sendMessage`,
      formData,
      {
        headers: {
          Authorization: `jwt=${jwt}`,
        },
      }
    );
    console.log(res);
    stateUpdaters.setMessage("");
  } catch (err) {
    console.log(err);
  } finally {
    stateUpdaters.setIsSendingAudio(false);
    stateUpdaters.setLoading(false);
    stateUpdaters.setAudioBlob(null);
    stateUpdaters.setAudioSrc("");
  }
}

export async function sendMessage(jwt) {
  try {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/message/sendMessage`,
      data,
      {
        headers: {
          Authorization: `jwt=${jwt}`,
        },
      }
    );
    console.log(res);
  } catch (err) {
    console.log(err);
  }
}

export async function editAndSendMessage(
  setMessage,
  setMessages,
  setEditMessage,
  inputRef,
  jwt,
  editMessage
) {
  setMessage("");
  setMessages((mess) => {
    return mess.map((el) => {
      if (el.id === editMessage.messageId) {
        return { ...el, message: message, isEdited: true };
      } else {
        return el;
      }
    });
  });
  setEditMessage({ isEditing: false, messageId: null, text: "" });

  inputRef?.current?.focus();

  try {
    const res = await axios.patch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/message/updateMessage/${editMessage.messageId}`,
      { message, otherUser: params.get("friendId") },
      {
        headers: {
          Authorization: `jwt=${jwt}`,
        },
      }
    );
    console.log(res);
  } catch (err) {
    console.log(err);
  }
}

export function closeModelWindow(setMediaUrl,setMedia,fileRef) {
  setMediaUrl(null);
  setMedia(null);
  fileRef.current.value = "";
}

export function handleSelectMedia(e,setMedia,setMediaUrl) {
  setMedia(e.target.files[0]);
  const reader = new FileReader();
  reader.onload = () => {
    setMediaUrl(reader.result);
  };
  reader.readAsDataURL(e.target.files[0]);
}
