"use client"
import React, { useState } from 'react';


interface Datos {
    setDatosMenor: React.Dispatch<React.SetStateAction<{
        nombre: string;
        apellido: string;
        edad: number;
        fechaNacimiento: string;
        dni: number;
        pais: string;
        provincia: string;
        localidad: string;
        calle: string;
        numero: number;
    }>>;
}

const DatosMenor: React.FC<Datos> = ({ setDatosMenor }) => {
    // Estado para almacenar mensajes de error
    const [errorMessage, setErrorMessage] = useState<string>("");

    return (
        <div>
            <div className='p-4'>
                <h3 className='p-2 shadow-md w-60'>Inscripción a talleres - Menores</h3>
            </div>

            <div className='flex flex-col'>
                <h1 className='flex  items-center justify-center  font-bold text-2xl'>Datos del Menor</h1>
                <div className='flex  justify-center '>
                    <div className=" mx-auto  rounded-lg  px-8 py-6 grid grid-cols-2 gap-x-12 max-w-2xl">
                        <div className='flex-col p-3 flex '>
                            <label htmlFor="nombre">Nombre</label>
                            <input id='nombre' type="text" placeholder="Ingrese su nombre" className="border rounded" onChange={(e) => setDatosMenor(prev => ({ ...prev, nombre: e.target.value }))} />
                        </div>

                        <div className='flex-col p-3 flex '>
                            <label htmlFor="apellido">Apellido</label>
                            <input id='apellido' type="text" placeholder="Ingrese su apellido" className="border rounded" onChange={(e) => setDatosMenor(prev => ({ ...prev, apellido: e.target.value }))} />
                        </div>

                        <div className='flex-col p-3 flex'>
                            <label htmlFor="edad">Edad</label>
                            <input id='edad' type="number" placeholder="Ingrese su edad" className="border rounded" onChange={(e) => setDatosMenor(prev => ({ ...prev, edad: parseInt(e.target.value) }))} />
                        </div>

                        <div className='flex-col p-3 flex'>
                            <label htmlFor="fechaNacimiento">Fecha de Nacimiento</label>
                            <input id='fechaNacimiento' type="date"  className="border rounded" onChange={(e) => setDatosMenor(prev => ({ ...prev, fechaNacimiento: e.target.value }))} />
                        </div>

                        <div className='flex-col p-3 flex'>
                            <label htmlFor="dni">DNI</label>
                            <input id='dni' type="text" placeholder="Ingrese su DNI" className="border rounded" onChange={(e) => setDatosMenor(prev => ({ ...prev, dni: parseInt(e.target.value) }))} />
                        </div>

                        <div className='flex-col p-3 flex '>
                            <label htmlFor="pais">País</label>
                            <input id='pais' type="text" placeholder="Ingrese su país" className="border rounded" onChange={(e) => setDatosMenor(prev => ({ ...prev, pais: e.target.value }))} />
                        </div>

                        <div className='flex-col p-3 flex '>
                            <label htmlFor="provincia">Provincia</label>
                            <input id='provincia' type="text" placeholder="Ingrese su provincia" className="border rounded" onChange={(e) => setDatosMenor(prev => ({ ...prev, provincia: e.target.value }))} />
                        </div>

                        <div className='flex-col p-3 flex'>
                            <label htmlFor="localidad">Localidad</label>
                            <input id='localidad' type="text" placeholder="Ingrese su localidad" className="border rounded" onChange={(e) => setDatosMenor(prev => ({ ...prev, localidad: e.target.value }))} />
                        </div>

                        <div className='flex-col p-3 flex'>
                            <label htmlFor="calle">Calle</label>
                            <input id='calle' type="text" placeholder="Ingrese su calle" className="border rounded" onChange={(e) => setDatosMenor(prev => ({ ...prev, calle: e.target.value }))} />
                        </div>

                        <div className='flex-col p-3 flex '>
                            <label htmlFor="numero">Número</label>
                            <input id='numero' type="text" placeholder="Ingrese el número" className="border rounded" onChange={(e) => setDatosMenor(prev => ({ ...prev, numero: parseInt(e.target.value) }))} />
                        </div>
                    </div>
                </div>
            </div>


        </div>
    )
}
export default DatosMenor;