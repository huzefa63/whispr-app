'use client';
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import ModelWindow from "./ModelWindow";
import { UseSocketContext } from "./SocketProvider";
import { useGlobalState } from "./GlobalStateProvider";
import toast from "react-hot-toast";
import { editAndSendMessage, handleAudioSubmit, handleMediaSubmit, handleSubmit, sendMessage, updateMessagesBySetMessages } from "../_services/message";
import FileLabel from "./_controller/FileLabel";
import ClearAudioButton from "./_controller/ClearAudioButton";
import SendImageWindow from "./_controller/SendImageWindow";
import Input_Reply_Edit from "./_controller/Input_Reply_Edit";
import CustomAudioPlayer from "./CustomAudioPlayer";
import SendAudioButton from "./_controller/SendAudioButton";
import RecordAudioButton from "./_controller/RecordAudioButton";
import Save_Discard_reply_Edit_Button from "./_controller/Save_Discard_reply_Edit_Button";
import FileInput from "./_controller/FileInput";
import { returnJwtAndUserId } from "../_services/auth";
import { getMedia } from "../_services/audioRecording";

function ChatController() {
    const {setMessages,setEditMessage,editMessage,setReplyMessage,replyMessage} = useGlobalState();
    const inputRef = useRef(null);
    const [message,setMessage] = useState('');
    const searchParams = useSearchParams();
    const [mediaUrl,setMediaUrl] = useState('');
    const [media,setMedia] = useState(null);
    const [caption,setCaption] = useState("");
    const fileRef = useRef(null);
    const [loading,setLoading] = useState(false);
    const [isRecording,setIsRecording] = useState(false);
    const {socket} = UseSocketContext();
    const recordingRef = useRef(null);
    const streamRef = useRef(null);
    const [audioSrc,setAudioSrc] = useState('');
    const [audioBlob,setAudioBlob] = useState(null);
    const [isSendingAudio,setIsSendingAudio] = useState(false);
    const [seconds,setSeconds] = useState(0);
    const params = useSearchParams();

    useEffect(() => {
      setEditMessage({isEditing:false,messageId:null,text:''});
    },[params])

    function submitHandler(e){
      handleSubmit(e, {
        jwtDecode, // function to decode JWT
        searchParams, // usually from useSearchParams() in Next.js/React Router
        params, // usually from useParams()
        audioBlob, // Blob object for audio message
        media, // File or media object for image/video
        caption, // string caption for media
        fileRef, // ref for file input
        replyMessage, // { isReplying, messageId, senderId, senderName, text }
        editMessage, // { isEditing, messageId, oldText }
        inputRef, // ref for the text input
        setAudioBlob, // React state setter
        setAudioSrc, // React state setter
        setIsSendingAudio, // React state setter
        setMessage, // React state setter
        setLoading, // React state setter
        setMediaUrl, // React state setter
        setCaption, // React state setter
        setMedia, // React state setter
        setMessages, // React state setter
        setReplyMessage, // React state setter
        setEditMessage, // React state setter
        handleAudioSubmit, // function to handle audio upload
        handleMediaSubmit, // function to handle media upload
        updateMessagesBySetMessages, // function to update messages in UI
        sendMessage, // function to send text message to backend
        editAndSendMessage, // function to edit and send message
        toast, // usually from react-toastify or similar
        message
      });
    }
    useEffect(()=>{
      let recordingInterval;
      let audioChunks = [];
        getMedia(setSeconds,recordingRef,streamRef,inputRef,setAudioSrc,setAudioBlob,isRecording,recordingInterval,audioChunks);
        return () => {
          if(recordingRef.current) recordingRef.current = null;
          if(inputRef.current) inputRef.current.placeholder = "Type a message...";
          if(streamRef.current){
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
          }
          clearInterval(recordingInterval);
          setAudioBlob(null);
          setAudioSrc('');
        }
    },[isRecording])

    useEffect(()=>{
      if(isRecording || audioSrc && inputRef.current){
        const hours = Math.floor((seconds / 3600)).toString().padStart(2,'0');
        const minutes = Math.floor(((seconds % 3600) / 60)).toString().padStart(2,'0');
        const second = (seconds % 60).toString().padStart(2,'0');
        if(inputRef.current) inputRef.current.placeholder = `${hours}:${minutes}:${second} recording audio...`;
      }
    },[seconds,audioSrc,isRecording])
    
    useEffect(()=>{
      if(!socket || message.length === 0) return;
      const {jwt,userId} = returnJwtAndUserId();
      console.log(searchParams.get('friendId'));
      socket.emit("typing", { typerId: userId, toTypingId: Number(searchParams.get("friendId"))});
    },[message,socket])

    useEffect(() => {
      if(editMessage?.text){
        setMessage(editMessage.text);
        inputRef?.current?.focus();
      }
      if(replyMessage.text) inputRef?.current?.focus();
    },[editMessage.text,replyMessage.text])
    function closeModelWindow() {
      setMediaUrl(null);
      setMedia(null);
      fileRef.current.value = "";
    }
  return (
    <form
      onSubmit={submitHandler}
      className={`h-full min-w-full max-w-full w-full gap-1  bg-[var(--surface)] grid grid-cols-8  lg:flex items-center px-2 lg:px-3 `}
    >
      <div className="relative">
        {!audioSrc && <FileLabel message={message} audioSrc={audioSrc} isRecording={isRecording}/>}
        {audioSrc && !isRecording && <ClearAudioButton setAudioBlob={setAudioBlob} setIsRecording={setIsRecording} setAudioSrc={setAudioSrc}/>}
      </div>

      {mediaUrl && (
        <ModelWindow close={closeModelWindow}>
          <SendImageWindow loading={loading} caption={caption} setCaption={setCaption} mediaUrl={mediaUrl} closeModelWindow={closeModelWindow}/>
        </ModelWindow>
      )}
 
      <FileInput message={message} audioSrc={audioSrc} isRecording={isRecording} fileRef={fileRef} setMedia={setMedia} setMediaUrl={setMediaUrl}/>

      {!audioSrc && <Input_Reply_Edit inputRef={inputRef} message={message} setMessage={setMessage} mediaUrl={mediaUrl} editMessage={editMessage} replyMessage={replyMessage}/>}
      {audioSrc && (
        <div className="w-full col-span-6 ">
         <CustomAudioPlayer audioSrc={audioSrc}/>
        </div>
      )}
      <div className="relative">
        {((!isRecording && message.length > 0 && !editMessage.isEditing && !replyMessage.isReplying) ||
          audioSrc) && (
         <SendAudioButton isRecording={isRecording} isSendingAudio={isSendingAudio} mediaUrl={mediaUrl}/>
        )}

        {message.length < 1 && !audioSrc && !editMessage.isEditing && !replyMessage.isReplying && (
          <RecordAudioButton isRecording={isRecording} setIsRecording={setIsRecording} streamRef={streamRef} mediaUrl={mediaUrl}/>
        )}

        {(editMessage.isEditing || replyMessage.isReplying) && (
          <Save_Discard_reply_Edit_Button editMessage={editMessage} replyMessage={replyMessage} setEditMessage={setEditMessage} setReplyMessage={setReplyMessage}/>
        )}
      </div>
    </form>
  );
} 
export default ChatController;
  /* {isDown && (
        <div className={`absolute h-12 w-12 p-2 bg-[var(--background)] rounded-full flex items-center justify-center bottom-20 right-10 border-[var(--border)] border-1 z-[500] duration-[5000] transition-opacity ease-in-out opacity-0 ${isDown && 'opacity-100'} `}>
          <IoChevronDownSharp className="text-white" />
        </div>
      )} */
