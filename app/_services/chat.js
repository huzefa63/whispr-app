export function updateChatRecentMessageToRead(queryClient, userId, params) {
  queryClient.setQueryData(["chats"], (previousChats) => {
    // if not previous chats then return
    if (previousChats?.chats?.length < 1 || !previousChats)
      return previousChats;

    // find index of current chat in which the current user and the friendId is active
    const index = previousChats?.chats?.findIndex(
      (el) =>
        (el?.userId == userId && el?.user2Id == params) ||
        (el?.userId == params && el?.user2Id == userId)
    );
    // if chat is not found then it's -1 so just return
    if (index === -1) return previousChats;

    // then check if the chat we found recent message is read or if the recent message was sent by current user
    // if any matches it means all the messages in chat is already mark as read so just return
    if (
      previousChats?.chats.at(index)?.isRecentMessageRead ||
      previousChats?.chats.at(index)?.recentMessageSenderId == userId
    )
      return previousChats;

    // if both conditions fails on previous step then just mark recent message as read cause it was not read before
    const copy = [...previousChats?.chats];
    copy[index].isRecentMessageRead = true;
    return { ...previousChats, chats: copy };
  });
}

export function scrollChatContainer(messages, currentUserId, containerRef) {
    /* 
    scroll only if scroll state is true and last message
    is image or audio or it's a placeholder or not sended by current user  
    */
  const lastMessage = messages.at(-1);
  const isCurrentUserSendedLastMessage =
    lastMessage?.senderId !== currentUserId;
  const isLastMessImgOrAudio =
    lastMessage?.Type === "image" || lastMessage?.Type === "audio";
  if (
    (containerRef.current && scroll && isLastMessImgOrAudio) ||
    lastMessage?.placeholder ||
    isCurrentUserSendedLastMessage
  ) {
    containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }
}
