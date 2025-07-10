"use client";
import { IoMdCall } from "react-icons/io";

export function AnswerCallButton({ remoteOffer, answerCall, setCallRecieved }) {
    return (
        <button
            className="px-3 mt-1 py-3 rounded-full bg-green-500 "
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
    );
}
