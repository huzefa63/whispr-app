'use client';
import { MdOutlineAttachFile } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";
import { IoIosSend, IoMdCheckmark } from "react-icons/io";
import { Poppins } from "next/font/google";
import { useEffect, useRef, useState } from "react";
// import sendMessage from '@/actions/messageActions'
import { useSearchParams } from "next/navigation";
import axios from "axios";
import Spinner from "./Spinner";
import { jwtDecode } from "jwt-decode";
import ModelWindow from "./ModelWindow";
import { IoMdMic,IoMdMicOff } from "react-icons/io";
import { UseSocketContext } from "./SocketProvider";
import { BsChatDotsFill } from "react-icons/bs";
import { FaTrash } from "react-icons/fa";
import AudioPlayer from "react-h5-audio-player";
import { useGlobalState } from "./GlobalStateProvider";
import toast from "react-hot-toast";
import { createPortal } from "react-dom";

// import connectSocket from "@/lib/socket";
// import { UseSocketContext } from "./SocketProvider";
const poppins = Poppins({
    subsets:['latin'],
    variable:'poppins',
    weight:'500'
})
    


function ChatController() {
    const {setMessages,userTypingId,setEditMessage,editMessage,isHideController} = useGlobalState();
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
    async function handleMediaSubmit(media, caption, jwt, recieverId) {
      const formData = new FormData();
      formData.append("media", media);
      formData.append("caption", caption || "");
      formData.append("recieverId", recieverId);
      try {
        setLoading(true);
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
        setMessage("");
      } catch (err) {
        console.log(err);
      }finally{
        fileRef.current.value = "";
        setLoading(false);
        setMediaUrl("");
        setCaption('');
        setMedia(null);
      }
    }

    async function handleAudioSubmit(audioBlob,jwt,recieverId){
      const formData = new FormData();
      formData.append("media", audioBlob);
      formData.append("recieverId", recieverId);
      try {
        setIsSendingAudio(true);
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
        setMessage("");
      } catch (err) {
        console.log(err);
      } finally {
        setIsSendingAudio(false);
        setLoading(false);
        setAudioBlob(null);
        setAudioSrc('');

      }
    }
    async function handleSubmit(e){
      e.preventDefault();
      const jwt = localStorage.getItem("jwt");
      const payload = jwtDecode(jwt);
      const recieverId = searchParams.get("friendId");
      if(jwt && audioBlob) {
        await handleAudioSubmit(audioBlob, jwt, recieverId);
        return;
      }
      if(jwt && media) {
        await handleMediaSubmit(media, caption, jwt, recieverId);
        return;
      }
      if(jwt && !media && message && !editMessage.isEditing) {
        const uniqueId = `${Date.now()}-${Math.round(Math.random() * 10000000)}`
        const data = {
          message,
          recieverId,
          uniqueId,
        };
        setMessage("");
        setMessages(el => [...el,{isRead:false,uniqueId,placeholder:true,message,recieverId:Number(recieverId),senderId:payload.id,Type:'text',time:new Date().toISOString()}])
       inputRef?.current?.focus();
        console.log('scroll to true from controller');
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
      if(editMessage.isEditing){
        if(message.length < 1){
          toast.error('type something to update it');
          return;
        }
          setMessage("");
          setMessages((mess) => {
            return mess.map((el) => {
              if (el.id === editMessage.messageId) {
                return { ...el, message: message, isEdited:true };
              } else {
                return el;
              }
            });
          });
          setEditMessage({ isEditing: false, messageId:null ,text: "" });

          inputRef?.current?.focus();
          
          try {
            const res = await axios.patch(
              `${process.env.NEXT_PUBLIC_BACKEND_URL}/message/updateMessage/${editMessage.messageId}`,
              { message,otherUser:params.get('friendId') },
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
    }

    function closeModelWindow(){
        setMediaUrl(null);
        setMedia(null);
        fileRef.current.value = "";
    }
    function handleSelectMedia(e){
      setMedia(e.target.files[0]);
      const reader = new FileReader();
      reader.onload = () => {
        setMediaUrl(reader.result);
      }
      reader.readAsDataURL(e.target.files[0])
    }

    useEffect(()=>{
      const audioChunks = [];
      let recordingInterval;
        async function getMedia(){
          if(!isRecording) return;
          setSeconds(0);
          recordingInterval = setInterval(() => {
            setSeconds(seconds => seconds + 1);
          }, 1000);
          const stream = await navigator.mediaDevices.getUserMedia({audio:true});
          recordingRef.current = new MediaRecorder(stream);
          streamRef.current = stream;
          recordingRef.current.start();
          if(inputRef.current){
            inputRef.current.disabled = true;
          }
          
          recordingRef.current.ondataavailable = (event) => {
            audioChunks.push(event.data);
          }
          recordingRef.current.onstop = (event) => {
            clearInterval(recordingInterval);
            if(inputRef.current){
              inputRef.current.disabled = false;
              inputRef.current.placeholder = "Type a message...";
            }
            const audioBlob = new Blob(audioChunks,{type:'audio/webm'})
            const audioSrc =  URL.createObjectURL(audioBlob);
            setAudioSrc(audioSrc);
            setAudioBlob(audioBlob);
          }
        }
        getMedia();
        return () => {
          if(recordingRef.current){
            recordingRef.current = null;
          }
          if(streamRef.current){
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
          }
          if(inputRef.current){
            inputRef.current.placeholder = "Type a message...";
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
        inputRef.current.placeholder = `${hours}:${minutes}:${second} recording audio...`
      }
    },[seconds,audioSrc,isRecording])
    
    function clearAudio(){
      setIsRecording(false);
      setAudioBlob(null);
      setAudioSrc('');
      
      
    }
    function startRecording(){
      setIsRecording(true);
      
    }
    function stopRecording(){
      setIsRecording(false);
      if(streamRef.current){
        streamRef.current.getTracks().forEach(tracks => tracks.stop());
      }
    }
    useEffect(()=>{
      if(!socket) return;
      if(message.length === 0) return;
      const jwt = localStorage.getItem('jwt');
      const userId = jwtDecode(jwt)?.id;
      console.log(searchParams.get('friendId'));
      socket.emit("typing", { typerId: userId, toTypingId: Number(searchParams.get("friendId"))});
    },[message,socket])

    useEffect(() => {
      setMessage(editMessage.text);
       inputRef?.current?.focus();
    },[editMessage.text])
  return (
    <form
      onSubmit={handleSubmit}
      className={`h-full min-w-full max-w-full w-full gap-1  bg-[var(--surface)] grid grid-cols-8  lg:flex items-center px-2 lg:px-3 `}
    >
      {/* <div className=""> */}
      <div className="relative">
        {!audioSrc && (
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
        )}
        {audioSrc && !isRecording && (
          <button
            onClick={clearAudio}
            type="button"
            className=" flex hover:cursor-pointer justify-center items-center bg-red-500 hover:bg-red-600 rounded-full w-12 h-12 lg:w-14 lg:h-14 z-50"
          >
            <FaTrash className="text-[var(--text)] text-xl" />
          </button>
        )}
        {userTypingId == searchParams.get("friendId") && (
          <div className="absolute  w-fit   rounded-3xl lg:-top-7 lg:-left-1 -top-8 left-3 flex items-center gap-3">
            <BsChatDotsFill className=" text-xl text-green-500" />
            {/* <p className="text-green-500">typing...</p> */}
          </div>
        )}
      </div>

      {mediaUrl && (
        <ModelWindow close={closeModelWindow}>
          <form className="bg-[var(--background)] relative flex flex-col p-10 w-[95%] rounded-2xl lg:w-fit min-h-fit max-h-[95%] lg:min-h-3/4 lg:max-h-[90%] border-[var(--border)] border-1  overflow-auto">
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
        </ModelWindow>
      )}

      <input
        disabled={message.length > 0 || audioSrc || isRecording}
        ref={fileRef}
        hidden
        onChange={handleSelectMedia}
        type="file"
        name="media"
        id="media"
      />
      {!audioSrc && (
        <div
          className={`${
            editMessage.isEditing ? "col-span-5" : "col-span-6"
          } lg:flex-1 h-3/4 relative`}
        >
          
          {editMessage.isEditing && (
            <div className="min-h-12 z-[1000] flex items-center px-4 justify-between text-white absolute -top-1 -translate-y-full rounded-md w-full py-1 break-words bg-gray-600">
              <div className="w-full">
                <p className="text-sm opacity-80">editing message</p>
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
      )}
      {/* {audioSrc && (
        <audio
          controlsList="nodownload"
          src={audioSrc}
          controls
          className={`${poppins.className} opacity-70 rounded-full col-span-6 disabled:cursor-not-allowed lg:flex-1 h-3/4 focus:outline-none  text-[var(--text)] px-5  tracking-wider`}
        />
      )} */}
      {audioSrc && (
        <div className="w-full col-span-6 ">
          <AudioPlayer
            className="rhap_current-time rhap_total-time audio-player"
            src={audioSrc}
            layout="horizontal-reverse"
            showJumpControls={false}
            showSkipControls={false}
            customVolumeControls={["volume"]} // Optional
            // customControlsSection={["mainControls", "progressBar"]} // No "volumeControls"
            defaultDuration={["00:00"]}
            defaultCurrentTime={["00:00"]}
            customAdditionalControls={[]} // ❗ Make sure this is not hiding play
            // Optional
          />
        </div>
      )}
      <div className="relative">
        {((!isRecording && message.length > 0 && !editMessage.isEditing) ||
          audioSrc) && (
          <button
            disabled={mediaUrl || isRecording}
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
        )}
        {message.length < 1 && !audioSrc && !editMessage.isEditing && (
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
              {!isRecording && (
                <IoMdMic className="text-[var(--text)] text-2xl" />
              )}
              {isRecording && (
                <IoMdMicOff className="text-[var(--text)] text-2xl" />
              )}
            </div>
          </button>
        )}
        {editMessage.isEditing && (
          <div className="flex items-center gap-1 min-w-fit lg:w-32 flex-1">
            <button
              type="button"
              onClick={() =>
                setEditMessage({
                  isEditing: false,
                  messageId: null,
                  text: "",
                })
              }
              className="lg:py-3 py-2 px-3 hover:bg-red-600 hover:cursor-pointer lg:px-4 rounded-md bg-red-500 lg:text-xl"
            >
              <RxCross2 />
            </button>
            <button
              onClick={async () => {
                const jwt = localStorage.getItem("jwt");
                //            setMessage("");
                //  setMessages(mess => {
                //   return mess.map(el => {
                //     if(el.id === editMessage.messageId){
                //       return {...el,message:message}
                //     }else{
                //       return el;
                //     }
                //   })
                //  })
                //  inputRef?.current?.focus();
                //     setEditMessage({ isEditing: false, messageId: null, text: "" });

                //   try {
                //     const res = await axios.patch(
                //       `${process.env.NEXT_PUBLIC_BACKEND_URL}/message/updateMessage/${editMessage.messageId}`,
                //       {message},
                //       {
                //         headers: {
                //           Authorization: `jwt=${jwt}`,
                //         },
                //       }
                //     );
                //     console.log(res);
                //   } catch (err) {
                //     console.log(err);
                //   }
              }}
              className="lg:py-3 py-2 px-3 hover:bg-green-600 hover:cursor-pointer lg:px-4 rounded-md bg-green-500"
            >
              <IoMdCheckmark className="lg:text-xl" />
            </button>
          </div>
        )}
      </div>
      {/* {isDown && (
        <div className={`absolute h-12 w-12 p-2 bg-[var(--background)] rounded-full flex items-center justify-center bottom-20 right-10 border-[var(--border)] border-1 z-[500] duration-[5000] transition-opacity ease-in-out opacity-0 ${isDown && 'opacity-100'} `}>
          <IoChevronDownSharp className="text-white" />
        </div>
      )} */}
    </form>
  );
} 

export default ChatController;



