'use client';
// import {jwtDecode} from 'jwt-decode';
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

function decodeTokenReturnUserId(token){
    const userId = jwtDecode(token);
    return userId.id;
}

const Context = createContext();
function SocketProvider({children}) {
    const [socket,setSocket] = useState(null);
    const [token,setToken] = useState(()=>{
        if(typeof window !== 'undefined'){
            return localStorage.getItem("jwt");
        }
    });
    useEffect(()=>{
        function handleStorage(event){
            if(event.key === 'jwt') setToken(event.newValue);
        }
       window.addEventListener('storage',handleStorage);
       return ()=> window.removeEventListener('storage',handleStorage);
    },[])
    useEffect(()=>{
        console.log('from outside of io socket');
        console.log(token);
        if(!socket && token){
        console.log('from inside of io')

            setSocket(io(`${process.env.NEXT_PUBLIC_BACKEND_URL}/`,{auth:{jwt:token}}));
        }
        if(socket && !token){
            socket?.disconnect?.();
            console.log('socket disconnected');
        }
        return () => {
            if(socket){
                socket?.disconnect?.();
                socket = null;
                console.log('socket disconnected');
            }
        }
    },[token]);
    return (
        <Context.Provider value={{socket}}>
            {children}
        </Context.Provider>
    )
}

export function UseSocketContext(){
    return useContext(Context);
}

export default SocketProvider
