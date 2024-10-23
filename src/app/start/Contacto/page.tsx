"use client";
// #region Imports
import React, { useState } from "react";
import Navigate from "../../../components/start/navigate/page";
import But_aside from "../../../components/but_aside/page";
import Image from "next/image";
import Background from "../../../../public/Images/Background.jpeg";

// #endregion Imports

const Contacto = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Form submitted: ", formData);
        // Aquí puedes agregar la lógica para enviar el formulario
    };

    return (
        <main className="relative min-h-screen w-screen">
            <Image
                src={Background}
                alt="Background"
                layout="fill"
                objectFit="cover"
                quality={80}
                priority={true}
            />
            <div>
                <div className="fixed bg-blue-400 justify-between w-full p-4 z-50">
                    <Navigate />
                </div>
                <div className="fixed bottom-0 bg-white w-full z-40" style={{ opacity: 0.66 }}>
                    <But_aside />
                </div>
                <div className="relative flex flex-col justify-center items-center space-y-4 h-full pt-40">
                    <h1 className="text-3xl text-black">Comunícate con nosotros</h1>
                    <h2 className="text-xl text-black text-center px-4 md:px-0">
                        Le extendemos este formulario, a fin de que pueda comunicarse con nosotros, y saldar cualquier duda que tenga.
                    </h2>

                    <form onSubmit={handleSubmit} className="w-full max-w-md p-6 rounded-lg  space-y-4 bg-white bg-opacity-80 shadow-md">
                        <div className="flex flex-col">
                            <label htmlFor="name" className="text-black mb-2">Nombre</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="border border-gray-300 rounded-lg p-2 text-black"
                                placeholder="Nombre"
                                required
                            />
                        </div>

                        <div className="flex flex-col">
                            <label htmlFor="email" className="text-black mb-2">Correo Electrónico*</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="border border-gray-300 rounded-lg p-2 text-black"
                                placeholder="Correo electrónico*"
                                required
                            />
                        </div>

                        <div className="flex flex-col">
                            <label htmlFor="message" className="text-black mb-2">Mensaje</label>
                            <textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                className="border border-gray-300 rounded-lg p-2 text-black h-32"
                                placeholder="Mensaje"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition duration-200 mx-auto block"
                        >
                            Enviar
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
};

export default Contacto;
