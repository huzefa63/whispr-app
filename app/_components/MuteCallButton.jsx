"use client";
import { MdOutlineMicOff, MdMic } from "react-icons/md";

export function MuteCallButton({ mediaRef, setIsMute, isMute }) {
    return (
        <button
            className={`hover:cursor-pointer rounded-full ${isMute
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-green-500 hover:bg-green-600"} px-3 py-3`}
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
    );
}
