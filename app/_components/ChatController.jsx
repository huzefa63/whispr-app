'use client';
import { MdOutlineAttachFile } from "react-icons/md";
import { IoIosSend } from "react-icons/io";
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
import { IoChevronDownSharp } from "react-icons/io5";

// import connectSocket from "@/lib/socket";
// import { UseSocketContext } from "./SocketProvider";
const poppins = Poppins({
    subsets:['latin'],
    variable:'poppins',
    weight:'500'
})
    


function ChatController({setMessages,setScroll,userTypingId,containerRef}) {
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
  const [isDown, setIsDown] = useState(false);
    const speechRef = useRef(null);
  const friendId = searchParams.get('friendId');

    // useEffect(() => {
        // console.log(
        //   Object.keys(document.activeElement).length < 1,
        //   document.activeElement
        // );
        // function handleKeyDown(){
        //     if(inputRef.current && document.activeElement !== inputRef.current){
        //         inputRef.current.focus();
        //     }
        // }
        // document.addEventListener('keydown',handleKeyDown);
        // return () => document.removeEventListener('keydown',handleKeyDown);
        // document.documentElement.classList.add('dark');
        // inputRef.current.focus();
    // }, [friendId]);
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
    async function handleSubmit(e){
      e.preventDefault();
      const jwt = localStorage.getItem("jwt");
      const payload = jwtDecode(jwt);
      const recieverId = searchParams.get("friendId");
      if(jwt && media) await handleMediaSubmit(media,caption,jwt,recieverId);
      if(jwt && !media && message) {
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
      if(!socket) return;
      if(message.length === 0) return;
      const jwt = localStorage.getItem('jwt');
      const userId = jwtDecode(jwt)?.id;
      console.log(searchParams.get('friendId'));
      socket.emit("typing", { typerId: userId, toTypingId: Number(searchParams.get("friendId"))});
    },[message,socket])

    // useEffect(() => {
    //   if (!containerRef.current) return;
    //   console.log(containerRef.current);
    //   let timeout;
    //   function scrollBottom(){
    //     if (containerRef.current.scrollTop < containerRef.current.scrollHeight){
    //       setIsDown(false);
    //       return;
    //     }
    //       if (
    //         containerRef.current.scrollTop < containerRef.current.scrollHeight
    //       ) {
    //         setIsDown(true);
    //         clearTimeout(timeout);
    //         timeout = setTimeout(() => {
    //           setIsDown(false);
    //         }, 4000);
    //       }
         
    //   }
    //   containerRef.current.addEventListener("scroll", scrollBottom);
    //   return () => containerRef.current.removeEventListener('scroll',scrollBottom);
    // }, []);
    useEffect(()=>{
      
        const recognition = new (window.webkitSpeechRecognition || window.speechRecognition)();
        speechRef.current = recognition;
        speechRef.current.lang = window.navigator.language;
        speechRef.current.continuous = true;
        speechRef.current.interimResults = true;
        return () => speechRef.current = null; 
    },[])
  return (
    <form
      onSubmit={handleSubmit}
      className="h-full max-w-full gap-1 z-[1000]  bg-[var(--surface)] grid grid-cols-8  lg:flex items-center px-2 lg:px-3"
    >
      {/* <div className=""> */}
      <div className="relative">
        <label
          htmlFor="media"
          className="hover:cursor-pointer flex justify-center items-center bg-[var(--muted)] rounded-full w-12 h-12 lg:w-14 lg:h-14 z-50 hover:bg-stone-700"
        >
          <MdOutlineAttachFile className="text-[var(--text)] text-2xl" />
        </label>
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
        ref={fileRef}
        hidden
        onChange={handleSelectMedia}
        type="file"
        name="media"
        id="media"
      />
      <input
        disabled={mediaUrl}
        onChange={(e) => setMessage(e.target.value)}
        value={message}
        ref={inputRef}
        type="text"
        placeholder="Type a message"
        className={`${poppins.className} bg-[var(--muted)] rounded-full col-span-6 disabled:cursor-not-allowed lg:flex-1 h-3/4 focus:outline-none  text-[var(--text)] px-5  tracking-wider`}
      />
      <div className="relative">
      <button
        onClick={() => {
            if(!isRecording){
              setIsRecording(true);
              speechRef.current.start();
              inputRef.current.disabled = true;
            }
            // if(isRecording){
            //   setIsRecording(false);
            //   speechRef.current.stop();
            //   inputRef.current.disabled = false;
            // }
            speechRef.current.onresult = (event) => {
              const result = event.results[0][0];
             inputRef.current.value = result.transcript;
                // setMessage(result.transcript);
                if(event.results[0].isFinal) {
                  setMessage(result.transcript);
                  setIsRecording(false);
                  speechRef.current.stop();
                  inputRef.current.disabled = false;

                };
          
            }
            speechRef.current.onend = () => {
              setIsRecording(false);
              speechRef.current.stop();
              inputRef.current.disabled = false;
              
            }
          }
        }
        disabled={mediaUrl}
        type={message.length > 0 && !isRecording ? "submit" : "button"}
        className="disabled:cursor-not-allowed"
      >
        <div
          className={`${
            isRecording && "bg-red-500  transition-all hover:bg-red-600"
          } bg-green-500 hover:bg-green-600 p-3 rounded-full flex justify-center items-center w-12 h-12`}
        >
          {message.length > 0 && !isRecording && (
            <IoIosSend className="text-[var(--text)] text-2xl" />
          )}
          {message.length < 1 && !isRecording && (
            <IoMdMic className="text-[var(--text)] text-2xl" />
          )}
          {isRecording && (
            <IoMdMicOff className="text-[var(--text)] text-2xl" />
          )}
          {/* {message.length > 0 && !isRecording && (
            <IoIosSend className="text-[var(--text)] text-2xl" />
          )}
          {message.length < 1 && !isRecording && (
            <IoMdMic className="text-[var(--text)] text-2xl" />
          )}
          {message.length < 1 && isRecording && (
            <IoMdMicOff className="text-[var(--text)] text-2xl" />
          )} */}
        </div>
      </button>
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
