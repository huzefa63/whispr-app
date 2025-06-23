"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { RiAccountCircleFill } from "react-icons/ri";
import { IoIosArrowRoundBack } from "react-icons/io";
import { BiDotsVertical } from "react-icons/bi";
import { useEffect, useRef, useState } from "react";
import { MdCall } from "react-icons/md";
import toast from "react-hot-toast";
import { UseSocketContext } from "./SocketProvider";
import CallUI from "./CallUI";
import { jwtDecode } from "jwt-decode";
function ChatProfile({ chats, params, setMessages }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { data: friend } = useQuery({
    queryKey: ["friend", searchParams.toString()],
    queryFn: getFriend,
    refetchOnWindowFocus: false,
  });
  const [showContext, setShowContext] = useState(false);
  const queryClient = useQueryClient();
  const buttonRef = useRef(null);
  const { socket } = UseSocketContext();
  const [isCall, setIsCall] = useState(false);
  const peerConnection = useRef(null);
  const [remoteOffer, setRemoteOffer] = useState({
    from: "",
    remoteOffer: null,
  });
  const localRef = useRef(null);
  const [isIncoming, setIsIncoming] = useState(false);
  const isRemote = useRef(false);
  async function getFriend() {
    if (!searchParams.get("friendId")) return [];
    try {
      const res = await axios.get(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL
        }/user/getFriend/${searchParams.get("friendId")}`
      );
      return res.data.friend;
    } catch (err) {
      console.log(err);
      return {};
    }
  }
  useEffect(() => {
    function handleClick(e) {
      if (showContext && e.target !== buttonRef.current) {
        setShowContext(false);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [showContext]);
  async function deleteMessages() {
    const jwt = localStorage.getItem("jwt");
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/message/deleteMessages/${params}`,
        {
          headers: {
            Authorization: `jwt=${jwt}`,
          },
        }
      );
      queryClient.setQueryData(["messages", params], (oldData) => {
        setMessages([]);
        return [];
      });
      queryClient.setQueryData(["chats"], (oldData) => {
        if (!oldData) return oldData;
        const oldChats = [...oldData?.chats];
        const index = oldChats?.findIndex(
          (el) => el?.userId == params || el?.user2Id == params
        );
        oldChats[index].recentMessage = null;
        oldChats[index].recentMessageSenderId = null;
        oldChats[index].isRecentMessageRead = false;
        oldChats[index].recentMessageCreatedAt = null;
        return { ...oldData, chats: oldChats };
      });
    } catch (err) {
      console.log(err);
      toast.error("failed to clear chat!");
    }
  }
  const ref = useRef(null);

  useEffect(() => {
    if (!socket) return;
    const jwt = localStorage.getItem("jwt");
    if (!jwt) return;

    const id = jwtDecode(jwt)?.id;
    const iceQue = [];
    if (!peerConnection.current) {
      const configuration = {
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      };
      peerConnection.current = new RTCPeerConnection(configuration);
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
        alert("ice applied");
      } else {
        alert("pushed to que");
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
          alert("qued ice applied");
        }
        console.log("✅ Answer applied successfully.");
      } catch (err) {
        console.error("❌ Failed to apply answer:", err);
      }
    });
    return () => {
      socket.off("answer");
      socket.off("call-incoming");
      if (peerConnection.current) {
        peerConnection.current = null;
      }
    };
  }, []);

  async function startCall() {
    if (!localRef.current) return alert("no localref");
    if (!socket) return;
    const jwt = localStorage.getItem("jwt");
    if (!jwt) return;
    if (!peerConnection.current) return;

    const id = jwtDecode(jwt)?.id;
    setIsCall(true);
    setIsIncoming(false);
    try {
      // ✅ Get mic access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // ✅ Play your own voice (muted to prevent echo)

      // localRef.current.srcObject = stream;
      // localRef.current.muted = true;
      // localRef.current.play();

      // ✅ Add audio tracks to peer connection
      stream
        .getTracks()
        .forEach((track) => peerConnection.current.addTrack(track, stream));

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

  async function answerCall(remoteOffer, localAudioRef) {
    if (!peerConnection.current) return;

    const jwt = localStorage.getItem("jwt");
    if (!jwt) return;
    const id = jwtDecode(jwt)?.id;

    try {
      // ✅ Get mic access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // ✅ Play your own voice (muted to prevent echo)
      if (localAudioRef.current) {
        localAudioRef.current.srcObject = stream;
        localAudioRef.current.muted = true;
        localAudioRef.current.play();
      }

      // ✅ Add audio tracks to peer connection
      stream
        .getTracks()
        .forEach((track) => peerConnection.current.addTrack(track, stream));

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

  return (
    <div className="h-full bg-[var(--muted)] lg:px-5 pr-3 flex justify-between items-center  w-full">
      {isCall && remoteOffer && (
        <CallUI
          isIncoming={isIncoming}
          answerCall={answerCall}
          localAudioRef={localRef}
          remoteOffer={remoteOffer}
          friend={friend}
        />
      )}
      <div className="h-full gap-7 hover:cursor-pointer transition-all duration-300 ease-in-out border-[var(--muted)] flex items-center px-2">
        {/* <img
          src="data:image/jpeg;base64,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"
          alt=""
          className="border-white h-[85%] w-[6%]  rounded-full"
        /> */}
        <div className="flex items-center">
          <audio ref={localRef} hidden autoPlay></audio>
          <IoIosArrowRoundBack
            onClick={() => {
              const newParams = new URLSearchParams(searchParams);
              newParams.delete("friendId");
              router.replace(`${pathname}?${newParams.toString()}`);
            }}
            className="text-5xl block lg:hidden text-[var(--text)]"
          />
          <RiAccountCircleFill className="text-5xl text-[var(--text)]" />
        </div>
        <div className="text-[var(--textDark)] tracking-wider">
          <p className="ml-1">{friend?.name}</p>
          <p className="text-xs brightness-75">
            {friend?.contactNumber && "+91"} {friend?.contactNumber}
          </p>
        </div>
      </div>
      <audio ref={ref} autoPlay controls />

      {/* <h1>hello</h1> */}
      <div className="flex gap-5 text-white items-center">
        <div
          className="text-3xl p-1 hover:bg-gray-600 hover:cursor-pointer"
          onClick={startCall}
        >
          <MdCall />
        </div>
        <div className=" relative z-[500] text-white">
          <span ref={buttonRef} className="">
            <BiDotsVertical
              className="hover:bg-gray-600 lg:text-lg text-sm hover:cursor-pointer w-6 h-6"
              onClick={() => setShowContext(!showContext)}
            />
          </span>
          {showContext && (
            // <div className="  flex justify-center items-center  border-1 border-neutral-600 rounded-sm    ">
            <button
              onClick={deleteMessages}
              className=" hover:cursor-pointer absolute top-7 right-2 transition-all duration-300 ease-in-out hover:bg-green-600 bg-green-500 rounded-sm h-fit whitespace-nowrap py-2 px-3"
            >
              clear chat
            </button>
            // </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatProfile;
