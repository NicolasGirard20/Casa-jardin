"use client";

import React, { useEffect, useState } from "react";
import Navigate from "../../../components/Admin/navigate/page";

import { createAula, getAulas, getAulaByNombre, deleteAulas } from "../../../services/aulas";
import Image from "next/image";
import withAuth from "../../../components/Admin/adminAuth";
import Background from "../../../../public/Images/Background.jpeg";
import { Horario } from "../cronograma/horario";

import DeleteIcon from "../../../../public/Images/DeleteIcon.png";
import ButtonAdd from "../../../../public/Images/Button.png";


// Define the Aula interface para definir la estructura de los datos de aula
interface Aula {
    id: number;
    nombre: string;
}

const Aulas: React.FC = () => {
    const [aulas, setAulas] = useState<Aula[]>([]);
    const [selectedAulaId, setSelectedAulaId] = useState<number | null>(null); // Añadir estado para el ID del aula seleccionada
    const [selectedAulaIdCrear, setSelectedAulaIdCrear] = useState<number | null>(null); // Añadir estado para el ID del aula seleccionada
    const [selectedAulaIdEliminar, setSelectedAulaIdEliminar] = useState<number | null>(null); // Añadir estado para el ID del aula seleccionada
    const [aulaDetails, setAulaDetails] = useState<{ nombre: string }>({ nombre: "" });
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [selectedAulaNombre, setSelectedAulaNombre] = useState(""); // Estado para el nombre del aula
    // Define the fetchAulas function to get the list of aulas
    const fetchAulas = async () => {
        try {
            const response: Aula[] = await getAulas();
            setAulas(response);
        } catch (error) {
            console.error("Error al obtener las aulas:", error);
        }
    };

    // función para obtener las aulas
    useEffect(() => {
        fetchAulas();
    }, []);

    // Función para manejar la selección del aula
    const handleSelectAula = (id: number) => {
        // que me lleve  a LA pagina de horario en admin/cronograma
        setSelectedAulaId(id);
    }
    //Define the handleCreateAula function to create a nueva aula  
    const handleCreateAula = async () => {
        // Comprueba si el nombre del aula es obligatorio
        // Comprueba si el nombre del aula ya existe
        
        if (!aulaDetails.nombre) {
            showError("El nombre del aula es obligatorio");
            return;
        }
        if ( await getAulaByNombre(aulaDetails.nombre)) { // Comprueba si el nombre del aula ya existe
            showError("El nombre del aula ya existe");
            return;
        }
        if (aulaDetails.nombre.trim().length < 3) {// no puede ser menor a 3 caracteres y espacios en blanco
            showError("El nombre del aula debe tener al menos 2 caracteres");
            return;
        }
        if (aulaDetails.nombre.trim().length > 50) {// no puede ser mayor a 50 caracteres
            showError("El nombre del aula debe tener menos de 50 caracteres");
            return;
        }
        // no puede ser solo caracteres especiales
        const regex = /^[a-zA-Z0-9_ ,.;áéíóúÁÉÍÓÚñÑüÜ]*$/;
        if (!regex.test(aulaDetails.nombre)) {
            showError("El nombre del aula no puede contener caracteres especiales");
            return;
        }



        try {// Crea el aula con los detalles proporcionados y actualiza la lista de aulas
            await createAula(aulaDetails);
            fetchAulas();
            setAulaDetails({ nombre: "" });
            setSelectedAulaIdCrear(null);
        } catch (error) {
            showError("Error al crear el aula");
            setSelectedAulaIdCrear(null);
            setSelectedAulaNombre("");
        }
      
    };
    // Define para eliminar el aula por su id
    const handleEliminarAula = async (id: number) => {
        try {
            await deleteAulas(id); // Corrige el código de eliminación
            setSelectedAulaIdEliminar(null); // Resetea el estado del ID del a
            fetchAulas(); // Vuelve a cargar las aulas después de la eliminación
        } catch (error) {
            showError("No se puede eliminar el aula, porque tiene horarios asignados");
        }
    };
    // Función para mostrar el mensaje de error
    const showError = (message: string) => {
        setErrorMessage(message);

        // Elimina el mensaje de error después de 3 segundos
        setTimeout(() => {
            setErrorMessage(null);  // Resetea el estado a null
        }, 3000);  // 3 segundos
    };
    return (
        <main className="relative min-h-screen w-screen">
            <Navigate />
            <div className="fixed inset-0 z-[-1]">
                <Image src={Background} alt="Background" layout="fill" objectFit="cover" quality={80} priority={true} />
            </div>

            {/* Muestra el título de la página */}

            <h1 className="absolute top-35 left-60 mb-5 text-3xl">Aulas</h1>
            {/* Muestra la lista de aulas */}
            <div className="top-40 border p-1 absolute left-40 h-90 max-h-90" style={{ background: "#D9D9D9" }}>
             
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 my-4">
                    {aulas.map((aula) => (
                        <button
                            key={aula.id}
                            onClick={() => handleSelectAula(aula.id)} // Añadir onClick para seleccionar el aula
                            className="border p-4 mx-2 relative w-47 h-47 justify-center items-center"
                        >
                            <div className="relative w-30 h-20">
                                <Image
                                    src={Background}
                                    alt="Background Image"
                                    objectFit="cover"
                                    className="w-full h-full"
                                    layout="fill"
                                />
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation(); // Previene la propagación del evento para que no seleccione el aula
                                        setSelectedAulaIdEliminar(aula.id); // Llama a la función para eliminar el aula
                                        setSelectedAulaNombre(aula.nombre); // Guarda el nombre del aula para mostrarlo en el mensaje
                                    }}
                                    className="absolute top-0 right-0 text-red-600 font-bold"
                                >
                                    <Image src={DeleteIcon} alt="Eliminar" width={27} height={27} />
                                </button>
                            </div>
                            <h3 className="flex bottom-0 text-black z-1">
                                {aula.nombre}
                            </h3>
                        </button>

                    ))}

                </div>
                <button onClick={() => setSelectedAulaIdCrear(-1)} className="mt-6 mx-4">
                    <Image src={ButtonAdd} className="mx-3" alt="Añadir Aula" width={70} height={70} />
                </button>

            </div>


            {/* Componente Horario con el ID del aula seleccionada */}
            {selectedAulaId && (
                <div className="fixed top-0 left-0 right-0 bottom-0 bg-white border p-4 shadow-lg overflow-auto">
                    <Horario idAula={selectedAulaId} />
                </div>
            )}
            {/* Muestra el formulario para crear aula */}
            {selectedAulaIdCrear !== null && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg relative">
                        <h2 className="text-2xl font-bold mb-4">
                            {selectedAulaIdCrear === -1 ? "Crear Aula" : "Editar Aula"}
                        </h2>
                        {/* Mostrar el mensaje de error solo si existe */}
                        {errorMessage && (
                            <div className="mb-4 text-red-600">
                                {errorMessage}
                            </div>
                        )}
                        <div className="mb-4">
                            <label htmlFor="nombre" className="block">Nombre de aula:</label>
                            <input
                                type="string"
                                id="nombre"

                                value={aulaDetails.nombre}
                                onChange={(e) =>
                                    setAulaDetails({ ...aulaDetails, nombre: e.target.value })  // Corrige el nombre del campo
                                }
                                className="p-2 w-full border rounded"
                            />
                        </div>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={handleCreateAula
                                    
                                }
                                className="bg-red-700 py-2 px-5 text-white rounded hover:bg-red-800"
                            >
                                Guardar
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedAulaIdCrear(null);
                                    setErrorMessage(null); // Resetea el mensaje de error
                                    setAulaDetails({ nombre: "" }); // Resetea el nombre del aula
                                    setSelectedAulaIdEliminar(null);

                                }}
                                className="bg-gray-700 py-2 px-5 text-white rounded hover:bg-gray-800"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
            { /* formulario para poder terminar de eliminar el aula */}
            {selectedAulaIdEliminar && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg relative">
                        <h2 className="text-2xl font-bold mb-4">
                            ¿Estás seguro de que deseas eliminar el {selectedAulaNombre}?
                        </h2>
                        {/* Mostrar el mensaje de error solo si existe */}
                        {errorMessage && (
                            <div className="mb-4 text-red-600">
                                {errorMessage}
                            </div>
                        )}
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => handleEliminarAula(selectedAulaIdEliminar)}
                                
                                className="bg-red-700 py-2 px-5 text-white rounded hover:bg-red-800"
                            >
                                Eliminar
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedAulaIdEliminar(null);
                                    setErrorMessage(null);
                                  

                                }}
                                className="bg-gray-700 py-2 px-5 text-white rounded hover:bg-gray-800"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </main>
    );

};

export default withAuth(Aulas);
