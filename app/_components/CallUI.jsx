"use client";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function CallUI({
  //   callerName = "huzefa ratlam",
  isCalling,
  isIncoming,
  isInCall,
  onAccept,
  onReject,
  onEnd,
  onMuteToggle,
  muted,
  friend,
  answerCall,
  remoteOffer,
  localAudioRef,
  inComingUser,
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
  }, [isInCall,callRecieved]);

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
  return (
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
            {isIncoming && !callRecieved &&(
              <button
                className="hover:cursor-pointer rounded-sm bg-green-500 hover:bg-green-600 px-4 py-2"
                onClick={async () => {
                  if (!remoteOffer) return;
                  console.log("answered", remoteOffer);

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
            {isIncoming && !callRecieved &&(
              <button
                className="hover:cursor-pointer rounded-sm bg-red-500 hover:bg-red-600 px-4 py-2"
                onClick={() => console.log("rejected")}
              >
                Reject
              </button>
            )}
            {callRecieved &&(
              <button
                className="hover:cursor-pointer rounded-sm bg-red-500 hover:bg-red-600 px-4 py-2"
                onClick={() => router.refresh()}
              >
                hang up
              </button>
            )}
          </>
          {/* )} */}

          {!isIncoming && isInCall &&(
            <button
              className="hover:cursor-pointer rounded-sm bg-red-500 hover:bg-red-600 px-4 py-2"
              onClick={() => window.location.reload()}
            >
              hangup
            </button>
          )}
          {!isIncoming && !isInCall &&(
            <button
              className="hover:cursor-pointer rounded-sm bg-red-500 hover:bg-red-600 px-4 py-2"
              onClick={() => window.location.reload()}
            >
              hangup
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
