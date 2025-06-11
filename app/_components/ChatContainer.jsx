'use client';
import { format } from 'date-fns';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { UseSocketContext } from './SocketProvider';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Spinner from './Spinner';
import { BiCheckDouble } from "react-icons/bi";
function ChatContainer() {
      const searchParams = useSearchParams();
      const params = searchParams.get('friendId');
      const {socket} = UseSocketContext();
      const [messages,setMessages] = useState([]);
      const containerRef = useRef(null);
      const [scroll,setScroll] = useState(true);
      const [friendId,setFriendId] = useState(null);
      const paramFriendId = searchParams.get('friendId');
      const {data,isLoading} = useQuery({
        queryKey:['messages',params],
        queryFn: () => getMessages(params),
        refetchOnWindowFocus:false,
        placeholderData:[]
      })
      async function getMessages(params){
        if(!params) return [];
        console.log('fetch friend ', params);
        const jwt = localStorage.getItem('jwt'); 
        // const params = new URLSearchParams(searchParams).toString();
        try {
          const res = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/message/getMessages?friendId=${params}`,{
              headers:{
                Authorization:`jwt=${jwt}`
              }
            }
          );
          
          console.log(res);
          setMessages(res.data.messages);
          return res.data.messages;
        } catch (err) {
          console.log(err);
          return [];
        }
      }
      useEffect(()=>{
        const jwt = localStorage.getItem('jwt');
       async function markRead(){
        const res2 = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/message/readMessages/${params}`,
          {
            headers: {
              Authorization: `jwt=${jwt}`,
            },
          }
        );
       }
       markRead();
      },[params])
      useEffect(()=>{
        if (containerRef.current && scroll) {
         
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
              
            
        }
      },[messages,scroll])
      
      useEffect(()=>{
        if(!paramFriendId) return;
        setFriendId(Number(paramFriendId));
      },[paramFriendId])
      useEffect(() => {
        
        if(!socket) return;
        
         socket.on('connect',()=>console.log('connected'));
          socket.on("messageRecieved", (data) => {
            console.log('message recieved',data);
            console.log('message recieved, friendId: ',friendId)
             setScroll(false);
            if(data?.senderId != friendId) return;
            
            setMessages(el=>[...el,data]);
            if(data.Type !== 'image') setScroll(true);
          });
          socket.on('message-read',() => {
            setMessages(el => {
              return el.map(msg => {
                return {...msg,isRead:true}
              })
            })
          })
        return () => {
          socket?.off?.('connect');
          socket?.off?.('messageRecieved');
        };
      }, [socket]);
    return (
      <div
        ref={containerRef}
        className="bg-[var(--surface)] relative scroll-smooth overflow-auto flex-1 text-[var(--text)] p-5 flex flex-col gap-3"
      >
        {isLoading && <Spinner />}
        {!isLoading && messages?.map((el,i) => <Message key={i} message={el} setScroll={setScroll}/>)}
        {/* {[
          {
            time: "2025-06-07 09:40:59.216",
            senderId:1,
            Type: "image",
            mediaUrl,
            caption: "am i looking good in this outfit ?",
          },
        ].map((el, i) => (
          <Message key={i} message={el} />
        ))} */}
      </div>
    );
}

export default ChatContainer

function Message({message,setScroll}){
  if(typeof window === 'undefined') return;
    const token = localStorage.getItem('jwt');
    const currentUserId = jwtDecode(token)?.id;

    const time = format(new Date(message?.time),'HH:mm')
    if(message.Type !== 'image')return (
      <div className="w-full">
        <p
          className={`relative rounded-sm pl-3 pr-20 p-2 w-fit max-w-[45%]  break-words ${
            currentUserId === Number(message?.senderId)
              ? "ml-auto bg-green-900"
              : "bg-[var(--muted)]"
          }`}
        >
          {message?.message}
          <span className="text-xs right-2 bottom-1 absolute flex gap-1 items-center">{time}{message?.senderId === currentUserId && <BiCheckDouble className={`text-lg ${message?.isRead && 'text-blue-400'}`}/>} </span>
          
        </p>
      </div>
    );
    if(message.Type === 'image') return (
      <div className="w-full gap-2 ">
        <div
          className={`flex flex-col relative  gap-3 bg-[var(--muted)] p-2 rounded-sm  w-fit min-w-[30%] max-w-[30%] ${
            currentUserId === Number(message?.senderId)
              ? "ml-auto bg-green-900"
              : "bg-[var(--muted)]"
          }`}
        >
          <img src={message?.mediaUrl} alt="" onLoad={()=>setScroll(true)}/>
          {message?.caption && <p className="tracking-wide">
            {message.caption}
          </p>}
          <span className={`text-xs ${message?.caption ? 'right-2 bottom-1' : 'right-3 bottom-2'}  absolute flex gap-1 items-center`}>{time}{message?.senderId === currentUserId && <BiCheckDouble className={`text-lg ${message?.isRead && 'text-blue-400'}`}/>} </span>
        </div>
      </div>
    );
}