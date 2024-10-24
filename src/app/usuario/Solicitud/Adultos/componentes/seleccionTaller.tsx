"use client"
import React, { useState, useEffect } from 'react';
import adultos from "../../../../../public/Images/adultos.jpg";
import menores from "../../../../../public/Images/menores.jpg";
import But_aside from "../../../../../components/but_aside/page";
import Image from "next/image";
import Navigate from '../../../../../components/alumno/navigate/page';
import { getImages_talleresAdmin } from '@/services/repoImage';
import { getCursos } from '@/services/cursos';

interface Datos {
    setSelectedCursosId: React.Dispatch<React.SetStateAction<number[]>>;
    selectedCursosId: number[];
}

const SeleccionTaller: React.FC<Datos> = ({setSelectedCursosId, selectedCursosId}) => {
    // Estado para almacenar la lista de cursos
    const [cursos, setCursos] = useState<{ id: number; nombre: string; year: number; descripcion: string }[]>([]);

       // Estado para almacenar mensajes de error
    const [errorMessage, setErrorMessage] = useState<string>("");
    //Estado para almacenar las imagenes
    const [images, setImages] = useState<any[]>([]);
    const [downloadurls, setDownloadurls] = useState<any[]>([]);
    //region useEffect
    useEffect(() => {
        fetchCursos(); // Llama a la función para obtener cursos
        fetchImages();
    }, []);

    // Método para obtener las imagenes
    const fetchImages = async () => {
        // await getApiProvincia();
        //await getApiLocalidades(22);
        //await getApiDirecciones("Libertador San Martin");
        const result = await getImages_talleresAdmin();
        console.log(result.images, "LAS IMAGENESSSSS")
        console.log(result.downloadurls, "LOS DOWNLOADURLS")
        if (result.error) {
            setErrorMessage(result.error)
        } else {
            console.log(result)
            setImages(result.images);
            setDownloadurls(result.downloadurls);

        }
    };
    // region funciones
    // Función para obtener la lista de cursos
    async function fetchCursos() {
        try {
            let curs = await getCursos(); // Obtén la lista de cursos
            setCursos(curs); // Actualiza el estado con la lista de cursos
        } catch (error) {
            console.error("Imposible obtener cursos", error); // Manejo de errores
        }
    }
    const handleButtonClick = (id: number) => {
        setSelectedCursosId(prevSelectedCursoId => {
            //si el id ya está en el array, lo elimina
            if (prevSelectedCursoId.includes(id)) {
                return prevSelectedCursoId.filter(prevId => prevId !== id);
            } else {
                //si el id no está en el array, lo agrega
                return [...prevSelectedCursoId, id];
            }
        });
    };

    return (
        <div>
            <div className='p-4'>
                <h3 className='p-2 shadow-md w-60'>Inscripción a talleres - Mayores</h3>
            </div>
            <div className='flex justify-center mt-20'>
                <h1 className='font-bold text-xg'>Elija los talleres de interés</h1>
            </div>
            <div className='flex justify-center mt-5'>
                <div className='flex justify-center max-w-fit py-5  bg-gray-300 shadow-md'>
                    {cursos.map((curso, index) => (
                        <button
                            key={curso.id}
                            className={`p-4 mx-2 relative  justify-center items-center ${selectedCursosId?.includes(curso.id) ? 'bg-blue-500' : 'bg-gray-300'}`}
                            onClick={() => handleButtonClick(curso.id)}
                        >
                            <div className="relative w-60 h-40 ">
                                {<Image
                                    /*         src={getUrlImage(curso.nombre)} */
                                    src={downloadurls[index]}
                                    alt="Background Image"
                                    objectFit="cover"
                                    className="w-full h-full"
                                    layout="fill"
                                />}

                            </div>
                            <h3 className="flex  bottom-0 text-black z-1">{curso.nombre}</h3>
                        </button>
                    ))}
                </div>

            </div>

        </div>
    )
}
export default SeleccionTaller;