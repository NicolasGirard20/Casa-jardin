"use client"
import React, { useState } from 'react';


interface Datos {
    setDatosReglamentacion: React.Dispatch<React.SetStateAction<{
        firma: string;
    }>>;
}

const Reglamentacion: React.FC<Datos> = ({ setDatosReglamentacion }) => {
    // Estado para almacenar mensajes de error
    const [alertaFinal, setAlertaFinal] = useState<boolean>(false);

    return (
        <div className='w-full h-full'>
            <div className='px-4 pb-8 w-full'>
                <h1 className='flex justify-center font-bold text-2xl'>Reglamento para alumnos de Centro Educativo Terapéutico CASA JARDÍN</h1>
                <div className='lg:w-1/2 md:1/2 sm:w-2/3 mx-auto mt-5 max-h-[45vh] overflow-y-auto border border-gray-300 rounded-lg p-4 shadow-sm'>
                    <p>
                        Bienvenido a  “Casa Jardín”, les comunicarnos que
                        hemos elaborado estas normas de convivencia y funcionamiento
                        de nuestros Talleres con el fin de establecer igualdad, seriedad
                        y regularidad  en todos los espacios educativos que brindamos.
                    </p>
                    <ol className='pl-10'>
                        <li>
                            1)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Los alumnos deben presentar al
                            inscribirse para el ciclo 2024 (enero-diciembre) las planillas
                            que corresponden a datos personales, autorización para salidas
                            cercanas en caso que corresponda y autorización para uso de imagen
                            cuidada en nuestras redes sociales. Respetar los horarios de entrada
                            y salida.
                        </li>
                        <li>
                            2)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Cada alumno debe concurrir a clases
                            con los elementos/ útiles/ instrumentos solicitados por el docente en
                            buen estado para que la dinámica de la clase no se vea afectada
                            perjudicando así a los compañeros de grupo.
                        </li>
                        <li>
                            3)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Los materiales y las instalaciones que
                            el centro pone a disposición de los alumnos deben ser cuidados por los
                            mismos, de ocasionar roturas intencionales o por el mal uso de ellos,
                            serán ellos quienes respondan por el valor de la reparación o reemplazo
                            según corresponda.
                        </li>
                        <li>
                            4)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Las cuotas serán abonadas dentro de los
                            primeros 5 días hábiles de cada mes y por adelantado.
                        </li>
                        <li>
                            5)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Asistencias:
                        </li>
                        <ul className='pl-10'>
                            <li>
                                a)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Los días feriados no se dictarán
                                talleres y no se descontará el día.
                            </li>
                            <li>
                                b)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;En caso de enfermedad o causa
                                importante q impida la asistencia del alumno, se conversará
                                con el docente de cada taller para ver la posibilidad de recuperar
                                la clase.
                            </li>
                            <li>
                                c)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Si el docente/ profesional se encuentra
                                enfermo o con dificultad seria para dictar la clase, la misma será
                                reprogramada u otro docente capacitado del equipo tomará a cargo el grupo
                                para que no se postergue la misma.
                            </li>
                            <li>
                                d)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Así mismo no se suspenden los encuentros
                                en caso de lluvia. Es decisión del alumno asiste o no a clase ese día,
                                siendo el clima causa no justificada para pedir recuperación de la misma.
                            </li>
                        </ul>
                    </ol>
                    <p>En mi carácter de alumno, manifiesto por medio de la presente mi conformidad con el reglamento establecido por el Centro Educativo Terapéutico “Casa Jardín” y con el código de convivencia que se me ha dado a conocer. De no ser cumplido el centro se reserva el derecho de admisión.</p>
                </div>
                <div>
                    {alertaFinal && <div className="absolute top-2/3 right-1/3 transform -translate-x-1/3 -translate-y-1/9 bg-white p-6 rounded-md shadow-md w-96">
                        <h2 className="text-lg font-bold mb-2">Términos y condiciones</h2>
                        <p className="text-sm text-gray-600 mb-4">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras purus mauris, congue in elit eu, hendrerit interdum mi.
                            <strong>Praesent lectus nibh, feugiat blandit justo fringilla, luctus semper odio.</strong>
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
                    <div className='flex justify-center items-center mt-8 flex-col border-t p-2'>
                        <label htmlFor="firma">Firma de Padre/Madre/Tutor</label>
                        <input type="text" name="firma" id="firma" className="border rounded w-96" placeholder='Ingrese su firma' onChange={(e) => setDatosReglamentacion(prev => ({ ...prev, firma: e.target.value }))} />
            
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Reglamentacion;