export default function handleContextMenu(e,show,currentUserId,setShowEditItem) {
  e.preventDefault();
  if (!currentUserId) return;
  const isMessageDiv = e.target.classList.contains("message-div");
  const isMessage =
    e.target.classList.contains("message") ||
    e.target.classList.contains("messageChild");
  if (isMessageDiv) {
    const div = e.target.closest(".message-div");
    const {
      id,
      message,
      senderid: senderId,
      sendername: senderName,
    } = div.dataset;
    if (currentUserId !== Number(senderId)) setShowEditItem(false);
    else setShowEditItem(true);
    window.getSelection().removeAllRanges();
    show({
      props: { messId: id, text: message, senderId, senderName },
      event: e,
    });
    return;
  }
  if (isMessage) {
    const messageDiv = e.target.closest(".message-div");
    const {
      id,
      message,
      senderid: senderId,
      sendername: senderName,
    } = messageDiv.dataset;
    if (currentUserId !== Number(senderId)) setShowEditItem(false);
    else setShowEditItem(true);
    window.getSelection().removeAllRanges();
    show({
      props: { messId: id, text: message, senderId, senderName },
      event: e,
    });
    return;
  }
}
