"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function CallUI({
  //   callerName = "huzefa ratlam",
  isCalling,
  isIncoming,
  isInCall = true,
  onAccept,
  onReject,
  onEnd,
  onMuteToggle,
  muted,
  friend,
  answerCall,
  remoteOffer,
  localAudioRef,
}) {
  const [user, setUser] = useState(null);
  useEffect(() => {
    console.log("is incoming: ", isIncoming);
    console.log("mounted ", remoteOffer);
  }, []);
  return (
    <div className="fixed top-1/2 left-1/2 -translate-1/2 h-[400px] w-[400px] bg-opacity-70 flex items-center justify-center z-50 text-white font-sans">
      <div className="bg-gray-900 p-6 rounded-2xl shadow-lg w-full text-center">
        {/* Header Text */}
        {isIncoming && (
          <p className="text-xl font-semibold">
            📞 Incoming Call from {friend?.name}
          </p>
        )}
        {!isIncoming && !remoteOffer?.from && (
          <p className="text-xl font-semibold">📤 Calling {friend?.name}...</p>
        )}
        {/* {isInCall && (
          <p className="text-xl font-semibold">
            🔊 In Call with {friend?.name}
          </p>
        )} */}

        {/* User Name */}
        <p className="mt-2 text-lg">+91 {friend?.contactNumber}</p>

        {/* Buttons */}
        <div className="mt-6 flex justify-center gap-4">
          {/* {isIncoming && ( */}
          <>
            {isIncoming && (
              <button
                className="hover:cursor-pointer rounded-sm bg-green-500 hover:bg-green-600 px-4 py-2"
                onClick={async () => {
                  if (!remoteOffer) return;
                  console.log("answered", remoteOffer);

                  await answerCall(remoteOffer, localAudioRef);
                }}
              >
                Accept
              </button>
            )}
            {isIncoming && (
              <button
                className="hover:cursor-pointer rounded-sm bg-red-500 hover:bg-red-600 px-4 py-2"
                onClick={() => console.log("rejected")}
              >
                Reject
              </button>
            )}
          </>
          {/* )} */}

          {!isIncoming && (
            <button
              className="hover:cursor-pointer rounded-sm bg-red-500 hover:bg-red-600 px-4 py-2"
              onClick={onEnd}
            >
              end
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
