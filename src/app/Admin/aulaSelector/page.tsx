"use client";

import React, { useEffect, useState } from "react";
import Navigate from "../../../components/Admin/navigate/page";
import EditIcon from "../../../../public/Images/EditIcon.png";
import { createAula, getAulas, getAulaByNombre, deleteAulas, updateAula } from "../../../services/aulas";
import Image from "next/image";
import withAuth from "../../../components/Admin/adminAuth";
import Background from "../../../../public/Images/Background.jpeg";
import { Horario } from "../cronograma/horario";
import Loadere from "@/components/Loaders/loadingTalleres/page";
import { Building2, Clock, Pencil, Plus, Search, Trash2,NotebookPen,  Loader2, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";


// Define the Aula interface para definir la estructura de los datos de aula
interface Aula {
    visible: boolean;
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
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [selectedAulaNombre, setSelectedAulaNombre] = useState(""); // Estado para el nombre del aula
    // modificar aula
    const [selectedAulaIdModificar, setSelectedAulaIdModificar] = useState<number | null>(null); // Añadir estado para el ID del aula seleccionada
    const [searchTerm, setSearchTerm] = useState(""); // Para el texto del buscador
    const [filteredAulas, setFilteredAulas] = useState(aulas); // Para las aulas visibles
    const [loading, setLoading] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // Define the fetchAulas function to get the list of aulas
    const fetchAulas = async () => {
        try {
            const response = (await getAulas()).map(aula => ({ ...aula, visible: true })) as Aula[];
            setAulas(response);
            setLoading(false);
        } catch (error) {
            console.error("Error al obtener las aulas:", error);
            setLoading(false);
        }
    };
    const handleSearch = (e: { target: { value: string; }; }) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        const filtered = aulas.filter((aula) =>
            aula.nombre.toLowerCase().includes(term)
        );
        setFilteredAulas(filtered);
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
    const validateAulaNombre = async (nombre: string): Promise<string | null> => {
        if (!nombre.trim()) {
            return "El nombre del aula es obligatorio";
        }
        if (nombre.trim().length < 3) {
            return "El nombre del aula debe tener al menos 3 caracteres";
        }
        if (nombre.trim().length > 50) {
            return "El nombre del aula debe tener menos de 50 caracteres";
        }
        const regex = /^[a-zA-Z0-9_ " ,.;áéíóúÁÉÍÓÚñÑüÜ]*$/;
        if (!regex.test(nombre)) {
            return "El nombre del aula no puede contener caracteres especiales";
        }
        const aulaExistente = await getAulaByNombre(nombre);
        if (aulaExistente) {
            return "El nombre del aula ya existe";
        }
        return null; // No hay errores
    };

    const handleCreateAula = async () => {
        const error = await validateAulaNombre(aulaDetails.nombre);
        if (error) {
            showError(error);
            return;
        }

        try {
            await createAula(aulaDetails);
            fetchAulas();
            setAulaDetails({ nombre: "" });
            setSelectedAulaIdCrear(null);
        } catch (error) {
            showError("Error al crear el aula");
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

    // poder modificar el aula nombre del aula por su id
    const handleModificarAula = async (id: number) => {
        const error = await validateAulaNombre(aulaDetails.nombre);
        if (error) {
            showError(error);
            return;
        }

        try {
            await updateAula(id, aulaDetails);
            fetchAulas();
            setSelectedAulaIdModificar(null);
            setAulaDetails({ nombre: "" });
        } catch (error) {
            showError("Error al modificar el aula");
        }
    };
    

    useEffect(() => {
        // Actualiza los salones visibles cada vez que cambia el término de búsqueda
        const results = aulas.filter((aula) =>
            aula.nombre.toLowerCase().includes(searchTerm)
        );
        setFilteredAulas(results);
    }, [searchTerm, aulas]);
 

    return (
        <main
            className="relative bg-cover bg-center"
            style={{
                backgroundImage: `url(${Background})`,
            }}
        >
            <Navigate />


               

            <div className="relative z-10">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">SALONES</h1>
                    <p className="mt-1 text-sm text-gray-500">
                     Gestiona los salones del sistema
                    </p>
                </div>
                <button
                    onClick={() => setSelectedAulaIdCrear(-1)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    <span>Nuevo Salón</span>
                </button>
            </div>
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="grid grid-cols-12 bg-gray-50 py-4 px-6 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="col-span-8">NOMBRE</div>
                    <div className="col-span-4 text-center">ACCIÓN</div>
                </div>

                {loading ? (
              <div className="flex justify-center items-center py-12">
              <Loadere />
              </div>
            ):aulas.length === 0 ? (
                    <div className="py-12 px-6 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                            <Building2 className="w-6 h-6 text-gray-400" />
                        </div>
                        <h3 className="text-sm font-medium text-gray-900 mb-1">No hay salones registrados</h3>
                        <p className="text-sm text-gray-500">
                            Comienza agregando un salón
                        </p>
                    </div>
                ) : (
                    filteredAulas
                        .slice() // Crea una copia del arreglo para evitar modificar el original
                        .sort((a, b) => a.nombre.localeCompare(b.nombre)) // Ordena alfabéticamente por el atributo nombre
                        .map((salon) => (
                            <div
                                key={salon.id}
                                className="grid grid-cols-12 items-center py-4 px-6 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                            >
                                <div className="col-span-8">
                                    <div className="flex items-center gap-3">
                                        <div className="flex-shrink-0">
                                            <Building2 className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                                                {salon.nombre}
                                            </h3>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-4 flex justify-center gap-2 flex-wrap">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedAulaIdModificar(salon.id);
                                            setAulaDetails({ nombre: salon.nombre }); // Inicializa el campo de entrada con el nombre del aula
                                        }}
                                        className="text-indigo-600 hover:text-indigo-900 p-1 hover:bg-indigo-50 rounded"
                                        title="Editar salón"
                                    >
                                        <Pencil className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedAulaIdEliminar(salon.id);
                                        }}
                                        className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                                        title="Eliminar salón"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                    <button
                                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                                        title="Ver horarios"
                                        onClick={() => setSelectedAulaId(salon.id)}
                                    >
                                        <Clock className="w-5 h-5" />
                                        Ver Horario
                                    </button>
                                </div>
                                    
                                    
                                </div>
                       
                        ))
                )}
            </div>
        </div>
    
                    
                                
                
                {/* Componente Horario */}
                {selectedAulaId && (
                    <div className="fixed top-0 left-0 right-0 bottom-0 bg-white shadow-lg overflow-auto">
                        <Horario idAula={selectedAulaId} />
                    </div>
                )}

                {/* Modal para Crear/Editar */}
                {(selectedAulaIdCrear !== null || selectedAulaIdModificar !== null) && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-md relative max-h-screen overflow-y-auto">
                            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                <NotebookPen className="w-5 h-5" />
                                {selectedAulaIdCrear === -1 ? "Agregar Salón" : "Modificar Salón"}
                            </h2>
                            {errorMessage && (
                                <div className="mb-3 text-red-600 text-sm">{errorMessage}</div>
                            )}
                            <div className="mb-3">
                                <label htmlFor="nombre" className="block text-sm">
                                    {selectedAulaIdCrear === -1
                                        ? "Nombre de Salón:"
                                        : `Nuevo nombre de ${aulaDetails.nombre}:`}
                                </label>
                                <input
                                    type="text"
                                    id="nombre"
                                    value={aulaDetails.nombre}
                                    onChange={(e) =>
                                        setAulaDetails({ ...aulaDetails, nombre: e.target.value })
                                    }
                                    className="p-1 w-full border rounded text-sm"
                                />
                            </div>
                            <div className="flex justify-between px-6 pb-6">
                                <Button
                                    type="button"
                                    onClick={() => {
                                        setSelectedAulaIdCrear(null);
                                        setSelectedAulaIdModificar(null);
                                        setErrorMessage(null);
                                        setAulaDetails({ nombre: "" });
                                    }}
                                    variant="destructive"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-sky-600 hover:bg-sky-800 text-white"
                                    onClick={
                                        selectedAulaIdCrear === -1
                                            ? handleCreateAula
                                            : () => selectedAulaIdModificar !== null && handleModificarAula(selectedAulaIdModificar)
                                    }
                                >
                                    {isSubmitting ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Guardar
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Modal para Eliminar */}
                {selectedAulaIdEliminar && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-md relative">
                            <h2 className="text-lg font-semibold mb-3">Eliminar Salón</h2> 
                            {errorMessage && (
                                <div className="mb-3 text-red-600 text-sm">{errorMessage}</div>
                            )}
                            <div className="mb-3">
                                <p>¿Estás seguro de eliminar el salón?</p>
                            </div>
                           
                            <div className="flex justify-end space-x-2">

                            <button
                                    onClick={() => {
                                        setSelectedAulaIdEliminar(null);
                                        setErrorMessage(null);
                                    }}
                                    className="bg-gray-600 py-1 px-3 text-white rounded text-sm hover:bg-gray-700"
                                >   
                                    Cancelar    
                                </button>
                                <button
                                    onClick={() => {
                                        if (selectedAulaIdEliminar) {
                                            setIsDeleting(true);
                                            handleEliminarAula(selectedAulaIdEliminar).finally(() => setIsDeleting(false));
                                        }
                                    }}
                                    disabled={isDeleting}
                                    className="bg-red-700 py-2 px-5 text-white rounded hover:bg-red-800"
                                >
                                    {isDeleting ? "Eliminando..." : "Confirmar Eliminación"}
                                </button>
                               

                            </div>
                    </div>
                 </div>
                )}
            </div>
        </main>






    );

};

export default withAuth(Aulas);
