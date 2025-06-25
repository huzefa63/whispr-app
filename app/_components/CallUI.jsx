"use client";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function CallUI({
  isVideoCall,
  isIncoming,
  isInCall,
  answerCall,
  remoteOffer,
  inComingUser,
  socket,
  setIsIncoming,
  setIncomingUser,
  setRemoteOffer,
  peerConnection,
  mediaRef,
  setIsCall,
  setIsInCall,
  ref,
  videoRef,
  setIsVideoCall,
  answerVideoCall,
}) {
  
  const [user, setUser] = useState(null);
  const searchParams = useSearchParams();
  const [seconds, setSeconds] = useState(0);
  const [stopwatch, setStopwatch] = useState("");
  const friendId = searchParams.get("friendId");
  const [callRecieved, setCallRecieved] = useState(false);
  useEffect(() => {
    async function getFriend() {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/getFriend/${inComingUser}`
        );
        setUser(res.data.friend);
        console.log(res.data);
      } catch (err) {
        console.log(err);
      }
    }
    async function getUser() {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/getFriend/${friendId}`
        );
        setUser(res.data.friend);
        console.log(res.data);
      } catch (err) {
        console.log(err);
      }
    }
    if (isIncoming) {
      getFriend();
    } else {
      getUser();
    }
  }, [friendId, inComingUser]);

  useEffect(() => {
    let interval;
    if (isInCall || callRecieved) {
      clearInterval(interval);
      interval = setInterval(() => {
        setSeconds((el) => el + 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isInCall, callRecieved]);

  useEffect(() => {
    if (isInCall || callRecieved) {
      const hours = Math.floor(seconds / 3600)
        .toString()
        .padStart(2, "0");
      const minutes = Math.floor((seconds % 3600) / 60)
        .toString()
        .padStart(2, "0");
      const secondss = Math.floor(seconds % 60)
        .toString()
        .padStart(2, "0");
      setStopwatch(`${hours}:${minutes}:${secondss}`);
    }
  }, [seconds]);
  if(!isVideoCall) return (
    <div className="fixed top-1/2 left-1/2 -translate-1/2 h-[400px] w-[400px] bg-opacity-70 flex items-center justify-center z-50 text-white font-sans">
      <div className="bg-gray-900 p-6 rounded-2xl shadow-lg w-full text-center">
        {/* Header Text */}
        {isIncoming && (
          <p className="text-xl font-semibold">
            📞 Incoming Call from {user?.name || "..."}
          </p>
        )}
        {!isIncoming && !remoteOffer?.from && !isInCall && (
          <p className="text-xl font-semibold">📤 Calling {user?.name}</p>
        )}
        {!isIncoming && !remoteOffer?.from && isInCall && (
          <p className="text-xl font-semibold">📤 in call with {user?.name}</p>
        )}
        {/* {isInCall && (
          <p className="text-xl font-semibold">
            🔊 In Call with {friend?.name}
          </p>
        )} */}

        {/* User Name */}

        <p className="mt-2 text-lg">+91 {user?.contactNumber || " ..."}</p>
        {(isInCall || callRecieved) && (
          <p className="mt-2 text-lg">{stopwatch}</p>
        )}

        {/* Buttons */}
        <div className="mt-6 flex justify-center gap-4">
          {/* {isIncoming && ( */}
          <>
            {isIncoming && !callRecieved && (
              <button
                className="hover:cursor-pointer rounded-sm bg-green-500 hover:bg-green-600 px-4 py-2"
                onClick={async () => {
                  if (!remoteOffer) return;
                  console.log("answered", remoteOffer);
                  if(ref?.current){
                    console.log('audio ref: ',ref.current);
                  }
                  try {
                    await answerCall(remoteOffer);
                    setCallRecieved(true);
                  } catch (err) {
                    alert("failed to connect call");
                  }
                }}
              >
                Accept
              </button>
            )}
            {isIncoming && !callRecieved && (
              <button
                className="hover:cursor-pointer rounded-sm bg-red-500 hover:bg-red-600 px-4 py-2"
                onClick={() => {
                  socket.emit("reject-call", { caller: remoteOffer?.from });
                  if(peerConnection.current){
                    peerConnection.current.close();
                    peerConnection.current = null;
                  }
                  setIsCall(false);
                  setIsIncoming(false);
                  setIncomingUser(null);
                  setRemoteOffer({ from: "", remoteOffer: null });
                  setIsInCall(false);
                }}
              >
                Reject
              </button>
            )}
            {callRecieved && (
              <button
                className="hover:cursor-pointer rounded-sm bg-red-500 hover:bg-red-600 px-4 py-2"
                onClick={()=>{
                  socket.emit('end-call',{callee:Number(remoteOffer?.from)});
                  console.log(mediaRef.current);
                  console.log(peerConnection.current);
                  if(mediaRef.current){
                    console.log('stopping track');
                    mediaRef.current.getTracks().forEach((track) => track.stop());
                  }
                  if (peerConnection) {
                    console.log('closing peer connection');
                    peerConnection.current.close();
                    peerConnection.current = null;
                  }
                  setIsCall(false);
                  setIsIncoming(false);
                  setIncomingUser(null);
                  setRemoteOffer({ from: "", remoteOffer: null });
                  setIsInCall(false);
                }}
              >
                hang up
              </button>
            )}
          </>
          {/* )} */}

          {!isIncoming && (
            <button
              className="hover:cursor-pointer rounded-sm bg-red-500 hover:bg-red-600 px-4 py-2"
              onClick={() => {
                socket.emit('end-call',{callee:Number(user?.id)});
                if(mediaRef.current){
                  mediaRef.current.getTracks().forEach((track) => track.stop());
                }
                if (peerConnection.current) {
                  peerConnection.current.close();
                  peerConnection.current = null;
                }
                setIsCall(false);
                setIsIncoming(false);
                setIncomingUser(null);
                setRemoteOffer({ from: "", remoteOffer: null });
                setIsInCall(false);
              }
            }
            >
              hangup
            </button>
          )}
          
        </div>
      </div>
    </div>
  );

  if(isVideoCall){
    const localRef = useRef(null);
    const localMedia = useRef(null);
    useEffect(()=>{
      async function getMedia(){
        if(!localRef.current && localMedia.current) return;
        localMedia.current = await navigator.mediaDevices.getUserMedia({audio:true,video:true});
        localRef.current.srcObject = localMedia.current;
      }
      getMedia();
      return () => {
        if(localMedia.current){
          localMedia.current.getTracks().forEach(track => track.stop());
          localMedia.current = null;
        }
      }
    },[])
    return (
      <div className="fixed inset-0 z-[999] bg-[var(--muted)] bg-opacity-70 flex flex-col items-center justify-center text-white font-sans">
        <div className="w-full h-full lg:h-full relative ">
          <div
            className={`${
              !isInCall && !callRecieved
                ? '"w-full h-full'
                : "lg:h-1/2 h-1/3 lg:w-1/6 w-1/3 absolute right-0 z-[999]"
            }`}
          >
            <video
              id="video"
              autoPlay
              playsInline
              muted
              ref={localRef}
              className={`object-cover h-full w-full`}
            ></video>
          </div>
          <video
            autoPlay
            playsInline
            muted
            ref={videoRef}
            className={`${
              isInCall || callRecieved ? "block" : "hidden"
            } h-full w-full object-cover `}
          ></video>

          {/* {!isInCall && !callRecieved && (
            <video
              id="video"
              autoPlay
              playsInline
              muted
              ref={localRef}
              className="w-full h-full object-cover"
            ></video>
          )} */}
        </div>
        {isIncoming && callRecieved && (
          <button
            className="px-5 mt-1 py-2 rounded-sm bg-red-500 z-[999] absolute bottom-2"
            onClick={() => {
              socket.emit("end-call", { callee: Number(remoteOffer?.from) });
              console.log(mediaRef.current);
              console.log(peerConnection.current);
              if (localMedia.current) {
                localMedia.current.getTracks().forEach((track) => track.stop());
                localMedia.current = null;
              }
              if (mediaRef.current) {
                console.log("stopping track");
                mediaRef.current.getTracks().forEach((track) => track.stop());
              }
              if (peerConnection) {
                console.log("closing peer connection");
                peerConnection.current.close();
                peerConnection.current = null;
              }
              setIsCall(false);
              setIsIncoming(false);
              setIncomingUser(null);
              setRemoteOffer({ from: "", remoteOffer: null });
              setIsInCall(false);
              setIsVideoCall(false);
            }}
          >
            hang up
          </button>
        )}
        {!isIncoming && (
          <button
            className="px-5 mt-1 py-2 rounded-sm bg-red-500 z-[999] absolute bottom-2"
            onClick={() => {
              socket.emit("end-call", { callee: Number(user?.id) });
              console.log(mediaRef.current);
              console.log(peerConnection.current);
              if (localMedia.current) {
                localMedia.current.getTracks().forEach((track) => track.stop());
                localMedia.current = null;
              }
              if (mediaRef.current) {
                console.log("stopping track");
                mediaRef.current.getTracks().forEach((track) => track.stop());
              }
              if (peerConnection) {
                console.log("closing peer connection");
                peerConnection.current.close();
                peerConnection.current = null;
              }
              setIsCall(false);
              setIsIncoming(false);
              setIncomingUser(null);
              setRemoteOffer({ from: "", remoteOffer: null });
              setIsInCall(false);
              setIsVideoCall(false);
            }}
          >
            hang up
          </button>
        )}
        <div className="z-[999] absolute bottom-2 flex gap-3">
          {isIncoming && !callRecieved && (
            <button
              className="px-5 mt-1 py-2 rounded-sm bg-green-500 "
              onClick={async () => {
                if (!remoteOffer) return;
                console.log("answered", remoteOffer);
                if (ref?.current) {
                  console.log("audio ref: ", ref.current);
                }
                try {
                  await answerVideoCall(remoteOffer);
                  setCallRecieved(true);
                } catch (err) {
                  alert("failed to connect call");
                }
              }}
            >
              Accept
            </button>
          )}
          {isIncoming && !callRecieved && (
            <button
              className="hover:cursor-pointer rounded-sm bg-red-500 hover:bg-red-600 px-4 "
              onClick={() => {
                socket.emit("reject-call", { caller: remoteOffer?.from });
                if (peerConnection.current) {
                  peerConnection.current.close();
                  peerConnection.current = null;
                }
                setIsCall(false);
                setIsIncoming(false);
                setIncomingUser(null);
                setRemoteOffer({ from: "", remoteOffer: null });
                setIsInCall(false);
              }}
            >
              Reject
            </button>
          )}
        </div>
      </div>
    );
  }
}
