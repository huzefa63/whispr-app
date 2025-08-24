import { useEffect, useRef, useState } from "react";
import { getMedia } from "../_services/audioRecording";

export default function useAudioRecorder(inputRef) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioSrc, setAudioSrc] = useState("");
  const [audioBlob, setAudioBlob] = useState(null);
  const [isSendingAudio, setIsSendingAudio] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const recordingRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    let recordingInterval;
    let audioChunks = [];

    if (isRecording) {
      getMedia(
        setSeconds,
        recordingRef,
        streamRef,
        inputRef,
        setAudioSrc,
        setAudioBlob,
        isRecording,
        recordingInterval,
        audioChunks
      );
    }

    return () => {
      if (recordingRef.current) recordingRef.current = null;
      if (inputRef.current) inputRef.current.placeholder = "Type a message...";
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      clearInterval(recordingInterval);
      setAudioBlob(null);
      setAudioSrc("");
    };
  }, [isRecording, inputRef]);

  useEffect(() => {
    if ((isRecording || audioSrc) && inputRef.current) {
      const hours = Math.floor(seconds / 3600)
        .toString()
        .padStart(2, "0");
      const minutes = Math.floor((seconds % 3600) / 60)
        .toString()
        .padStart(2, "0");
      const second = (seconds % 60).toString().padStart(2, "0");
      inputRef.current.placeholder = `${hours}:${minutes}:${second} recording audio...`;
    }
  }, [seconds, audioSrc, isRecording, inputRef]);

  return {
    isRecording,
    setIsRecording,
    audioSrc,
    setAudioSrc,
    audioBlob,
    setAudioBlob,
    isSendingAudio,
    setIsSendingAudio,
    seconds,
    recordingRef,
    streamRef,
  };
}
