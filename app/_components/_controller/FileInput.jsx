function FileInput({message,audioSrc,isRecording,fileRef,setMedia,setMediaUrl}) {
    function handleSelectMedia(e) {
      setMedia(e.target.files[0]);
      const reader = new FileReader();
      reader.onload = () => {
        setMediaUrl(reader.result);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
    return (
      <input
        disabled={message.length > 0 || audioSrc || isRecording}
        ref={fileRef}
        hidden
        onChange={handleSelectMedia}
        type="file"
        name="media"
        id="media"
      />
    );
}

export default FileInput