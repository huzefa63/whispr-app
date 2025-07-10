"use client";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";
import { FaPhoneSlash } from "react-icons/fa";
import { IoMdCall } from "react-icons/io";
import { MdCallEnd, MdMic, MdOutlineMicOff } from "react-icons/md";
import { UseSocketContext } from "./SocketProvider";
import { useGlobalState } from "./GlobalStateProvider";

export default function CallUI({ref,answerVideoCall,answerCall}) {
  const { socket } = UseSocketContext();
  const {
    callRingRef,
    isVideoCall,
    isIncoming,
    isInCall,
    remoteOffer,
    inComingUser,
    setIsIncoming,
    setIncomingUser,
    setRemoteOffer,
    mediaRef,
    setIsCall,
    setIsInCall,
    setIsVideoCall,
    callTimeout,
    videoRef,
    callIncomingRingRef,
    peerConnection
  } = useGlobalState();
  
  const [user, setUser] = useState(null);
  const searchParams = useSearchParams();
  const [seconds, setSeconds] = useState(0);
  const [stopwatch, setStopwatch] = useState("");
  const friendId = searchParams.get("friendId");
  const [callRecieved, setCallRecieved] = useState(false);
  const [isMute, setIsMute] = useState(false);
  // video call hooks ---------------------------------------
  const localRef = useRef(null);
  const localMedia = useRef(null);
  const nodeRef = useRef(null);

  // video call hooks ended ----------------------------------
  useEffect(() => {
    if (!isIncoming) {
      callTimeout.current = setTimeout(() => {
        setIsCall(false);
        socket.emit("end-call", { callee: Number(user?.id) });
        if (mediaRef.current) {
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
        setIsVideoCall(false);
        if (callRingRef.current) {
          callRingRef.current.pause();
          callRingRef.current.currentTime = 0;
        }
      }, 16 * 1000);
    }
    return () => clearTimeout(callTimeout.current);
  }, [user]);
  useEffect(() => {
    async function getFriend() {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/getFriend/${inComingUser}`
        );
        setUser(res.data.friend);
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

  function rejectCall(id){
    socket.emit("reject-call", { caller: Number(id) });
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    if (mediaRef.current) {
      mediaRef.current.getTracks().forEach((track) => track.stop());
    }
    if (localMedia.current) {
      localMedia.current.getTracks().forEach((track) => track.stop());
      localMedia.current = null;
    }
    if (callRingRef.current) {
      callRingRef.current.pause();
      callRingRef.current.currentTime = 0;
    }
    setIsCall(false);
    setIsIncoming(false);
    setIncomingUser(null);
    setRemoteOffer({ from: "", remoteOffer: null });
    setIsInCall(false);
    setIsVideoCall(false);
    if (callIncomingRingRef.current) {
      callIncomingRingRef.current.pause();
      callIncomingRingRef.current.currentTime = 0;
    }
  }
  if (!isVideoCall)
    return (
      <div className="fixed top-1/2 left-1/2 -translate-1/2 h-[400px] lg:w-[400px] w-[90%] bg-opacity-70 flex items-center justify-center z-50 text-white font-sans">
        <div className="bg-gray-900 p-6 rounded-2xl shadow-lg w-full text-center">

          {isIncoming && (
            <p className="text-xl font-semibold">
              📞 Incoming Call from {user?.name || "..."}
            </p>
          )}
          {!isIncoming && !remoteOffer?.from && !isInCall && (
            <p className="text-xl font-semibold">📤 Calling {user?.name}</p>
          )}
          {!isIncoming && !remoteOffer?.from && isInCall && (
            <p className="text-xl font-semibold">
              📤 in call with {user?.name}
            </p>
          )}

          <p className="mt-2 text-lg">+91 {user?.contactNumber || " ..."}</p>
          {(isInCall || callRecieved) && (
            <p className="mt-2 text-lg">{stopwatch}</p>
          )}

          <div className="mt-6 flex justify-center gap-4">
            <>
              {isIncoming && !callRecieved && (
                <button
                  className="hover:cursor-pointer rounded-full bg-green-500 hover:bg-green-600 px-3 py-3"
                  onClick={async () => {
                    if (!remoteOffer) return;
                    try {
                      await answerCall(remoteOffer);
                      setCallRecieved(true);
                    } catch (err) {
                      alert("failed to connect call");
                    }
                  }}
                >
                  <IoMdCall className="text-2xl" />
                </button>
              )}
              {isIncoming && !callRecieved && (
                <button
                  className="hover:cursor-pointer rounded-full bg-red-500 hover:bg-red-600 px-3 py-3"
                  onClick={() => rejectCall(remoteOffer?.from)}
                >
                  <FaPhoneSlash className="text-2xl" />
                </button>
              )}
              {callRecieved && (
                <button
                  className="hover:cursor-pointer rounded-full bg-red-500 hover:bg-red-600 px-3 py-3"
                  onClick={() => rejectCall(remoteOffer?.from)}
                >
                  <MdCallEnd className="text-2xl" />
                </button>
              )}
            </>

            {!isIncoming && (
              <button
                className="hover:cursor-pointer rounded-full bg-red-500 hover:bg-red-600 px-3 py-3"
                onClick={() => rejectCall(Number(user?.id))}
              >
                <MdCallEnd className="text-2xl" />
              </button>
            )}
            {(isInCall || callRecieved) && (
              <button
                className={`hover:cursor-pointer rounded-full ${
                  isMute
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-green-500 hover:bg-green-600"
                } px-3 py-3`}
                onClick={() => {
                  if (mediaRef.current) {
                    mediaRef.current.getAudioTracks().forEach((track) => {
                      setIsMute(!isMute);
                      track.enabled = !track.enabled;
                    });
                  }
                }}
              >
                {isMute ? (
                  <MdOutlineMicOff className="text-2xl" />
                ) : (
                  <MdMic className="text-2xl" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    );

  if (isVideoCall) {
      
  useEffect(() => {
    async function getMedia() {
      if (!localRef.current && localMedia.current) return;
      localMedia.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      localRef.current.srcObject = localMedia?.current;
    }
    getMedia();
    return () => {
      if (localMedia.current) {
        localMedia.current.getTracks().forEach((track) => track.stop());
        localMedia.current = null;
      }
    };
  }, []);
    return (
      <div className="fixed inset-0 z-[999] bg-[var(--muted)] bg-opacity-70 flex flex-col items-center justify-center text-white font-sans">
        <div className="w-full h-full lg:h-full relative ">
          <Draggable nodeRef={nodeRef} disabled={!isInCall && !callRecieved}>
            <div
              ref={nodeRef}
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
          </Draggable>

          <video
            autoPlay
            playsInline
            muted
            ref={videoRef}
            className={`${
              isInCall || callRecieved ? "block" : "hidden"
            } h-full w-full object-cover `}
          ></video>
        </div>
        <div className="z-[999] absolute bottom-2 mt-1 flex gap-3">
          {isIncoming && callRecieved && (
            <button
              className="px-3  py-3 rounded-full bg-red-500 "
              onClick={() => {
                socket.emit("end-call", { callee: Number(remoteOffer?.from) });
                if (localMedia.current) {
                  localMedia.current
                    .getTracks()
                    .forEach((track) => track.stop());
                  localMedia.current = null;
                }
                if (mediaRef.current) {
                  console.log("stopping track");
                  mediaRef.current.getTracks().forEach((track) => track.stop());
                }
                if (peerConnection) {
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
              <MdCallEnd className="text-2xl" />
            </button>
          )}
          {!isIncoming && (
            <div
              className={`${
                !isInCall &&
                !callRecieved &&
                "bg-gray-900 flex flex-col gap-2 items-center px-5 py-2 rounded-sm"
              }`}
            >
              <h1
                className={`text-lg tracking-widest ${
                  (isInCall || callRecieved) && "hidden"
                }`}
              >
                calling {user?.name || "..."}
              </h1>
              <p className={` ${(isInCall || callRecieved) && "hidden"}`}>
                +91 {user?.contactNumber || "..."}
              </p>
              <span className="absolute -top-8 left-6">{stopwatch}</span>
              {!isIncoming && (
                <button
                  className="px-3 py-3 rounded-full bg-red-500"
                  onClick={() => rejectCall(user?.id)}
                >
                  <MdCallEnd className="text-2xl" />
                </button>
              )}
            </div>
          )}
          {(isInCall || callRecieved) && (
            <button
              className={`hover:cursor-pointer rounded-full ${
                isMute
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-green-500 hover:bg-green-600"
              } px-3 py-3`}
              onClick={() => {
                if (mediaRef.current) {
                  mediaRef.current.getAudioTracks().forEach((track) => {
                    setIsMute(!isMute);
                    track.enabled = !track.enabled;
                  });
                }
              }}
            >
              {isMute ? (
                <MdOutlineMicOff className="text-2xl" />
              ) : (
                <MdMic className="text-2xl" />
              )}
            </button>
          )}
        </div>

        {isIncoming && (
          <div
            className={`absolute bottom-2 ${
              !isInCall &&
              !callRecieved &&
              "bg-gray-900 flex flex-col gap-2 items-center px-5 py-2 rounded-sm"
            }`}
          >
            {/* <div className="z-[999] absolute bottom-2 flex gap-3"> */}
            <div className="flex flex-col gap-2 items-center">
              <h1
                className={`text-lg tracking-widest ${
                  (isInCall || callRecieved) && "hidden"
                }`}
              >
                incoming call from {user?.name || "..."}
              </h1>
              <p className={` ${(isInCall || callRecieved) && "hidden"}`}>
                +91 {user?.contactNumber || "..."}
              </p>
            </div>
            <span className="absolute -top-20 left-1/2 -translate-x-1/2">
              {stopwatch}
            </span>

            <div className="flex gap-3">
              {isIncoming && !callRecieved && (
                <button
                  className="px-3 mt-1 py-3 rounded-full bg-green-500 "
                  onClick={async () => {
                    if (!remoteOffer) return;
                    if (ref?.current) {
                    }
                    try {
                      await answerVideoCall(remoteOffer);
                      setCallRecieved(true);
                    } catch (err) {
                      alert("failed to connect call");
                    }
                  }}
                >
                  <IoMdCall className="text-2xl" />
                </button>
              )}
              {isIncoming && !callRecieved && (
                <button
                  className="hover:cursor-pointer rounded-full bg-red-500 hover:bg-red-600 px-3 py-3 "
                  onClick={() => rejectCall(remoteOffer?.from)}
                >
                  <FaPhoneSlash className="text-2xl" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
}
