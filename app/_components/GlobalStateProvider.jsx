"use client";

import { createContext, useContext, useRef, useState } from "react";

const GlobalStateContext = createContext();

function GlobalStateProvider({ children }) {
  // message state
  const [editMessage,setEditMessage] = useState({isEditing:false,messageId:null,text:''});

  // Chat states
  const [userTypingId, setUserTypingId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [friendId, setFriendId] = useState(null);
  const [scroll, setScroll] = useState(false);
  const peerConnection = useRef(null);

  // Call states
  const videoRef = useRef(null);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [isIncoming, setIsIncoming] = useState(false);
  const [inComingUser, setIncomingUser] = useState(null);
  const [isCall, setIsCall] = useState(false);
  const [remoteOffer, setRemoteOffer] = useState({
    from: "",
    remoteOffer: null,
  });
  const [isInCall, setIsInCall] = useState(false);
  const callRingRef = useRef(null);
  const callIncomingRingRef = useRef(null);
  const callTimeout = useRef(null);
  const mediaRef = useRef(null);

  return (
    <GlobalStateContext.Provider
      value={{
        // Message
        editMessage,
        setEditMessage,

        // Chat
        peerConnection,
        userTypingId,
        setUserTypingId,
        messages,
        setMessages,
        friendId,
        setFriendId,
        scroll,
        setScroll,

        // Call
        videoRef,
        isVideoCall,
        setIsVideoCall,
        isIncoming,
        setIsIncoming,
        inComingUser,
        setIncomingUser,
        isCall,
        setIsCall,
        remoteOffer,
        setRemoteOffer,
        isInCall,
        setIsInCall,
        callRingRef,
        callIncomingRingRef,
        callTimeout,
        mediaRef,
      }}
    >
      {children}
    </GlobalStateContext.Provider>
  );
}

export default GlobalStateProvider;

export function useGlobalState() {
  return useContext(GlobalStateContext);
}
