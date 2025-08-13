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
import { useGlobalState } from "./GlobalStateProvider";

function ChatWrapper() {

    const searchParams = useSearchParams();
    const ref = useRef(null);
    const params = searchParams.get("friendId");
    const {socket} = UseSocketContext();
    const queryClient = useQueryClient();
    const isRemote = useRef(false);
    const {
      mediaRef,
      userTypingId,
      setUserTypingId,
      setMessages,
      friendId,
      setScroll,
      videoRef,
      setIsVideoCall,
      setIsIncoming,
      inComingUser,
      setIncomingUser,
      isCall,
      setIsCall,
      remoteOffer,
      setRemoteOffer,
      setIsInCall,
      callRingRef,
      callIncomingRingRef,
      callTimeout,
      peerConnection
    } = useGlobalState();
    

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
        
        return chatRes.data;
      } catch (err) {
        
        return [];
      }
    }

    useEffect(() => {
      callRingRef.current = new Audio("/call-ring.mp3");
      callIncomingRingRef.current = new Audio("/call-incoming.mp3");
      return () => {
        if (callRingRef?.current) {
          callRingRef.current.pause();
          callRingRef.current.currentTime = 0;
        }
      };
    }, []);

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
    }, []);

    useEffect(() => {
      if (!socket) return;
      if (!socket?.connected) {
        socket.connect();
      }

      socket.on('messageUpdated',(data) => {
        const userId = jwtDecode(localStorage.getItem('jwt'))?.id;
        if(data?.chatId){
          let updatedChats;
          queryClient.setQueryData(['chats'],(previousChats) => {
            updatedChats = previousChats?.chats?.map(el => {
              if(el.id === Number(data?.chatId) ){
                return {...el, recentMessage:data?.recentMessage,isRecentMessageRead:data?.isRecentMessageRead}
              }else{
                return el;
              }
            })
            return {...previousChats,chats:updatedChats}
          })
        }
        console.log(Number(data.message.senderId) !== userId);
       if(Number(data?.message?.senderId) !== Number(userId)){
        console.log('currrent user also');
         setMessages(mess => {
          return mess?.map(el => {
            if(el?.id === Number(data?.messageId)){
              return {...el,message:data?.message.message,isEdited:true}
            }
            else{
              return el;
            }
          })
        })
       }
      })

      socket.on('messageDeleted',(data) => {
        if(data?.deletedMessageId){
           setMessages((mess) => {
             return mess?.filter(
               (el) => el?.id !== Number(data?.deletedMessageId)
             );
           });
        }
         if(data?.chat?.id){
          console.log(data?.chat);
          queryClient.setQueryData(['chats'],(previousChats) => {
            const updatedChats = previousChats?.chats?.map(el => {
              if(el?.id === Number(data?.chat?.id)){
                console.log({
                  ...el,
                  recentMessage: data?.chat?.recentMessage,
                });
                return {...el,recentMessage:data?.chat?.recentMessage,isRecentMessageRead:data?.chat?.isRecentMessageRead,recentMessageSenderId:data?.chat?.recentMessageSenderId}
              }
              else{
                return el;
              }
            })
            return {...previousChats,chats:updatedChats}
          })
         }
      })

      socket.on("messageRecieved", (data) => {
        const token = localStorage.getItem("jwt");
        const currentUserId = jwtDecode(token)?.id;

        queryClient.setQueryData(["chats"], (previousChats) => {
          if (previousChats === undefined) return;
          if (previousChats?.chats?.length < 1)
            return { status: "success", chats: [...data?.chat], currentUserId };
          const newChats = [...previousChats.chats];

          if (!previousChats.chats.some((el) => el?.id === data?.chat[0]?.id)) {
            newChats?.unshift(...data?.chat);
            return { ...previousChats, chats: newChats };
          }

          const latestChatIndex = previousChats?.chats.findIndex(
            (el) => data?.chat[0]?.id === el?.id
          );
          newChats[latestChatIndex] = data?.chat[0];

          newChats.sort((a, b) => {
            const aTime = a.recentMessageCreatedAt;
            const bTime = b.recentMessageCreatedAt;
            if (!aTime && !bTime) return 0;
            if (!aTime) return 1;
            if (!bTime) return -1;
            return bTime.localeCompare(aTime);
          });

          return { ...previousChats, chats: newChats };
        });

        if (
          data?.Type === "image" ||
          data?.Type === "audio" ||
          data?.senderId !== currentUserId
        )
          setScroll(false);

        if (data?.senderId == friendId || data?.senderId === currentUserId) {
          setMessages((el) => {
            if (
              data?.Type === "image" ||
              data?.Type === "audio" ||
              data?.senderId !== currentUserId
            ) {
              if (
                data?.senderId !== currentUserId &&
                data?.Type !== "image" &&
                data?.Type !== "audio"
              )
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
        }
      });

      socket.on("message-read", ({ userId, friendId }) => {
        setMessages((el) => el.map((msg) => ({ ...msg, isRead: true })));

        queryClient.setQueryData(["chats"], (oldData) => {
          if (!oldData) return [];
          const index = oldData?.chats?.findIndex(
            (el) =>
              (el.userId === userId && el.user2Id === friendId) ||
              (el.userId === friendId && el.user2Id === userId)
          );
          if (index || index === 0) {
            const chatsCopy = [...oldData?.chats];
            chatsCopy[index] && (chatsCopy[index].isRecentMessageRead = true);
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

    async function startCall() {
      if (!socket) return;
      const jwt = localStorage.getItem("jwt");
      if (!jwt) return;
      if (!peerConnection?.current) return;

      const id = jwtDecode(jwt)?.id;
      setIsCall(true);
      setIsIncoming(false);
      if (callRingRef?.current) {
        await callRingRef.current.play();
      }

      try {
        mediaRef.current = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        mediaRef?.current
          ?.getTracks()
          ?.forEach((track) =>
            peerConnection?.current?.addTrack(track, mediaRef.current)
          );

        const offer = await peerConnection?.current?.createOffer();
        await peerConnection?.current?.setLocalDescription(offer);
        await new Promise((resolve) => setTimeout(resolve, 500));
        socket.emit("start-call", { to: Number(params), from: id, offer });
      } catch (err) {
        console.error("❌ Error in startCall:", err);
      }
    }

    async function startVideoCall() {
      if (!socket) return;
      const jwt = localStorage.getItem("jwt");
      if (!jwt) return;
      if (!peerConnection?.current) return;

      const id = jwtDecode(jwt)?.id;
      setIsCall(true);
      setIsIncoming(false);
      setIsVideoCall(true);

      if (callRingRef?.current) {
        await callRingRef.current.play();
      }

      try {
        mediaRef.current = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
          video: true,
        });

        mediaRef?.current
          ?.getTracks()
          ?.forEach((track) =>
            peerConnection?.current?.addTrack(track, mediaRef.current)
          );

        const offer = await peerConnection?.current?.createOffer();
        await peerConnection?.current?.setLocalDescription(offer);
        await new Promise((resolve) => setTimeout(resolve, 500));
        socket.emit("start-call", {
          to: Number(params),
          from: id,
          offer,
          type: "video",
        });
      } catch (err) {
        console.error("❌ Error in startCall:", err);
      }
    }

    async function answerCall(remoteOffer) {
      if (!peerConnection?.current) return;
      const jwt = localStorage.getItem("jwt");
      if (!jwt) return;
      const id = jwtDecode(jwt)?.id;

      if (callIncomingRingRef?.current) {
        callIncomingRingRef.current.pause();
        callIncomingRingRef.current.currentTime = 0;
      }

      try {
        mediaRef.current = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        mediaRef?.current
          ?.getTracks()
          ?.forEach((track) =>
            peerConnection?.current?.addTrack(track, mediaRef.current)
          );

        await peerConnection?.current?.setRemoteDescription(
          new RTCSessionDescription(remoteOffer.remoteOffer)
        );

        const answer = await peerConnection?.current?.createAnswer();
        await peerConnection?.current?.setLocalDescription(answer);

        await new Promise((resolve) => setTimeout(resolve, 500));
        socket.emit("answer", {
          to: remoteOffer.from,
          from: id,
          answer,
        });
      } catch (err) {
        console.error("❌ Error in answerCall:", err);
      }
    }

    async function answerVideoCall(remoteOffer) {
      if (!peerConnection?.current) return;
      const jwt = localStorage.getItem("jwt");
      if (!jwt) return;
      const id = jwtDecode(jwt)?.id;

      if (callIncomingRingRef?.current) {
        callIncomingRingRef.current.pause();
        callIncomingRingRef.current.currentTime = 0;
      }

      try {
        mediaRef.current = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
          video: true,
        });

        mediaRef?.current
          ?.getTracks()
          ?.forEach((track) =>
            peerConnection?.current?.addTrack(track, mediaRef.current)
          );

        setIsVideoCall(true);

        await peerConnection?.current?.setRemoteDescription(
          new RTCSessionDescription(remoteOffer.remoteOffer)
        );

        const answer = await peerConnection?.current?.createAnswer();
        await peerConnection?.current?.setLocalDescription(answer);

        await new Promise((resolve) => setTimeout(resolve, 500));

        socket.emit("answer", {
          to: remoteOffer.from,
          from: id,
          answer,
          type: "video",
        });
      } catch (err) {
        console.error("❌ Error in answerCall:", err);
      }
    }

    useEffect(() => {
      if (!socket) return;
      const jwt = localStorage.getItem("jwt");
      if (!jwt) return;
      const id = jwtDecode(jwt)?.id;
      const iceQue = [];

      if (
        !peerConnection?.current ||
        peerConnection.current?.signalingState === "closed"
      ) {
        const configuration = {
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        };
        peerConnection.current = new RTCPeerConnection(configuration);
      }

      peerConnection.current.onicecandidate = ({ candidate }) => {
        if (candidate) {
          socket.emit("ice-candidate", {
            candidate,
            to: !inComingUser ? Number(params) : Number(inComingUser),
            from: id,
          });
        }
      };

      peerConnection.connectionstatechange = () => {
        if (peerConnection.connectionState === "connected") {
          // handle connection
        }
      };

      peerConnection.current.ontrack = (event) => {
        const track = event.track;
        const stream = event.streams[0];

        if (track.kind === "audio") {
          const inboundStream = new MediaStream([track]);
          const audio = new Audio();
          audio.srcObject = inboundStream;
          audio.autoplay = true;
          audio.play().catch((err) => console.error("Playback error:", err));
        }

        if (track.kind === "video") {
          if (videoRef?.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
        }
      };

      socket.on("call-incoming", async ({ from, remoteOffer, type }) => {
        if (callIncomingRingRef?.current) {
          callIncomingRingRef.current.loop = true;
          callIncomingRingRef.current.play();
        }

        setIsVideoCall(type === "video");
        setIsCall(true);
        setIsIncoming(true);
        setIncomingUser(from);
        setRemoteOffer({ from, remoteOffer });
      });

      socket.on("ice-candidate", async ({ candidate }) => {
        if (isRemote.current && peerConnection?.current?.remoteDescription) {
          await peerConnection.current.addIceCandidate(
            new RTCIceCandidate(candidate)
          );
        } else {
          iceQue.push(candidate);
        }
      });

      socket.on("call-rejected", () => {
        mediaRef?.current?.getTracks()?.forEach((track) => track.stop());
        if (peerConnection?.current) {
          peerConnection.current.close();
          peerConnection.current = null;
        }
        if (callRingRef?.current) {
          callRingRef.current.pause();
          callRingRef.current.currentTime = 0;
        }
        if (callIncomingRingRef?.current) {
          callIncomingRingRef.current.pause();
          callIncomingRingRef.current.currentTime = 0;
        }

        setIsCall(false);
        setIsIncoming(false);
        setIncomingUser(null);
        setRemoteOffer({ from: "", remoteOffer: null });
        setIsInCall(false);
        setIsVideoCall(false);

        if (navigator.vibrate) navigator.vibrate(400);
      });

      socket.on("answer", async ({ answer }) => {
        if (!peerConnection?.current) return;

        if (peerConnection.current.signalingState !== "have-local-offer") {
          console.warn(
            "❗ Can't apply answer — wrong state:",
            peerConnection.current.signalingState
          );
          return;
        }

        if (callTimeout?.current) {
          clearTimeout(callTimeout.current);
        }

        try {
          await peerConnection.current.setRemoteDescription(
            new RTCSessionDescription(answer)
          );
          if (callRingRef?.current) {
            callRingRef.current.pause();
            callRingRef.current.currentTime = 0;
          }
          isRemote.current = true;

          for (let c of iceQue) {
            await peerConnection.current.addIceCandidate(
              new RTCIceCandidate(c)
            );
          }

          setIsInCall(true);
        } catch (err) {
          console.error("❌ Failed to apply answer:", err);
        }
      });

      return () => {
        socket.off("answer");
        socket.off("call-incoming");
        socket.off("ice-candidate");
        socket.off("call-rejected");
        if (peerConnection?.current) {
          peerConnection.current = null;
        }
      };
    }, [socket, peerConnection?.current]);
    
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
                <CallUI answerVideoCall={answerVideoCall} answerCall={answerCall} ref={ref} />
              )}
            

            <audio ref={ref} hidden autoPlay />

            <Chat
              startVideoCall={startVideoCall}
              startCall={startCall}
              chats={chats}
              params={params}
            />
          </Suspense>
        </div>
      </div>
    );
}

export default ChatWrapper
