'use client';

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { MdPersonAddAlt1 } from "react-icons/md";

function AddFriend() {
    const [number,setNumber] = useState('');
    const queryClient = useQueryClient();
    const searchParams = useSearchParams();
    const {mutateAsync} = useMutation({
        mutationFn:addFriend,
        
        onSuccess:() => queryClient.invalidateQueries(['chats'])
    });
   const [disableSubmit,setDisableSubmit] = useState();
   const router = useRouter();
    async function addFriend(number){
        try {
          const jwt = localStorage.getItem("jwt");
          if(!jwt) return false;
          if(disableSubmit) return;
          setDisableSubmit(true);
          const chatRes = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/chat/createChat/${number}`,
            { headers: { Authorization: `jwt=${jwt}` } }
          );
          return true;
        } catch (err) {
          console.log(err);
          return false;
        }finally{
          setNumber('');
          setDisableSubmit(false);
        }
        
    }
    function handleSubmit(e){
        e.preventDefault();
        
        toast.promise(mutateAsync(number), {
          loading: "adding friend...",
          success: <b>adding friend!</b>,
          error: <b>Could not add, maybe friend does not exist!</b>,
        })
    }
  
    return (
      <form
        onSubmit={handleSubmit}
        className=" flex items-center overflow-hidden justify-between gap-1 px-2  mt-3 max-w-full"
      >
        <button
          type="button"
          onClick={() => {
            localStorage.removeItem("jwt");
            router.replace("/auth/signin");
          }}
          className="px-3 py-1 h-fit opacity-80 left-2 top-2 hover:bg-red-500 transition-all duration-300 ease-in-out hover:cursor-pointer bg-neutral-800 text-white rounded-sm"
        >
          logout
        </button>
        <input
          placeholder="add a friend with contact number"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          type="number"
          className="bg-[var(--surface)] flex-1 no-spinner placeholder:text-sm h-fit focus:outline-none focus:border-[var(--border)] border-1 border-[var(--muted)] rounded-sm px-2 py-1 text-[var(--text)] "
        />
        <button className="bg-[var(--surface)] lg:p-3 p-2 rounded-full hover:cursor-pointer hover:bg-[var(--background)]  border-1 border-[var(--muted)]">
          <MdPersonAddAlt1 className="lg:text-2xl text-xl text-[var(--text)]" />
        </button>
      </form>
    );
}

export default AddFriend
