"use client"
import React, { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import NoImage from "../../../../../../public/Images/default-no-image.png";
import { getImages_talleresAdmin } from '@/services/repoImage';
import { getCursosDisponiblesAlumno } from '@/services/cursos';
import Loader from '@/components/Loaders/loader/loader';

interface Datos {
    setSelectedCursosId: React.Dispatch<React.SetStateAction<number[]>>;
    selectedCursosId: number[];
    edad: number;
    alumnoId: number;
}

const SeleccionTaller: React.FC<Datos> = ({ setSelectedCursosId, selectedCursosId, edad, alumnoId}) => {
    const [cursos, setCursos] = useState<any[]>([]);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [images, setImages] = useState<any[]>([]);
    const [downloadurls, setDownloadurls] = useState<any[]>([]);
    const [loaded, setLoaded] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>("");

    useEffect(() => {
        fetchCursos();
        fetchImages();
    }, []);

    const fetchImages = async () => {
        const result = await getImages_talleresAdmin();
        if (result.error) {
            setErrorMessage(result.error)
        } else {
            setImages(result.images);
            setDownloadurls(result.downloadurls);
            if(cursos.length > 0){
                setLoaded(true);
            }
        }
        setLoaded(true);
    };

    async function fetchCursos() {
        try {
            let curs = await getCursosDisponiblesAlumno(edad, alumnoId)
            setCursos(curs);
            if(curs.length === 0){
                setErrorMessage("No hay cursos más talleres disponibles. Esto puede deberse a que ya se encuentran inscriptos en todos los talleres disponibles o no hay talleres disponibles para su edad.")
                setLoaded(true);
            }
        } catch (error) {
            console.error("Imposible obtener cursos", error);
        }
    }

    const handleRowClick = (id: number) => {
        setSelectedCursosId(prevSelectedCursoId => {
            if (prevSelectedCursoId.includes(id)) {
                return prevSelectedCursoId.filter(prevId => prevId !== id);
            } else {
                return [...prevSelectedCursoId, id];
            }
        });
    };
    const filteredCursos = cursos.filter(curso =>
        curso.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (!loaded) {
        return (
            <div className="min-h-[500px] w-full flex items-center justify-center">
                <Loader/>
            </div>
        );
    }

    if (cursos.length === 0) {
        return (
            <div className="min-h-[500px] w-full flex flex-col items-center justify-center p-8">
                <div className="max-w-2xl text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">No hay talleres disponibles</h2>
                    <p className="text-gray-600">{errorMessage}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-2">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    Elija los talleres de interés
                </h1>
                <p className="text-gray-600 mb-6">
                    Seleccione los talleres en los que desea participar
                </p>
                <div className="relative max-w-md mx-auto">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                        type="text"
                        placeholder="Buscar taller..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-full"
                    />
                </div>
            </div>

            <Card className="w-full border border-gray-200 rounded-lg overflow-y-auto md:max-h-[400px] max-h-[300px]">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50 hover:bg-gray-50">
                            <TableHead className="w-[250px] font-semibold">Imagen</TableHead>
                            <TableHead className="font-semibold">Nombre del Taller</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredCursos.map((curso, index) => (
                            <TableRow 
                                key={curso.id} 
                                className={cn(
                                    "cursor-pointer transition-colors",
                                    selectedCursosId?.includes(curso.id) 
                                        ? "bg-blue-100 hover:bg-blue-100" 
                                        : "hover:bg-gray-100/50"
                                )}
                                onClick={() => handleRowClick(curso.id)}
                            >
                                <TableCell className="py-4">
                                    <div className="relative w-[100px] md:w-[200px] lg:w-[200px] h-[80px] md:h-[120px] lg:h-[120px] rounded-lg overflow-hidden">
                                        <img
                                            src={downloadurls[index] || NoImage}
                                            alt={curso.nombre}
                                            className="absolute inset-0 w-full h-full object-cover"
                                        />
                                    </div>
                                </TableCell>
                                <TableCell className="align-middle">
                                    <h3 className="text-lg font-medium text-gray-900">{curso.nombre}</h3>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}

export default SeleccionTaller;