import ModelWindow from "./ModelWindow";
import SendImageWindow from "./_controller/SendImageWindow";

export default function MediaPreviewModal({
  loading,
  caption,
  setCaption,
  mediaUrl,
  closeModelWindow,
}) {
  return (
    <ModelWindow close={closeModelWindow}>
      <SendImageWindow
        loading={loading}
        caption={caption}
        setCaption={setCaption}
        mediaUrl={mediaUrl}
        closeModelWindow={closeModelWindow}
      />
    </ModelWindow>
  );
}
