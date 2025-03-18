"use client"
import React, { useState } from 'react';

const Consentimiento: React.FC = () => {

    // Estado para almacenar mensajes de error
    const [alertaFinal, setAlertaFinal] = useState<boolean>(false);

    return (
        <div>
        {alertaFinal && <div className="absolute top-2/3 right-1/3 transform -translate-x-1/3 -translate-y-1/9 bg-white p-6 rounded-md shadow-md w-96">
            <h2 className="text-lg font-bold mb-2">Términos y condiciones</h2>
            <p className="text-sm text-gray-600 mb-4">
            Al registrarse y utilizar la plataforma de Casa Jardín, usted (Padre/Madre/Tutor o mayor de edad responsable) declara haber leído y aceptado estos Términos y Condiciones, así como nuestra Política de Privacidad.
                <strong> Si no está de acuerdo, por favor, absténgase de utilizar nuestros servicios.</strong>
            </p>
            <div className="flex items-center mb-4">
                <input type="checkbox" id="accept" className="mr-2" />
                <label htmlFor="accept" className="text-sm text-gray-700">I accept the terms</label>
            </div>
            <p className="text-xs text-blue-600 mb-4 cursor-pointer">Read our T&Cs</p>

            <div className="flex space-x-2">
                <button className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md w-1/2 hover:bg-gray-400"
                    onClick={() => setAlertaFinal(false)}>
                    Cancelar
                </button>
            </div>
        </div>
        }
<div className='flex flex-col items-center mt-8 border-t p-4 text-center'>
    <p className="text-sm">
        Al hacer clic en Registrarse, usted está aceptando el&nbsp;
        <button className="text-red-500 underline font-medium" onClick={() => setAlertaFinal(true)}>
            Consentimiento
        </button>
    </p>
</div>
    </div>
    )
}
export default Consentimiento;