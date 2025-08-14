import { useGlobalState } from "./GlobalStateProvider";
import { MdCallEnd, MdOutlineMicOff, MdMic } from "react-icons/md";
import { IoMdCall } from "react-icons/io";
import { FaPhoneSlash } from "react-icons/fa";
import { AnswerCallButton } from "./AnswerCallButton";
import { RejectCallButton } from "./RejectCallButton";
import { EndCallButton } from "./EndCallButton";
import { MuteCallButton } from "./MuteCallButton";

function VoiceCallUI({
  user,
  callRecieved,
  setCallRecieved,
  isMute,
  setIsMute,
  stopwatch,
  rejectCall,
  answerCall,
}) {
    const { isIncoming, isInCall, remoteOffer, mediaRef } = useGlobalState();
  return (
    <div className="fixed top-1/2  left-1/2 -translate-1/2 h-[400px] lg:w-[400px] w-[90%] bg-opacity-70 flex items-center justify-center z-[9999] text-white font-sans">
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
          <p className="text-xl font-semibold">📤 in call with {user?.name}</p>
        )}

        <p className="mt-2 text-lg">+91 {user?.contactNumber || " ..."}</p>
        {(isInCall || callRecieved) && (
          <p className="mt-2 text-lg">{stopwatch}</p>
        )}

        <div className="mt-6 flex justify-center gap-4">
          <>
            {isIncoming && !callRecieved && (
              <AnswerCallButton
                remoteOffer={remoteOffer}
                answerCall={answerCall}
                setCallRecieved={setCallRecieved}
              />
            )}
            {isIncoming && !callRecieved && (
              <RejectCallButton handler={() => rejectCall(remoteOffer?.from)} />
            )}
            {callRecieved && (
              <EndCallButton handler={() => rejectCall(remoteOffer?.from)} />
            )}
          </>

          {!isIncoming && (
            <EndCallButton handler={() => rejectCall(Number(user?.id))} />
          )}
          {(isInCall || callRecieved) && (
            <MuteCallButton mediaRef={mediaRef} setIsMute={setIsMute} isMute={isMute}/>
          )}
        </div>
      </div>
    </div>
  );
}

export default VoiceCallUI;
