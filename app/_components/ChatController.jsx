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
// import connectSocket from "@/lib/socket";
// import { UseSocketContext } from "./SocketProvider";
const poppins = Poppins({
    subsets:['latin'],
    variable:'poppins',
    weight:'500'
})
    


function ChatController({setMessages,setScroll}) {
    const inputRef = useRef(null);
    const [message,setMessage] = useState('');
    const searchParams = useSearchParams();
    const [mediaUrl,setMediaUrl] = useState('');
    const [media,setMedia] = useState(null);
    const [caption,setCaption] = useState("");
    const fileRef = useRef(null);
    const [loading,setLoading] = useState(false);
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
        const data = {
          message,
          recieverId,
        };
        setMessage("");
        setMessages(el => [...el,{placeholder:true,message,recieverId:Number(recieverId),senderId:payload.id,Type:'text',time:new Date().toISOString()}])
       
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
  return (
    <form
      onSubmit={handleSubmit}
      className="h-full max-w-full gap-1 z-[1000]  bg-[var(--surface)] grid grid-cols-8  lg:flex items-center px-2 lg:px-3"
    >
      {/* <div className=""> */}
      <label
        htmlFor="media"
        className="hover:cursor-pointer flex justify-center bg-[var(--muted)] rounded-full w-3/4 lg:w-auto  z-50 p-2.5 lg:p-3 hover:bg-stone-700"
      >
        <MdOutlineAttachFile className="text-[var(--text)] lg:text-3xl text-2xl" />
      </label>
      {mediaUrl && (
        <ModelWindow close={closeModelWindow}>
          <form className="bg-[var(--background)] relative flex flex-col p-10 w-full lg:w-fit h-fit lg:h-3/4 lg:max-h-fit border-[var(--border)] border-1  ">
          
              <div className="w-full">
                <img
                  src={mediaUrl}
                  className="lg:w-1/2 w-full mx-auto bg-green-800"
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
                className="absolute hover:cursor-pointer bg-[var(--muted)] text-[var(--text)] border-1 border-[var(--border)] top-2 right-2 text-2xl lg:px-3 lg:py-1 px-2 rounded-full"
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
      <button
        disabled={mediaUrl}
        className="hover:cursor-pointer disabled:cursor-not-allowed p-2 "
      >
        <div className="bg-green-500 p-2 rounded-full hover:bg-green-600">
          <IoIosSend className="text-[var(--text)] disabled:cursor-not-allowed lg:text-3xl text-2xl" />
        </div>
      </button>
    </form>
  );
}

export default ChatController;
