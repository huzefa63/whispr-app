'use client';
// import {jwtDecode} from 'jwt-decode';
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

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
            if(event.key === 'jwt'){
                setToken(event.newValue);
                setSocket(null);
            };
        }
       window.addEventListener('storage',handleStorage);
       return ()=> window.removeEventListener('storage',handleStorage);
    },[])
    useEffect(() => {
      if (!token) return;

      
      const newSocket = io(`${process.env.NEXT_PUBLIC_BACKEND_URL}/`, {
        auth: { jwt: token },
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
        console.log("🔌 Socket disconnected");
      };
    }, [token]);
      
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
