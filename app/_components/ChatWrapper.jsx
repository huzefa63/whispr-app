'use client';
import { Suspense, useEffect, useRef, useState } from "react";
import SideChat from "./SideChat";
import Chat from "./Chat";
import { UseSocketContext } from "./SocketProvider";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import CallUI from "./CallUI";
// import useAuth from "./useAuth";

function ChatWrapper() {
    // useAuth();
    const searchParams = useSearchParams();
    const [userTypingId, setUserTypingId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [friendId, setFriendId] = useState(null);
    const params = searchParams.get("friendId");
    const {socket} = UseSocketContext();
    const queryClient = useQueryClient();
        const [scroll, setScroll] = useState(false);
    // const [chats,setChats] = useState([]);
  const router = useRouter();

    const { data: chats, isLoading, isPending } = useQuery({
      queryKey: ["chats"],
      queryFn: getChats,
      refetchOnWindowFocus: false,
    });
    
    async function getChats() {
      try {
        const jwt = localStorage.getItem("jwt");
        if (!jwt) return [];
        const chatRes = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/chat/getChats`,
          { headers: { Authorization: `jwt=${jwt}` } }
        );
        console.log("chats", chatRes.data);
        // setChats(chatRes.data?.chats);
        return chatRes.data;
      } catch (err) {
        console.log(err);
        // return {chats:[{user2:{name:'Huzefa ratlam'}}]};
        return [];
      }
    }


    useEffect(() => {
      if (!socket) return;
      let timeout;
      socket.on("typing", (userId) => {
        setUserTypingId(userId);
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          setUserTypingId(null);
        }, 1000);
      });
      return () => socket.off("typing");
    }, [socket]);

    useEffect(() => {
      document.documentElement.scrollTop =
        document.documentElement.scrollHeight;
    }, []); // removed scroll
    useEffect(() => {
      console.log("effect ran success 1");
      if (!socket) return;
      console.log('effect ran success 2');
      console.log(socket?.connected);
      if(!socket?.connected){
        socket.connect();
      }
      socket.on("connect", () => console.log("connected"));
      socket.on("messageRecieved", (data) => {
        console.log('message',data)
        const token = localStorage.getItem("jwt");
        const currentUserId = jwtDecode(token)?.id;
        queryClient.setQueryData(["chats"], (previousChats) => {
          if(previousChats === undefined) return; 
          if (previousChats?.chats?.length < 1) return {status:'success',chats:[...data?.chat],currentUserId};
          const newChats = [...previousChats.chats];
          if(!previousChats.chats.some(el => el?.id === data?.chat[0]?.id)){
            console.log('unshift if',data?.chat);
            console.log(data?.chat);
            console.log(previousChats);
             newChats?.unshift(...data?.chat);
             return {...previousChats,chats:newChats};
          }
          console.log('all if got skipped in msgrec');
          const latestChatIndex = previousChats?.chats.findIndex(
            (el) => data?.chat[0]?.id === el?.id
          );
          console.log('latestchatindex: ',latestChatIndex)
          newChats[latestChatIndex] = data?.chat[0];
          console.log('before newchats: ',newChats)
          newChats.sort((a, b) => {
            const aTime = a.recentMessageCreatedAt;
            const bTime = b.recentMessageCreatedAt;

            if (!aTime && !bTime) return 0; // both are null
            if (!aTime) return 1; // a is null -> goes after b
            if (!bTime) return -1; // b is null -> goes after a

            return bTime.localeCompare(aTime); // newest first
          });
          console.log("finalchats: ", { ...previousChats, chats: newChats });
          return { ...previousChats, chats: newChats };
        });
        
        if ((data?.Type === "image" || data?.Type === 'audio') || data?.senderId !== currentUserId)
          setScroll(false);
        if (data?.senderId == friendId || data?.senderId === currentUserId) {
          // setMessages(el=>[...el,data]);
          setMessages((el) => {
            if ((data?.Type === "image" || data?.Type === 'audio') || data?.senderId !== currentUserId) {
              if (data?.senderId !== currentUserId && data?.Type !== "image" && data?.Type !== 'audio')
                setScroll(true);
              return [...el, data];
            }
            const newState = [...el];
            const index = newState.findIndex(
              (el) => el?.uniqueId === data?.uniqueId
            );
            newState[index] = data;
            return [...newState];
          });
          // if (data.Type !== "image") setScroll(true);
        }
      });
      socket.on("message-read", ({ userId, friendId }) => {
        setMessages((el) => {
          return el.map((msg) => {
            return { ...msg, isRead: true };
          });

        });
        queryClient.setQueryData(["chats"], (oldData) => {
          console.log('from message read top',oldData);
          if (!oldData) return [];
          const index = oldData?.chats?.findIndex(
            (el) =>
              (el.userId === userId && el.user2Id === friendId) ||
              (el.userId === friendId && el.user2Id === userId)
          );
          console.log("from messageREad: ", index);
          if (index || index === 0) {
            const chatsCopy = [...oldData?.chats];
            chatsCopy[index] && (chatsCopy[index].isRecentMessageRead = true);
            console.log('message read copy: ',chatsCopy);
            return { ...oldData, chats: chatsCopy };
          }
          
          return oldData;
        });
      });
      return () => {
        socket?.off?.("connect");
        socket?.off?.("messageRecieved");
        socket?.off?.("message-read");
      };
    }, [socket, friendId]);
     const ref = useRef(null);
      const [isIncoming, setIsIncoming] = useState(false);
      const [inComingUser,setIncomingUser] = useState(null);
      const isRemote = useRef(false);
      const [isCall, setIsCall] = useState(false);
        const peerConnection = useRef(null);
        const [remoteOffer, setRemoteOffer] = useState({
          from: "",
          remoteOffer: null,
        });
        const [isInCall,setIsInCall] = useState(false);
        async function startCall() {
          console.log('hey start')
          if (!socket) return;
          console.log('socket here')
          const jwt = localStorage.getItem("jwt");
          if (!jwt) return;
          console.log('jwt here')
          if (!peerConnection.current) return;
          console.log('peer here')
          // alert('call started')
          const id = jwtDecode(jwt)?.id;
          setIsCall(true);
          setIsIncoming(false);
          try {
            // ✅ Get mic access
            // const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const stream = await navigator.mediaDevices.getUserMedia({
              audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
              },
            });

            // ✅ Play your own voice (muted to prevent echo)

            // localRef.current.srcObject = stream;
            // localRef.current.muted = true;
            // localRef.current.play();

            // ✅ Add audio tracks to peer connection
            stream
              .getTracks()
              .forEach((track) =>
                peerConnection.current.addTrack(track, stream)
              );

            // ✅ Create and set offer
            const offer = await peerConnection.current.createOffer();
            await peerConnection.current.setLocalDescription(offer);

            // ✅ Optional: slight delay to allow ICE candidates to gather
            await new Promise((resolve) => setTimeout(resolve, 500));

            // ✅ Send offer to remote peer
            socket.emit("start-call", { to: Number(params), from: id, offer });
          } catch (err) {
            console.error("❌ Error in startCall:", err);
          }
        }

        async function answerCall(remoteOffer) {
          if (!peerConnection.current) return;
          // alert("answered");
          const jwt = localStorage.getItem("jwt");
          if (!jwt) return;
          const id = jwtDecode(jwt)?.id;

          try {
            // ✅ Get mic access
            // const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const stream = await navigator.mediaDevices.getUserMedia({
              audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
              },
            });

            // ✅ Play your own voice (muted to prevent echo)
            

            // ✅ Add audio tracks to peer connection
            stream
              .getTracks()
              .forEach((track) =>
                peerConnection.current.addTrack(track, stream)
              );

            // ✅ Set remote offer (from caller)
            await peerConnection.current.setRemoteDescription(
              new RTCSessionDescription(remoteOffer.remoteOffer)
            );

            // ✅ Create and set local answer
            const answer = await peerConnection.current.createAnswer();
            await peerConnection.current.setLocalDescription(answer);

            // ✅ Optional: slight delay for ICE candidates to gather
            await new Promise((resolve) => setTimeout(resolve, 500));

            // ✅ Send answer back to caller
            socket.emit("answer", {
              to: remoteOffer.from,
              from: id,
              answer,
            });
          } catch (err) {
            console.error("❌ Error in answerCall:", err);
          }
        }
      useEffect(() => {
        if (!socket) return;
        console.log('peer effect');
        const jwt = localStorage.getItem("jwt");
        if (!jwt) return;
        const id = jwtDecode(jwt)?.id;
        const iceQue = [];
        if (!peerConnection.current) {
          const configuration = {
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
          };
          peerConnection.current = new RTCPeerConnection(configuration);
          console.log('peer: ',peerConnection.current);
        }
    
        // Assign onicecandidate early
        peerConnection.current.onicecandidate = ({ candidate }) => {
          console.log("candidate gathereing", candidate);
          if (candidate) {
            socket.emit("ice-candidate", {
              candidate,
              to: Number(params),
              from: id,
            });
          }
        };
        // Listen for connectionstatechange on the local RTCPeerConnection
        peerConnection.connectionstatechange = (event) => {
          if (peerConnection.connectionState === "connected") {
            console.log("connectedddddddddddddddddddddddddddddddd");
          }
        };
    
        // Prepare remote stream and ontrack
        const remoteStream = new MediaStream();
        peerConnection.current.ontrack = (event) => {
          console.log("track recieved");
          event.streams[0].getTracks().forEach((track) => {
            console.log("Track kind:", track.kind, "enabled:", track.enabled);
            remoteStream.addTrack(track);
          });
          if (ref.current) {
            ref.current.srcObject = remoteStream;
            ref.current.play().catch((err) => alert(err, "auto play blocked"));
          }
        };
    
        // Incoming call handler
        socket.on("call-incoming", async ({ from, remoteOffer }) => {
          setIsCall(true);
          setIsIncoming(true);
          setIncomingUser(from);
          console.log("hey");
          console.log(remoteOffer);
          setRemoteOffer({ from, remoteOffer });
        });
    
        // Handle ICE
    
        socket.on("ice-candidate", async ({ candidate }) => {
          console.log("ice receieved: ", candidate);
          if (isRemote.current && peerConnection.current.remoteDescription) {
            await peerConnection.current.addIceCandidate(
              new RTCIceCandidate(candidate)
            );
            // alert("ice applied");
          } else {
            // alert("pushed to que");
            iceQue.push(candidate);
          }
        });
    
        // Handle answer (only caller uses this)
        socket.on("answer", async ({ answer }) => {
          if (!peerConnection.current) return;
    
          console.log(
            "1️⃣ Signaling state BEFORE setting remote answer:",
            peerConnection.current.signalingState
          );
    
          if (peerConnection.current.signalingState !== "have-local-offer") {
            console.warn(
              "❗ Can't apply answer — wrong state:",
              peerConnection.current.signalingState
            );
            return;
          }
    
          console.log("📩 Got answer, applying...");
          try {
            await peerConnection.current.setRemoteDescription(
              new RTCSessionDescription(answer)
            );
            isRemote.current = true;
            for (let c of iceQue) {
              await peerConnection.current.addIceCandidate(new RTCIceCandidate(c));
              // alert("qued ice applied");
            }
            setIsInCall(true);
            console.log("✅ Answer applied successfully.");
          } catch (err) {
            console.error("❌ Failed to apply answer:", err);
          }
        });
        return () => {
          socket.off("answer");
          socket.off("call-incoming");
          socket.off('ice-candidate');
          if (peerConnection.current) {
            peerConnection.current = null;
          }
        };
      }, [socket]);
    return (
      <div className="flex h-full  w-full">
        <Suspense>
          <SideChat
            isPending={isPending}
            isLoading={isLoading}
            chats={chats}
            userTypingId={userTypingId}
          />
        </Suspense>
        <div className="h-screen w-full bg-[var(--surface)]">
          <Suspense fallback={<div>loading chat...</div>}>
            {isCall && remoteOffer && (
              <CallUI
              isInCall={isInCall}
              inComingUser={inComingUser}
                isIncoming={isIncoming}
                answerCall={answerCall}
                remoteOffer={remoteOffer}
              />
            )}
            <audio ref={ref} hidden autoPlay />

            <Chat
            startCall={startCall}
              ref={ref}
              isIncoming={isIncoming}
              isCall={isCall}
              remoteOffer={remoteOffer}
              chats={chats}
              friendId={friendId}
              scroll={scroll}
              setScroll={setScroll}
              messages={messages}
              params={params}
              setFriendId={setFriendId}
              setMessages={setMessages}
              userTypingId={userTypingId}
              setUserTypingId={setUserTypingId}
            />
          </Suspense>
        </div>
      </div>
    );
}

export default ChatWrapper
