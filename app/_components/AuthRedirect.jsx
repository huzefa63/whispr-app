'use client';

import { useRouter } from "next/navigation";
import { useEffect } from "react";

function AuthRedirect() {
    const router = useRouter();
    useEffect(()=>{
        const jwt = localStorage.getItem('jwt');
        if(jwt) router.replace('/chat-app');
        else router.replace('/auth/signin');
    },[])
    return null;
}

export default AuthRedirect
