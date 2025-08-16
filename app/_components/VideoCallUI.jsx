"use client";

import { useEffect, useRef } from "react";
import { useGlobalState } from "./GlobalStateProvider";
import Draggable from "react-draggable";
import { AnswerCallButton } from "./AnswerCallButton";
import { RejectCallButton } from "./RejectCallButton";
import { MuteCallButton } from "./MuteCallButton";
import { EndCallButton } from "./EndCallButton";

function VideoCallUI({
  user,
  remoteOffer,
  rejectCall,
  callRecieved,
  setCallRecieved,
  isMute,
  setIsMute,
  stopwatch,
  localRef,
  localMedia,
  answerVideoCall,
  lineBusy,
}) {
  const nodeRef = useRef(null);
  const { isIncoming, isInCall, mediaRef, videoRef } = useGlobalState();
  useEffect(() => {
    let isMounted = true;

    async function getMedia() {
      if (!localRef.current || localMedia.current) return;
      try {
        localMedia.current = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        if (isMounted && localRef.current) {
          localRef.current.srcObject = localMedia.current;
        }
      } catch (err) {
        console.error("Error accessing media devices:", err);
      }
    }

    getMedia();

    return () => {
      isMounted = false;
      if (localMedia.current) {
        localMedia.current.getTracks().forEach((track) => track.stop());
        localMedia.current = null;
      }
    };
  }, [localRef]);
  return (
    <div className="fixed inset-0 z-[9999] bg-[var(--muted)] bg-opacity-70 flex flex-col items-center justify-center text-white font-sans">
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
          <EndCallButton handler={() => rejectCall(user?.id)} />
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
              {!lineBusy && 'calling'} {user?.name || "..."} {lineBusy && 'is on another call'}
            </h1>
            <p className={` ${(isInCall || callRecieved) && "hidden"}`}>
              +91 {user?.contactNumber || "..."}
            </p>
            <span className="absolute -top-8 left-6">{stopwatch}</span>
            {!isIncoming && (
              <EndCallButton handler={() => rejectCall(user?.id)} />
            )}
          </div>
        )}
        {(isInCall || callRecieved) && (
          <MuteCallButton
            mediaRef={mediaRef}
            setIsMute={setIsMute}
            isMute={isMute}
          />
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
              <AnswerCallButton
                remoteOffer={remoteOffer}
                answerCall={answerVideoCall}
                setCallRecieved={setCallRecieved}
              />
            )}
            {isIncoming && !callRecieved && (
              <RejectCallButton handler={() => rejectCall(remoteOffer?.from)} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoCallUI;