'use client';
import { useEffect } from "react"
import { useRouter } from "next/navigation";
function useAuth() {
    const router = useRouter();
   useEffect(()=>{
    const token = localStorage.getItem('jwt');
    if(!token){
        router.replace('/home')
    }else{
        console.log('logged in');
    }
   },[])
}

export default useAuth
