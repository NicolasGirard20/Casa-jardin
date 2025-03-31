"use client"
import React, { useState } from 'react';
import { XCircle } from "lucide-react";
const Consentimiento: React.FC = () => {

    // Estado para almacenar mensajes de error
    const [alertaFinal, setAlertaFinal] = useState<boolean>(false);

    return (
        <div className='w-full '>
            {alertaFinal && (
            <>
                <div className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>
                <div className="bg-white w-3/4 p-8 rounded-lg shadow-lg absolute left-1/2 transform -translate-x-1/2 -translate-y-full z-50 ">
                <button
                type='button'
                    className="text-gray-500 rounded-full absolute right-4 top-4 hover:text-red-500"
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.stopPropagation();
                        setAlertaFinal(false);
                    }}
                >
                    <XCircle className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-semibold mb-4">Términos y condiciones</h2>
                <p className="text-base text-gray-700 mb-6">
                    Al registrarse y utilizar la plataforma de Casa Jardín, usted (Padre/Madre/Tutor o mayor de edad responsable) declara haber leído y aceptado estos Términos y Condiciones, así como nuestra Política de Privacidad.
                    <strong> Si no está de acuerdo, por favor, absténgase de utilizar nuestros servicios.</strong>
                </p>
                </div>
            </>
            )}
            <div className='flex flex-col items-center mt-8 border-t p-4 text-center'>
            <p className="text-sm">
                Al hacer clic en Registrarse, usted está aceptando el&nbsp;
                <button  type="button" className="text-red-500 underline font-medium" onClick={() => setAlertaFinal(true)}>
                Consentimiento
                </button>
            </p>
            </div>
        </div>
    )
}
export default Consentimiento;