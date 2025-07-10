"use client";
import { MdCallEnd } from "react-icons/md";

export function EndCallButton({ handler }) {
    return (
        <button className="px-3 py-3 rounded-full bg-red-500" onClick={handler}>
            <MdCallEnd className="text-2xl" />
        </button>
    );
}
