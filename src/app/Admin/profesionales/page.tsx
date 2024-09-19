"use client";
// #region Imports
import React, { useEffect, useState } from "react";
import Navigate from "../../../components/Admin/navigate/page";
import But_aside from "../../../components/but_aside/page";
import { updateCurso, getCursos, deleteCurso, createCurso } from "../../../services/cursos";
import { getProfesionales, deleteProfesional, createProfesional, updateProfesional } from "../../../services/profesional";
import Image from "next/image";
import DeleteIcon from "../../../../public/Images/DeleteIcon.png";
import EditIcon from "../../../../public/Images/EditIcon.png";
import Background from "../../../../public/Images/Background.jpg";
import ButtonAdd from "../../../../public/Images/Button.png";
import { getImages_talleresAdmin } from "@/services/repoImage";
import { getAlumno, deleteAlumno } from "@/services/Alumno";
// #endregion

const Usuarios = () => {
    // #region UseStates
    const [profesionales, setProfesionales] = useState<any[]>([]);
    const [selectedProfesional, setSelectedProfesional] = useState<any>(null);
    const [profesionalDetails, setProfesionalDetails] = useState<any>({});

    const [alumnos, setAlumnos] = useState<any[]>([]);
    const [selectedAlumno, setSelectedAlumno] = useState<any>(null);
    const [Details, setAlumnoDetails] = useState<any>({});

    // Estado para almacenar mensajes de error
    const [errorMessage, setErrorMessage] = useState<string>("");
    //Estado para almacenar las imagenes
    const [images, setImages] = useState<any[]>([]);
    // #endregion

    // #region UseEffects
    //useEffect para obtener los profesionales
    useEffect(() => {
        fetchProfesionales();
        fetchImages();
    }, []);

    useEffect(() => {
        if (selectedProfesional !== null) {
            setProfesionalDetails({
                nombre: selectedProfesional.nombre,
                apellido: selectedProfesional.apellido,
                email: selectedProfesional.email,
                especialidad: selectedProfesional.especialidad
            });
        } else {
            setProfesionalDetails({});
        }
    }, [selectedProfesional, profesionales]);
    // #endregion

    // #region Métodos
    async function fetchProfesionales() {
        try {
            const data = await getProfesionales();
            console.log(data);
            setProfesionales(data);
        } catch (error) {
            console.error("Imposible obetener Profesionales", error);
        }
    }

    // Método para obtener las imagenes
    const fetchImages = async () => {
        const result = await getImages_talleresAdmin();
        if (result.error) {
            setErrorMessage(result.error)
        } else {
            console.log(result)
            setImages(result.images);

        }
    };
    function validateProfesionalDetails() {
        const { nombre, apellido, email, especialidad } = profesionalDetails;

        //validar que el nombre sea de al menos 2 caracteres
        if (nombre.length < 2) {
            return "El nombre debe tener al menos 2 caracteres";
        }
        //validar que el apellido sea de al menos 2 caracteres
        if (apellido.length < 2) {
            return "El apellido debe tener al menos 2 caracteres";
        }
    }

    async function handleSaveChanges() {
        const validationError = validateProfesionalDetails();
        if (validationError) {
            setErrorMessage(validationError);
            return;
        }
        if (selectedProfesional === null) {
            try {
                await updateProfesional(selectedProfesional.id, profesionalDetails); //actualizar el profesional
                setSelectedProfesional(null);
                fetchProfesionales();
                setErrorMessage("");
            } catch (error) {
                console.error("Error al actualizar el profesional", error);
            }
        };
    }

    async function handleEliminarProfesional(profesional: any) {
        try {
            await deleteProfesional(profesional.id);
            fetchProfesionales();
        } catch (error) {
            console.error("Error al eliminar el profesional", error);
        }
    }

    async function handleCreateProfesional(){
        const validationError = validateProfesionalDetails();
        if (validationError) {
            setErrorMessage(validationError);
            return;
        }
        try {
            await createProfesional(profesionalDetails);
            setSelectedProfesional(null);
            fetchProfesionales();
            setErrorMessage("");
            setProfesionalDetails({});
        } catch (error) {
            console.error("Error al crear el profesional", error);
        }
    }

        // #region UseEffects
    //useEffect para obtener los profesionales
    useEffect(() => {
        fetchAlumnos();
        fetchImages();
    }, []);

    useEffect(() => {
        if (selectedAlumno !== null) {
            setAlumnoDetails({
                nombre: selectedAlumno.nombre,
                apellido: selectedAlumno.apellido,
                dni: selectedAlumno.dni,
                email: selectedAlumno.email,
                
            });
        } else {
            setAlumnoDetails({});
        }
    }, [selectedAlumno, alumnos]);
    // #endregion

    // #region Métodos
    async function fetchAlumnos() {
        try {
            const data = await getAlumno();
            console.log(data);
            setAlumnos(data);
        } catch (error) {
            console.error("Imposible obetener Alumnos", error);
        }
    }




    function validateAlumnoDetails() {
        const { nombre, apellido, dni, email } = Details;

        //validar que el nombre sea de al menos 2 caracteres
        if (nombre.length < 2) {
            return "El nombre debe tener al menos 2 caracteres";
        }
        //validar que el apellido sea de al menos 2 caracteres
        if (apellido.length < 2) {
            return "El apellido debe tener al menos 2 caracteres";
        }
    }

    async function handleSaveAlumnoChanges() {
        const validationError = validateAlumnoDetails();
        if (validationError) {
            setErrorMessage(validationError);
            return;
        }
        if (selectedAlumno === null) {
            try {
                await updateProfesional(selectedAlumno.id, Details); //actualizar el profesional
                setSelectedAlumno(null);
                fetchAlumnos();
                setErrorMessage("");
            } catch (error) {
                console.error("Error al actualizar el profesional", error);
            }
        };
    }

    async function handleEliminarAlumno(alumno: any) {
        try {
            await deleteAlumno(alumno.id);
            fetchAlumnos();
        } catch (error) {
            console.error("Error al eliminar el profesional", error);
        }
    }

    // #endregion


    // #region Return
    return (
        <main className="relative min-h-screen w-screen">
            <Image src={Background} alt="Background" layout="fill" objectFit="cover" quality={80} priority={true} />

            <div className="fixed bg-blue-400  justify-between w-full p-4" >
                <Navigate />
            </div>
            <h1 className="absolute top-40 left-60 mb-5 text-3xl" >Profesionales</h1>
            <div className="top-60 border p-1 absolute left-40 h-90 max-h-90" style={{ background: "#D9D9D9" }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 my-4">
                    {profesionales.map((profesional, index) => (
                        <div key={index} className="border p-4 mx-2 relative w-47 h-47 justify-center items-center" >
                            <div className="relative w-80 h-70">
                                {<Image
                                    src={images[0]}
                                    alt="Background Image"
                                    objectFit="cover"
                                    className="w-full h-full"
                                    layout="fill"
                                />}
                                <button onClick={() => handleEliminarProfesional(profesional)} className="absolute top-0 right-0 text-red-600 font-bold">
                                <Image src={DeleteIcon} alt="Eliminar" width={27} height={27} />
                                </button>
                                
                                <button onClick={() => setSelectedProfesional(profesional)} className="absolute top-0 right-8 text-red-600 font-bold">
                                    <Image src={EditIcon} alt="Editar" width={27} height={27} />
                                </button>
                            </div>
                            <h3 className="flex  bottom-0 text-black z-1">{profesional.nombre} {profesional.apellido}</h3>
                        </div>
                    ))}
                </div>
                <button onClick={() => setSelectedProfesional(null)} className="mt-6 mx-4">
                    <Image src={ButtonAdd}
                        className="mx-3"
                        alt="Image Alt Text"
                        width={70}
                        height={70} />
                </button>
            </div>
            <div className="fixed bottom-0 mt-20 bg-white w-full" style={{ opacity: 0.66 }}>
                <But_aside />
            </div>
            {selectedProfesional !== null && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg relative">
                        <h2 className="text-2xl font-bold mb-4">
                            {selectedProfesional === null ? "Nuevo Profesional" : "Editar Profesional"}
                        </h2>
                        {errorMessage && (
                            <div className="mb-4 text-red-600">
                                {errorMessage} {/* Muestra el mensaje de error */}
                            </div>
                        )}
                        <div className="mb-4">
                            <label htmlFor="nombre" className="block">Nombre:</label>
                            <input
                                type="text"
                                id="nombre"
                                name="nombre"
                                value={profesionalDetails.nombre}
                                className="p-2 w-full border rounded"
                            />
                            <label htmlFor="apellido" className="block">Apellido:</label>
                            <input
                                type="text"
                                id="apellido"
                                name="apellido"
                                value={profesionalDetails.apellido}
                                className="p-2 w-full border rounded"
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="email" className="block">Email:</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={profesionalDetails.email}
                                className="p-2 w-full border rounded"
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="especialidad" className="block">Especialidad:</label>
                            <input
                                type="text"
                                id="especialidad"
                                name="especialidad"
                                value={profesionalDetails.especialidad}
                                className="p-2 w-full border rounded"
                            />
                        </div>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={((selectedProfesional === null ? handleCreateProfesional : handleSaveChanges))}
                                className="bg-red-700 py-2 px-5 text-white rounded hover:bg-red-800">
                                Guardar
                            </button>
                            <button
                                onClick={() => setSelectedProfesional(null)}
                                className="bg-gray-700 py-2 px-5 text-white rounded hover:bg-gray-800">
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <h1 className="absolute left-60 mb-5 text-3xl" style={{top:600}}>Alumnos</h1>
            <div className="top-60 border p-1 absolute left-40 h-90 max-h-90" style={{ background: "#D9D9D9" , top:700}}>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 my-4">
                    {alumnos.map((alumno, index) => (
                        <div key={index} className="border p-4 mx-2 relative w-47 h-47 justify-center items-center" >
                            <div className="relative w-80 h-70">
                                {<Image
                                    src={images[0]}
                                    alt="Background Image"
                                    objectFit="cover"
                                    className="w-full h-full"
                                    layout="fill"
                                />}
                                <button onClick={() => handleEliminarAlumno(alumno)} className="absolute right-0 text-red-600 font-bold">
                                    <Image src={DeleteIcon} alt="Eliminar" width={27} height={27} />
                                </button>
                                
                                <button onClick={() => setSelectedAlumno(alumno)} className="absolute top-0 right-8 text-red-600 font-bold">
                                    <Image src={EditIcon} alt="Editar" width={27} height={27} />
                                </button>
                            </div>
                            <h3 className="flex  bottom-0 text-black z-1">{alumno.nombre} {alumno.apellido}</h3>
                        </div>
                    ))}
                </div>
            </div>
            <div className="fixed bottom-0 mt-20 bg-white w-full" style={{ opacity: 0.66 }}>
                <But_aside />
            </div>

        </main>
    )
    // #endregion
}
export default Usuarios












