'use client';

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { MdPersonAddAlt1 } from "react-icons/md";

function AddFriend() {
    const [number,setNumber] = useState('');
    const queryClient = useQueryClient();
    const searchParams = useSearchParams();
    const {mutate} = useMutation({
        mutationFn:addFriend,
        onSuccess:() => queryClient.invalidateQueries(['chats'])
    });
    async function addFriend(number){
        try {
          const jwt = localStorage.getItem("jwt");
          if(!jwt) return false;
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
        }
        
    }
    function handleSubmit(e){
        e.preventDefault();
        mutate(number);
    }
    return (
      <form onSubmit={handleSubmit} className="px-2 flex items-center justify-around  mt-3">
        <input
        value={number}
        onChange={(e)=>setNumber(e.target.value)}
          type="number"
          className="bg-[var(--surface)] focus:outline-none focus:border-[var(--border)] border-1 border-[var(--muted)] rounded-sm px-2 py-1 text-[var(--text)] "
        />
        <button className="bg-[var(--surface)] p-3 rounded-full hover:cursor-pointer hover:bg-[var(--background)]  border-1 border-[var(--muted)]">
          <MdPersonAddAlt1 className="text-2xl text-[var(--text)]" />
        </button>
      </form>
    );
}

export default AddFriend
