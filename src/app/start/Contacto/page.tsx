"use client";
// #region Imports
import React, { useEffect, useState } from "react";
import Navigate from "../../../components/Start/navigate/page"
import But_aside from "../../../components/but_aside/page";
import Image from "next/image";
import Background from "../../../../public/Images/Background.jpg";

// #endregion Imports

const Contacto = () => {

    return(
        <main className="relative min-h-screen w-screen">
            <Image src={Background} alt="Background" layout="fill" objectFit="cover" quality={80} priority={true}/>
            <div>
                <div className="fixed bg-blue-400  justify-between w-full p-4">
                    <Navigate/>
                </div>
                <div className="fixed bottom-0 mt-20 bg-white w-full" style={{ opacity: 0.66 }}>
                    <But_aside />
                </div>
                <div className="relative flex flex-col justify-center items-center h-80 space-y-4">
                    <h1 className="text-3xl text-black">Comunícate con nosotros</h1>
                    <h2 className="text-xl text-black">Le extendemos este formulario, a fin de que pueda comunicarse con nosotros, y saldar cualquier duda que tenga.</h2>
                </div>
            </div>
        </main>
    )
}

export default Contacto;