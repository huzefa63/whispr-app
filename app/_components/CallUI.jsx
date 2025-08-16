"use client";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { UseSocketContext } from "./SocketProvider";
import { useGlobalState } from "./GlobalStateProvider";
import VideoCallUI from "./VideoCallUI";
import VoiceCallUI from "./VoiceCallUI";

export default function CallUI({ ref, answerVideoCall, answerCall, lineBusy }) {
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
    callIncomingRingRef,
    peerConnection,
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

  function rejectCall(id) {
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
      <VoiceCallUI
      lineBusy={lineBusy}
        user={user}
        callRecieved={callRecieved}
        setCallRecieved={setCallRecieved}
        isMute={isMute}
        setIsMute={setIsMute}
        stopwatch={stopwatch}
        rejectCall={rejectCall}
        answerCall={answerCall}
      />
    );

  if (isVideoCall) {
    return (
      <VideoCallUI
      lineBusy={lineBusy}
        answerVideoCall={answerVideoCall}
        user={user}
        remoteOffer={remoteOffer}
        rejectCall={rejectCall}
        callRecieved={callRecieved}
        setCallRecieved={setCallRecieved}
        isMute={isMute}
        setIsMute={setIsMute}
        stopwatch={stopwatch}
        localRef={localRef}
        localMedia={localMedia}
      />
    );
  }
}
