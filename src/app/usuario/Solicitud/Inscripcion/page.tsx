"use client"
import React, { useState, useEffect } from 'react';
import adultos from "../../../../../public/Images/adultos.jpg";
import menores from "../../../../../public/Images/menores.jpg";
import But_aside from "../../../../components/but_aside/page";
import Image from "next/image";
import Navigate from '../../../../components/alumno/navigate/page';
import { autorizarUser, fetchUserData } from '@/helpers/cookies';
import { useRouter } from 'next/navigation';
import { calcularEdad } from '@/helpers/fechas';
import LogoPdf from "../../../../../public/Images/logopdf.jpg"
import Loader from '@/components/Loaders/loading/page';


const Inscripcion: React.FC<{}> = () => {

    const [edad, setEdad] = useState<number>(0);
    const router = useRouter();
    const [error, setError] = useState<string>("");
    const [alumnoDetails, setAlumnoDetails] = useState<{
        id: number; nombre: string; apellido: string; dni: number;
        telefono: number; email: string; fechaNacimiento: string; direccionId?: number; rolId?: number;
    }>();
    // Para cambiar al usuario de página si no está logeado
    useEffect(() => {
        const authorizeAndFetchData = async () => {
            // Primero verifico que el user esté logeado
            //console.log("router", router);
            await autorizarUser(router);
            // Una vez autorizado obtengo los datos del user y seteo el email
            const user = await fetchUserData();
            setAlumnoDetails(user);
            //console.log("user", user);
            if (user) {
                setEdad(calcularEdad(user.fechaNacimiento));
            }
        };
        authorizeAndFetchData();

    }, [router]);
    const validateClick = () => {
        if (edad && edad >= 18) {
            if (!alumnoDetails?.dni || !alumnoDetails?.telefono || !alumnoDetails?.direccionId) {
                return ("Debe completar los datos personales antes de continuar");
            }
        }
        if (edad && edad < 18) {
            if (!alumnoDetails?.dni || !alumnoDetails?.direccionId) {
                return ("Debe completar los datos personales antes de continuar");
            }
        }
        return null;
    }
         // Ruta al archivo PDF en la carpeta public
         const pdfUrlMenores = '/inscripcion_pdf/cet INSCRIPCIONES 2023  uso de imagen y salidas cercasnas.pdf';
         
         const pdfUrlAdultos = '/inscripcion_pdf/Planilla inscripción adultos.pdf';
       
         // Función para manejar la descarga
         const handleDownloadMenores = () => {
           // Crear un enlace temporal
           const link = document.createElement('a');
           link.href = pdfUrlMenores;
           link.download = "Planilla inscripción menores.pdf";
           document.body.appendChild(link);
           link.click();
           document.body.removeChild(link);
         };
         const handleDownloadMayores = () => {
            // Crear un enlace temporal
            const link = document.createElement('a');
            link.href = pdfUrlAdultos;
            link.download = "Planilla inscripción mayores.pdf";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          };

    return (
        <main>
            <Navigate />
            <div className='p-4'>
                <h3 className='p-2 shadow-md w-40'>Inscripción a talleres</h3>
            </div>
            <div className='flex justify-center mt-10'>
                <h1 className='font-bold text-xg'>Elija el tipo de inscripción</h1>
            </div>
            {error != '' && <div className="absolute top-1/2 right-1/3 transform -translate-x-1/3 -translate-y-1/4 bg-white border p-4 rounded-md shadow-md w-96">
                <h2 className="text-lg font-bold text-red-600 mb-2">Error</h2>
                <p className="text-sm text-red-700 mb-4">{error}</p>
                <div className="flex justify-end space-x-2">
                    <button
                        className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                        onClick={() => setError('')}
                    >
                        Cerrar
                    </button>
                </div>
            </div>}
            <div className='mt-4 flex justify-center border-b mx-auto px-8 py-6  max-w-2xl  w-80 h-60' >
                {edad !== 0  ? (edad < 18 ? (
                    <button className="flex flex-col items-center" onClick={() => {
                        const vali = validateClick();
                        if (vali) {
                            setError(vali);
                        } else {
                            window.location.href = "/usuario/Solicitud/Menores";
                        }
                    }
                    }>
                        <Image src={menores} alt="menores" width={300} height={180} />
                        <span className='mt-2'>Inscripción para menores <br /> Uso de imagen y salidas cercanas</span>
                    </button>
                ) : (
                    <button className="flex flex-col items-center" onClick={() => {
                        const vali = validateClick();
                        if (vali) {
                            setError(vali);
                        } else {
                            window.location.href = "/usuario/Solicitud/Mayores";
                        }
                    }
                    }>
                        <Image src={adultos} alt="adultos" width={280} height={100} />
                        <span className='mt-2'>Inscripción para adultos</span>
                    </button>
                )): (
                <div className="flex justify-center items-center" >
                   <Loader  />
                </div>)}
            </div>
            <div className="flex justify-center items-center mt-5">
                <div className="text-center">
                    <h2 className="  mb-4 max-w-lg px-3 font-bold text-sm">Si desea continuar con la inscripción de manera presencial, descargue los siguientes formularios</h2>
                    <button className="  py-2 px-4 rounded hover:underline" onClick={handleDownloadMenores}>
                        <Image className='ml-9' src={LogoPdf} alt='menores.pdf' width={80} height={60}/>
                        Inscripción para menores
                    </button>
                    <button className="  py-2 px-4 rounded mt-2 hover:underline" onClick={handleDownloadMayores}>
                        <Image className='ml-6' src={LogoPdf} alt='adultos.pdf' width={80} height={60}/>
                        Inscripción para adultos
                    </button>
                </div>
            </div>
            <div
                className="bg-sky-600 fixed bottom-0 py-2 border-t w-full z-30"
            >
                <But_aside />
            </div>
        </main>
    )
}
export default Inscripcion;