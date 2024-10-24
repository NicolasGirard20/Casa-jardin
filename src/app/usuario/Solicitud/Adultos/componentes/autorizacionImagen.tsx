"use client"
import React, { useState } from 'react';


interface Datos {
    setDatosAutorizacionImage: React.Dispatch<React.SetStateAction<{
        firma: string;
        observaciones: string;
    }>>;
}

const AutorizacionImg: React.FC<Datos> = ({ setDatosAutorizacionImage }) => {
    // Estado para almacenar mensajes de error
    const [errorMessage, setErrorMessage] = useState<string>("");

    return (
        <div>
            <div className='p-4'>
                <h3 className='p-2 shadow-md w-60'>Inscripción a talleres - Mayores</h3>
            </div>

            <div className='flex flex-col '>
                <h1 className='flex justify-center  font-bold text-2xl'>Autorización para uso de Imagen</h1>
                <div className='flex  justify-center '>
                    <p  className='w-1/2 text-center p-5'>Por medio de la presente, en mi carácter de Padre/Madre/ Tutor/Curador,
                     autorizo al Centro Educativo y Terapéutico “Casa Jardín”, 
                     a utilizar de manera amplia, irrestricta y gratuita las imágenes
                     CUIDADAS del/la menor, que sean tomadas en las Actividades del mismo,
                     con la promoción, difusión y conocimiento de sus actividades.
                     <br/>Renuncio expresa e irrevocablemente a todo y cualquier tipo de 
                     reclamo contra el CET, sus directores, autoridades y miembros en relación
                     a los derechos autorizados por medio de la presente sobre las Imágenes y/o 
                     a percibir cualquier suma en concepto de indemnización o remuneración por 
                     los usos autorizados precedentemente indicados, relevando al CET de cualquier 
                     responsabilidad al respecto.</p>
                </div>
                <div className='p-2   w-full justify-center mt-10'>
                    <div className='flex flex-col p-2  items-center'>
                        <label htmlFor="firma">Firma</label>
                        <input className="w-[50vh] border rounded-md" type="text" placeholder='Ingrese su firma' name="firma" id="firma" onChange={(e) => setDatosAutorizacionImage(prev => ({ ...prev, firma: e.target.value }))}/>
                    </div>

                    <div className='flex flex-col p-2  items-center'>
                        <label htmlFor="observaciones">Observaciones</label>
                        <input className="w-[50vh] border rounded-md" type="text" name="observaciones" id="observaciones" onChange={(e) => setDatosAutorizacionImage(prev => ({ ...prev, observaciones: e.target.value }))}/>
                    </div>
                </div>
            </div>


        </div>
    )
}
export default AutorizacionImg;