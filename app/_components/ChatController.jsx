'use client';
import { MdOutlineAttachFile } from "react-icons/md";
import { IoIosSend } from "react-icons/io";
import { Poppins } from "next/font/google";
import { useEffect, useRef, useState } from "react";
// import sendMessage from '@/actions/messageActions'
import { useSearchParams } from "next/navigation";
import axios from "axios";
import Spinner from "./Spinner";
// import connectSocket from "@/lib/socket";
// import { UseSocketContext } from "./SocketProvider";
const poppins = Poppins({
    subsets:['latin'],
    variable:'poppins',
    weight:'500'
})
    


function ChatController() {
    const inputRef = useRef(null);
    useEffect(() => {
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
        document.documentElement.classList.add('dark');
    }, []);
    const [message,setMessage] = useState('');
    const searchParams = useSearchParams();
    const [mediaUrl,setMediaUrl] = useState('');
    const [media,setMedia] = useState(null);
    const [caption,setCaption] = useState("");
    const fileRef = useRef(null);
    const [loading,setLoading] = useState(false);
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
      const recieverId = searchParams.get("friendId");
      if(jwt && media) await handleMediaSubmit(media,caption,jwt,recieverId);
      if(jwt && !media && message) {
        const data = {
          message,
          recieverId,
        };
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
          setMessage("");
        } catch (err) {
          console.log(err);
        }
      }
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
      className="h-[8%] bg-[var(--muted)] flex items-center px-3"
    >
      {/* <div className=""> */}
        <label
          htmlFor="media"
          className="hover:cursor-pointer z-50 p-2 hover:bg-stone-700"
        >
          <MdOutlineAttachFile className="text-[var(--text)] text-3xl" />
        </label>
        {mediaUrl && (
          <div className="bg-[var(--background)] p-10  max-h-fit border-[var(--border)] border-1 top-1/2 left-1/2 -translate-1/2 absolute">
            <img
              src={mediaUrl}
              className="w-1/2 mx-auto h-1/2 bg-green-800"
            ></img>
            <div className="flex gap-2 mt-3">
              <textarea
                value={caption}
                onChange={(e)=>setCaption(e.target.value)}
                type="text"
                placeholder=" write caption here..."
                className="border-gray-400 resize-none border-1 bg-[var(--surface)] py-1 px-5 w-full  text-[var(--text)]"
              />
              <button className="hover:cursor-pointer bg-[var(--muted)] p-2 hover:bg-stone-700 relative">
                <IoIosSend className={`text-[var(--text)] text-3xl ${loading && 'opacity-0'}`} />
               { loading && <Spinner /> }
              </button>
            </div>
            <button
              onClick={() => {
                setMediaUrl(null);
                setMedia(null);
                fileRef.current.value = "";
              }}
              type="button"
              className="absolute hover:cursor-pointer bg-[var(--muted)] text-[var(--text)] border-1 border-[var(--border)] top-1 right-1 text-2xl px-3 py-1 rounded-full"
            >
              x
            </button>
          </div>
        )}
      {/* </div> */}
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
        className={`${poppins.className} disabled:cursor-not-allowed flex-1 h-3/4 focus:outline-none  text-[var(--text)] px-5  tracking-wider`}
        autoFocus
      />
      <button disabled={mediaUrl} className="hover:cursor-pointer p-2 hover:bg-stone-700">
        <IoIosSend className="text-[var(--text)] disabled:cursor-not-allowed text-3xl" />
      </button>
    </form>
  );
}

export default ChatController;
