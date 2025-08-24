import AudioPlayer from "react-h5-audio-player";
function CustomAudioPlayer({audioSrc}) {
  return (
    <AudioPlayer
      className="rhap_current-time rhap_total-time audio-player"
      src={audioSrc}
      layout="horizontal-reverse"
      showJumpControls={false}
      showSkipControls={false}
      customVolumeControls={["volume"]} // Optional
      // customControlsSection={["mainControls", "progressBar"]} // No "volumeControls"
      defaultDuration={["00:00"]}
      defaultCurrentTime={["00:00"]}
      customAdditionalControls={[]} // ❗ Make sure this is not hiding play
      // Optional
    />
  );
}

export default CustomAudioPlayer;
