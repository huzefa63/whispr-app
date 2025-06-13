'use client';

import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

function AuthRedirect() {
    const router = useRouter();
    useEffect(()=>{
        const jwt = localStorage.getItem('jwt');
        if(jwt) {
            const payload = jwtDecode(jwt);
            const currentTime = Math.round(Date.now() / 1000);
            if(payload.exp && payload.exp < currentTime){
                router.replace('/auth/signin');
                
            }
            else router.replace('/chat-app');
        }
        else router.replace('/auth/signup');
    },[])
    return null;
}

export default AuthRedirect
