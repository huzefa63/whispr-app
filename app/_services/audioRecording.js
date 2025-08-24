export async function getMedia(setSeconds,recordingRef,streamRef,inputRef,setAudioSrc,setAudioBlob,isRecording,recordingInterval,audioChunks) {
  if (!isRecording) return;
  setSeconds(0);
  recordingInterval = setInterval(() => {
    setSeconds((seconds) => seconds + 1);
  }, 1000);
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  recordingRef.current = new MediaRecorder(stream);
  streamRef.current = stream;
  recordingRef.current.start();
  if (inputRef.current) {
    inputRef.current.disabled = true;
  }

  recordingRef.current.ondataavailable = (event) => {
    audioChunks.push(event.data);
  };
  recordingRef.current.onstop = (event) => {
    clearInterval(recordingInterval);
    if (inputRef.current) {
      inputRef.current.disabled = false;
      inputRef.current.placeholder = "Type a message...";
    }
    const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
    const audioSrc = URL.createObjectURL(audioBlob);
    setAudioSrc(audioSrc);
    setAudioBlob(audioBlob);
  };
}
