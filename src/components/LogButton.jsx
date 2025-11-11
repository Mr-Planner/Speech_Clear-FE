import React from "react";
import logIn from "../assets/header/log-in.svg";
import logOut from "../assets/header/log-out.svg";

export default function LogButton({ text, onClick }) {

    return (
        <button
            onClick={onClick}
            className="
            flex items-center justify-center gap-2 
            border border-gray-300 rounded-lg
            px-2.5 py-1
            bg-white shadow-sm cursor-pointer
            hover:shadow-md hover:border-gray-400
            transition-all duration-200
            "
        >
            <span className="text-sm font-semibold text-gray-800">{text}</span>
                {/* <ArrowRight size={20} className="text-gray-700" /> */}
            {text === "로그인" && <img src = {logIn}></img>}
            {text === "로그아웃" && <img src = {logOut}></img>}

        </button>               
    );
}
