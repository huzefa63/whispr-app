import { io } from "socket.io-client";

let socket = null;


export default function connectSocket(userId){
    if(!socket){
        socket = io(`${process.env.NEXT_PUBLIC_BACKEND_URL}/`,{auth:{userId}})
    }
    return socket;
}
