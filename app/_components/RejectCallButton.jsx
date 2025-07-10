"use client";
import { FaPhoneSlash } from "react-icons/fa";

export function RejectCallButton({ handler }) {
    return (
        <button
            className="hover:cursor-pointer rounded-full bg-red-500 hover:bg-red-600 px-3 py-3 "
            onClick={handler}
        >
            <FaPhoneSlash className="text-2xl" />
        </button>
    );
}
