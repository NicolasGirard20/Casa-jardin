"use client"
import React, { useState } from 'react';
import { XCircle } from "lucide-react";
import { time } from 'console';
const Consentimiento: React.FC = () => {

    // Estado para almacenar mensajes de error
    const [alertaFinal, setAlertaFinal] = useState<boolean>(false);

    return (
        <div className='w-full '>
            {alertaFinal && (
                <>
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>
                    <div className="bg-white w-3/4 p-8 rounded-lg shadow-lg absolute left-1/2 transform -translate-x-1/2 -translate-y-[125%] sm:-translate-y-[80%] md:-translate-y-[80%] lg:-translate-y-[80%] z-50 ">

                        {/* <h2 className="text-xl font-semibold mb-4">Términos y condiciones</h2>
                <p className="text-base text-gray-700 mb-6">
                    Al registrarse y utilizar la plataforma de Casa Jardín, usted (Padre/Madre/Tutor o mayor de edad responsable) declara haber leído y aceptado estos Términos y Condiciones, así como nuestra Política de Privacidad.
                    <strong> Si no está de acuerdo, por favor, absténgase de utilizar nuestros servicios.</strong>
                </p> */}
                        <div className="space-y-4 text-gray-700 overflow-y-auto max-h-[70vh]">
                            <h2 className="text-2xl font-bold text-center mb-4">Términos y Condiciones de Casa Jardín</h2>
                            <p className="text-sm text-gray-500 text-center">Última actualización: 14/04/2025</p>
                            <p>
                                Bienvenido/a al sitio web de <strong>Casa Jardín</strong>. Al acceder o utilizar este sitio web, usted acepta los siguientes términos y condiciones. Si no está de acuerdo con ellos, por favor, no utilice este sitio.
                            </p>
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold">1. Uso del sitio</h3>
                                <p>
                                    Este sitio web tiene como finalidad ofrecer información sobre nuestros talleres, gestionar inscripciones y facilitar el acceso a contenidos educativos. El uso del sitio está permitido para usuarios de todas las edades, aunque algunos contenidos pueden estar dirigidos a públicos específicos (niños, adolescentes, adultos).
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold">2. Registro de usuarios</h3>
                                <p>
                                    Para acceder a ciertos servicios (como la inscripción a talleres), deberá registrarse proporcionando información veraz y actualizada. Usted es responsable de mantener la confidencialidad de sus credenciales de acceso.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold">3. Participación de menores de edad</h3>
                                <p>
                                    La inscripción de menores de edad deberá ser realizada y supervisada por un adulto responsable. Algunos talleres pueden requerir la presencia o autorización de un padre, madre o tutor legal.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold">4. Conducta del usuario</h3>
                                <p>
                                    El usuario se compromete a utilizar el sitio y los recursos con respeto hacia el equipo, otros usuarios y los instructores. Cualquier conducta ofensiva, abusiva o fuera de lugar podrá implicar la suspensión del acceso.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold">5. Protección de datos</h3>
                                <p>
                                    En cumplimiento con la Ley N.º 25.326 de Protección de los Datos Personales de la República Argentina, informamos que los datos personales recolectados a través de este sitio serán tratados con estricta confidencialidad y exclusivamente para fines académicos, administrativos y de comunicación con el usuario.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold">6. Modificaciones</h3>
                                <p>
                                    La academia se reserva el derecho de modificar estos Términos y Condiciones en cualquier momento. Se notificará a los usuarios registrados sobre cambios relevantes.
                                </p>
                            </div>
                            <button
                                type='button'
                                className=" rounded-full text-center w-full font-bold items-center hover:font-semibold text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2  px-4 py-2 mt-4"
                                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                    e.stopPropagation();
                                    setAlertaFinal(false);
                                }}
                            >
                                Aceptar
                            </button>
                        </div>

                    </div>
                </>
            )}
            <div className='flex flex-col items-center mt-8 border-t p-4 text-center'>
                <p className="text-sm">
                    Al hacer clic en Registrarse, usted está aceptando los&nbsp;
                    <button type="button" className=" underline font-semibold" onClick={() => setAlertaFinal(true)}>
                        terminos y condiciones
                    </button> de Casa Jardín.
                </p>
            </div>
        </div>
    )
}
export default Consentimiento;