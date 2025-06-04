'use client'

import React, { useEffect, useState } from "react";
import Navigate from "../../../../components/profesional/navigate/page";

import { createAula, getAulas, getAulaByNombre, deleteAulas } from "../../../../services/aulas";
import Image from "next/image";
import { getProfesionalByCookie } from "../../../../services/profesional";
import Background from "../../../../../public/Images/Background.jpeg";

import Loader from '@/components/Loaders/loader/loader';
import HorarioProfesional from "../modificar/HorarioProfesional";
import { Search } from "lucide-react";


// Define the Aula interface para definir la estructura de los datos de aula
interface Aula {
    id: number;
    nombre: string;
}

const AulasProfecional: React.FC = () => {
    const [aulas, setAulas] = useState<Aula[]>([]);
    const [selectedAulaId, setSelectedAulaId] = useState<number | null>(null);
    const [selectedProfesionalId, setSelectedProfesionalId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchAulas = async () => {
        try {
            const response: Aula[] = await getAulas();
            setAulas(response);
        } catch (error) {
            console.error("Error al obtener las aulas:", error);
        }
        try {
            const response = await getProfesionalByCookie();
            if (response) {
                setSelectedProfesionalId(response.id);
            }
        } catch (error) {
            console.error("Error al obtener el profesional:", error);
        }
    };

    useEffect(() => {
        fetchAulas();
    }, []);

    const handleSelectAula = (id: number) => {
        setSelectedAulaId(id);
    };

    const filteredAulas = aulas
        .filter((aula) => aula.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => a.nombre.localeCompare(b.nombre));

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <Navigate />
      
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <h1 className="text-3xl font-bold text-gray-900">Selecciona un salón</h1>
                </div>
            </header>

            {/* Search Bar */}
            <div className="max-w-7xl mx-auto px-4 mt-6">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar salón..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Loader */}
            {aulas.length === 0 ? (
                <div className=" justify-center items-center mt-8">
                    <div  className=" w-full flex flex-col items-center justify-center ">
                    <Loader />
                    <p className="text-gray-700">Cargando aulas...</p>
                    </div>
                    
                </div>
            ) : (
                <div className={`max-w-7xl mx-auto px-4 mt-8  ${selectedAulaId ? 'hidden' : 'grid'} grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12`}>
                    {filteredAulas.map((aula) => (
                        <div
                            key={aula.id}
                            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                            onClick={() => handleSelectAula(aula.id)}
                        >
                            <div className="relative w-full h-48">
                                <Image
                                    src={Background}
                                    alt="Background Image"
                                    layout="fill"
                                    objectFit="cover"
                                    className="w-full h-full"
                                />
                            </div>
                            <div className="p-4">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{aula.nombre}</h3>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {selectedAulaId && selectedProfesionalId !== null && (
                <div className="fixed inset-0 bg-white overflow-y-auto shadow-lg h-screen z-10">
                    <HorarioProfesional idAula={selectedAulaId} idProfesional={selectedProfesionalId} />
                </div>
            )}
        </div>

    );
};

export default AulasProfecional;

