'use client';
import { cloneElement, useEffect, useRef } from "react";
import { createPortal } from "react-dom"

function ModelWindow({children,close}) {
    const ref = useRef(null);
    useEffect(function(){
        function closeModel(e){
            if(ref.current && e.target.contains(ref.current)){
                close();
                
            }
        }
        document.addEventListener('click',closeModel);
        return ()=> document.removeEventListener('click',closeModel)
    },[])
    return createPortal(
      <div ref={ref} className="fixed top-0 left-0 w-full h-screen backdrop-blur-[1px] z-[1000] flex justify-center items-center">
        {cloneElement(children, { close })}
      </div>,
      document.getElementById("root")
    );
}

export default ModelWindow;
