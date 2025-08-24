import { useEffect } from "react";
import { returnJwtAndUserId } from "../_services/auth";

export default function useTypingIndicator(socket, message, searchParams) {
  useEffect(() => {
    if (!socket || message.length === 0) return;

    const { jwt, userId } = returnJwtAndUserId();
    socket.emit("typing", {
      typerId: userId,
      toTypingId: Number(searchParams.get("friendId")),
    });
  }, [message, socket, searchParams]);
}
