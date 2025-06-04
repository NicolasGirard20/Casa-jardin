"use client";
// #region Imports
import React, { useEffect, useState } from "react";
import Navigate from "../../../components/Admin/navigate/page";
import { deleteAlumno, getAlumnos } from "../../../services/Alumno";
import Background from "../../../../public/Images/Background.jpeg"
import withAuth from "../../../components/Admin/adminAuth";
//ver que hago con esto....
import { deleteResponsableByAlumnoId } from "@/services/responsable";
import Loader from "@/components/Loaders/loadingTalleres/page";
import { Mail, Pencil, Phone, Plus, Search, Trash2, Users, BookOpen } from "lucide-react";
//formulario para agregar o actualizar alumnos
import AlumnoAdminForm from "@/components/formularios/alumnoAdminForm";
//para inscribir el alumno en cursos
import { calcularEdad } from "@/helpers/fechas";
import CursoSelector from "@/components/Admin/cursoSelector";

// #endregion

// Function to check if a person is an adult based on their birth date
const isAdult = (birthDate: string): boolean => {
    const age = new Date().getFullYear() - new Date(birthDate).getFullYear();
    return age >= 18;
};

//usuario y alumno es lo mismo
type Usuario = {
    id: number;
    direccion?: Direccion;
    nombre: string;
    apellido: string;
    dni: number | null;
    telefono: string | null;
    email: string;
    direccionId: number;
    fechaNacimiento: string;
    password: string;
    rolId: number;
};

type Direccion = {
    pais: "Argentina";
    provincia: string;
    localidad: string;
    calle: string;
    numero: number;
}

const Alumnos: React.FC = () => {
    // #region UseStates
    const [alumnos, setAlumnos] = useState<any[]>([]);
    const [alumnosMostrados, setAlumnosMostrados] = useState<any[]>([]);
    const [alumnoAbuscar, setAlumnoAbuscar] = useState<string>("");

    // Estado para almacenar mensajes de error
    const [errorMessage, setErrorMessage] = useState<string>("");

    //para editar un alumno
    const [alumnoSelected, setAlumnoSelected] = useState<Usuario | null>(null);
    const [editar, setEditar] = useState<boolean>(false);
    const [cambios, setCambios] = useState<boolean>(false);
    const [mayor, setMayor] = useState<boolean>(false);
    const [AlumnoAEliminar, setAlumnoAEliminar] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    //para saber si es un formulario desde 0
    const [nueva, setNueva] = useState<boolean>(false);

    //Estado para pantalla de carga del principio
    const [loading, setLoading] = useState<boolean>(true);

    //para editar los cursos del alumno
    const [editarCursos, setEditarCursos] = useState<boolean>(false);

    // #endregion

    // #region UseEffects
    //useEffect para obtener los alumnos
    useEffect(() => {
        fetchAlumnos();
    }, []);

    useEffect(() => {
        if (errorMessage !== "") {
            setInterval(() => {
                setErrorMessage("")
            }, 5000);
        }
    }, [errorMessage])

    useEffect(() => {
        if (cambios) {
            fetchAlumnos();
            setCambios(false);
        }
    }
        , [cambios]);

    // #endregion

    // #region Métodos
    async function fetchAlumnos() {
        try {

            const data = await getAlumnos();
            console.log(data);
            setAlumnos(data);
            setAlumnosMostrados(data);

        } catch (error) {
            console.error("Imposible obetener Alumnos", error);
        } finally {
            setLoading(false);
        }
    }

    // Método para obtener las imagenes

    //region solo considera repetidos

    async function handleEliminarAlumno(id: any) {
        setIsDeleting(true);
        console.log(id);
        //elimino el responsable si el alumno es menor
        if (mayor === false) {

            const responsable = await deleteResponsableByAlumnoId(id);
            console.log("responsable borrado", responsable);
        }
        const alumnoBorrado = await deleteAlumno(id);
        console.log("alumno borrado", alumnoBorrado);
        fetchAlumnos();
        setAlumnoAEliminar(null);
        setIsDeleting(false);
    }

    // #endregion
    //para la busqueda de alumnos en la tabla principal
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const searchTerm = e.target.value.toLowerCase();
        let filteredAlumnos = alumnosMostrados.filter(alumno =>
            alumno.nombre.toLowerCase().includes(searchTerm) ||
            alumno.apellido.toLowerCase().includes(searchTerm)
        );

        setAlumnoAbuscar(e.target.value);
        setAlumnos(filteredAlumnos);
    };



    // #region Return
    return (
        <main
            className="relative bg-cover bg-center"

        >
            <Navigate />

            {AlumnoAEliminar && (
                <div className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg relative">
                        {errorMessage && <div style={{ color: "red" }}>{errorMessage}</div>}

                        <h2 className="text-lg mb-4">Confirmar Eliminación</h2>
                        <p>
                            ¿Estás seguro de que deseas eliminar a:{" "}
                            <strong>{AlumnoAEliminar.nombre}</strong>?
                        </p>
                        <div className="flex justify-end space-x-4 mt-4">
                            <button
                                onClick={() => {
                                    handleEliminarAlumno(AlumnoAEliminar.id);
                                }}
                                disabled={isDeleting}
                                className="bg-red-700 py-2 px-5 text-white rounded hover:bg-red-800"
                            >
                                {isDeleting ? "Eliminando..." : "Confirmar Eliminación"}
                            </button>
                            <button
                                onClick={() => setAlumnoAEliminar(null)}
                                disabled={isDeleting}
                                className="bg-gray-700 py-2 px-5 text-white rounded hover:bg-gray-800"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Contenido Principal */}
            <div className="relative z-10">
                <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    {/* Título y Descripción */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Alumnos</h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Gestiona los alumnos del sistema
                            </p>
                        </div>
                        {/* Botones */}
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <button
                                onClick={() => { setEditar(true); setAlumnoSelected(null); setMayor(false); setNueva(true) }}
                                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm w-full sm:w-auto"
                            >
                                <Plus className="w-5 h-5" />
                                <span>Nuevo alumno menor</span>
                            </button>
                            <button
                                onClick={() => { setEditar(true); setAlumnoSelected(null); setMayor(true); setNueva(true) }}
                                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm w-full sm:w-auto"
                            >
                                <Plus className="w-5 h-5" />
                                <span>Nuevo alumno mayor</span>
                            </button>
                        </div>
                    </div>

                    {/* Barra de Búsqueda */}
                    <div className="mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre.."
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                value={alumnoAbuscar}
                                onChange={handleSearchChange}
                            />
                        </div>
                    </div>

                    {/* Tabla de Alumnos */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="grid grid-cols-1 sm:grid-cols-12 bg-gray-50 py-4 px-6 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="hidden sm:block col-span-2">CÓDIGO</div>
                            <div className="col-span-4">NOMBRE</div>
                            <div className="col-span-3">CONTACTO</div>
                            <div className="hidden sm:block col-span-2">MAYORÍA DE EDAD</div>
                            <div className="col-span-1 text-center">ACCIÓN</div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center py-12">
                                <Loader />
                            </div>
                        ) : (
                            alumnos.length === 0 ? (
                                <div className="py-12 px-6 text-center">
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                                        <Users className="w-6 h-6 text-gray-400" />
                                    </div>
                                    <h3 className="text-sm font-medium text-gray-900 mb-1">No hay alumnos registrados</h3>
                                    <p className="text-sm text-gray-500">
                                        Comienza agregando un alumno
                                    </p>
                                </div>
                            ) : (
                                alumnos.sort((a, b) => a.id - b.id).map((alumno) => (
                                    <div
                                        key={alumno.id}
                                        className="grid grid-cols-1 sm:grid-cols-12 items-center py-4 px-6 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="col-span-1 sm:col-span-2">
                                            <span className="text-sm font-medium text-gray-900">{alumno.id}</span>
                                        </div>
                                        <div className="col-span-1 sm:col-span-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                            <div>
                                                <h3 className="font-medium text-gray-900">{alumno.nombre} {alumno.apellido}</h3>
                                                <p className="text-sm text-gray-500">DNI: {alumno.dni}</p>
                                            </div>
                                        </div>
                                        <div className="col-span-1 sm:col-span-3">
                                            <div className="flex flex-col gap-1">
                                                <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                                                    <Mail className="w-4 h-4 text-gray-400" />
                                                    {alumno.email}
                                                </span>
                                                {alumno.telefono && (
                                                    <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                                                        <Phone className="w-4 h-4 text-gray-400" />
                                                        +54 {alumno.telefono}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="hidden sm:block col-span-2">
                                            {new Date().getFullYear() - new Date(alumno.fechaNacimiento).getFullYear() >= 18 ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-sm font-medium bg-blue-50 text-blue-700 rounded-full">
                                                    <Users className="w-4 h-4" />
                                                    Mayor
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-sm font-medium bg-amber-50 text-amber-700 rounded-full">
                                                    <Users className="w-4 h-4" />
                                                    Menor
                                                </span>
                                            )}
                                        </div>
                                        <div className="col-span-1 flex justify-center gap-2">
                                            <button
                                                title="Editar alumno"
                                                onClick={() => {
                                                    // Calcular si el alumno es mayor de edad
                                                    const isAdultValue = isAdult(alumno.fechaNacimiento);

                                                    // Establecer el alumno seleccionado para edición
                                                    setAlumnoSelected(alumno);
                                                    setMayor(isAdultValue);
                                                    setEditar(true);
                                                    setNueva(false);
                                                }}
                                                className="text-indigo-600 hover:text-indigo-900 p-1 hover:bg-indigo-50 rounded"
                                            >
                                                <Pencil className="w-5 h-5" />
                                            </button>
                                            <button
                                                title="Editar cursos"
                                                onClick={() => { setAlumnoSelected(alumno); setEditarCursos(true); }}
                                                className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded"
                                            >
                                                <BookOpen className="w-5 h-5" />
                                            </button>
                                            <button
                                                title="Eliminar"
                                                onClick={() => setAlumnoAEliminar(alumno)}
                                                className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>

                                        </div>
                                    </div>
                                ))
                            )
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de Edición */}
            {editar && (
                <div className="z-50">
                    <AlumnoAdminForm alumno={alumnoSelected} setEditar={setEditar} setChanged={setCambios} mayor={mayor} nueva={nueva} />
                </div>
            )}

            {/*editar cursos del alumno*/}
            {editarCursos && alumnoSelected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <CursoSelector
                        persona={{
                            id: alumnoSelected.id,
                            nombre: `${alumnoSelected.nombre} ${alumnoSelected.apellido}`,
                            email: alumnoSelected.email,
                            cursos: []
                        }}
                        esAlumno={true}
                        edad={calcularEdad(alumnoSelected.fechaNacimiento)}
                        setEditar={setEditarCursos}
                    />
                </div>
            )}

        </main>
    );
}
// #endregion
//export default Alumnos;
export default withAuth(Alumnos);
