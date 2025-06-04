"use client";

import React, { useEffect, useState } from "react";
import Navigate from "../../../components/Admin/navigate/page";
import { getCursosCout, deleteCurso, Curso } from "../../../services/cursos";
import { createAlumno_Curso, getAlumnosByIdCurso } from "../../../services/alumno_curso";
import Background from "../../../../public/Images/Background.jpeg";
import NoImage from "../../../../public/Images/default-no-image.png";
import { getImages_talleresAdmin } from "@/services/repoImage";
import withAuth from "../../../components/Admin/adminAuth";
import { autorizarAdmin } from "@/helpers/cookies";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loaders/loadingTalleres/page";
import { mapearImagenes } from "@/helpers/repoImages";
import { Calendar, FileText, GraduationCap, Pencil, Plus, Search, Trash2, UserRound, Users, UsersRound, X } from "lucide-react";
import CursoForm from "./../../../components/formularios/CursoForm";
import { Alumno, getAlumnos } from "@/services/Alumno";
import UserSelector from "@/components/Admin/userSelector";
import { getProfesionalesByCursoId } from "@/services/profesional_curso";
import Talleres from "@/components/talleres/page";

const Cursos: React.FC = () => {
  // Estado para almacenar la lista de cursos
  const [cursos, setCursos] = useState<
    {
      visible: boolean;
      selected: boolean;
      id: number;
      nombre: string;
      descripcion: string;
      fechaInicio: Date;
      fechaFin: Date;
      edadMinima: number;
      edadMaxima: number;
      imagen: string | null;
      imageUrl?: string;
      cantidadAlumnos: number;
      cantidadProfesionales: number;
    }[]
  >([]);

  // Estado para almacenar el ID del curso seleccionado
  const [selectedCursoId, setSelectedCursoId] = useState<number | null>(null);

  // Estado para almacenar el  cursos seleccionados
  const [cursoselected, setCursoSelected] = useState<Curso | null>(null);


  // Estado para almacenar mensajes de error
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Estado para almacenar las imagenes
  const [images, setImages] = useState<any[]>([]);
  const [downloadurls, setDownloadurls] = useState<any[]>([]);

  // Estado para almacenar el término de búsqueda
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Estado para confirmación de eliminación
  const [cursoAEliminar, setCursoAEliminar] = useState<{
    id: number;
    nombre: string;
  } | null>(null);

  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Boolean para saber si las imagenes ya se cargaron
  const [imagesLoaded, setImagesLoaded] = useState<boolean>(false);

  // Boolean para saber si estan cargando los cursos
  const [loading, setLoading] = useState<boolean>(true);

  // Boolean para saber si estan cargando los cursos
  const [loading2, setLoading2] = useState<boolean>(true);

  // Estado para almacenar la lista de alumnos
  const [alumnos, setAlumnos] = useState<any[]>([]);

  // Estado para almacenar la lista de alumnos
  const [profesionales, setProfesionales] = useState<any[]>([]);

  // Estado para almacenar los cursos filtrados
  const [filteredCursos, setFilteredCursos] = useState(cursos);

  //Estado para abrir el modal de agregar alumnos
  const [openModalAlumnos, setOpenModalAlumnos] = useState(false);

  //Estado para abrir el modal de agregar profesionales
  const [openModalProfesionales, setOpenModalProfesionales] = useState(false);

  // Estado para almacenar la cantidad de alumnos y profesionales por taller (matriz)
  const [participantesPorTaller, setParticipantesPorTaller] = useState<
    { cursoId: number; alumnos: number; profesionales: number }[]
  >([]);

  // Método para obtener la cantidad de alumnos o profesionales por id de taller
  const getCantidadPorTaller = (
    cursoId: number,
    tipo: "alumnos" | "profesionales"
  ): number => {
    const entry = participantesPorTaller.find((p) => p.cursoId === cursoId);
    return entry ? entry[tipo] : 0;
  };
  const router = useRouter();

  // Autorización de admin
  useEffect(() => {
    const authorize = async () => {
      await autorizarAdmin(router);
    };
    authorize();
  }, [router]);

  // Cargar cursos al iniciar
  useEffect(() => {
    if (cursos.length === 0) fetchCursos();
  }, [cursos]);

  // Cargar imágenes después de cargar cursos
  useEffect(() => {
    if (cursos.length > 0 && !imagesLoaded) {
      fetchImages();
    }
  }, [cursos, imagesLoaded]);

  // Limpiar mensaje de error después de un tiempo
  useEffect(() => {
    if (errorMessage != null) {
      const timer = setTimeout(() => {
        setErrorMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);


  // Filtrar cursos cuando cambia el término de búsqueda
  useEffect(() => {
    setFilteredCursos(
      cursos.filter(curso =>
        curso.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        curso.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, cursos]);




  // Función para obtener la lista de cursos
  async function fetchCursos() {
    
    try {
      let curs = await getCursosCout();

      curs.sort((a, b) => a.nombre.localeCompare(b.nombre));
      setCursos(curs.map(curso => ({
        ...curso,
        visible: true,
        selected: false,
        cantidadProfesionales: curso.cantidadProfesionales,
        cantidadAlumnos: curso.cantidadAlumnos,


      })));
     
      const participantes = curs.map((curso: any) => ({
        cursoId: curso.id,
        alumnos: curso.cantidadAlumnos || 0,
        profesionales: curso.cantidadProfesionales || 0,
      }));
      setParticipantesPorTaller(participantes);

    } catch (error) {
      console.error("Error al cargar los cursos:", error);
    } finally {
      setLoading(false);
    }
  }

  // Método para obtener las imagenes
  const fetchImages = async () => {
    const result = await getImages_talleresAdmin();

    if (result.error) {
      setErrorMessage(result.error);
    } else {
      setImages(result.images);
      setDownloadurls(result.downloadurls);

      // Mapear las imágenes con los cursos
      const updatedCursos = mapearImagenes(cursos, {
        images: result.images,
        downloadurls: result.downloadurls
      });

      // Ordenar los cursos alfabéticamente por nombre
      updatedCursos.sort((a, b) => a.nombre.localeCompare(b.nombre));

      // Actualiza el estado de los cursos
      setCursos(updatedCursos);

      // Marcar las imágenes como cargadas
      setImagesLoaded(true);
    }
  };

  // Función para eliminar un curso
  async function handleEliminarCurso(id: number) {
    setIsDeleting(true);
    try {
      const result = await deleteCurso(id);

      if (result.success === true) {
        setErrorMessage(null);
        // Actualizar la lista de cursos, excluyendo el curso eliminado
        setCursos(cursos.filter((curso) => curso.id !== id));
        setCursoAEliminar(null);
      } else {
        // Si la eliminación falló, mostrar el mensaje de error devuelto
        setErrorMessage(result.message);
      }
    } catch (error) {
      setErrorMessage(
        "Hubo un error inesperado al intentar eliminar el curso."
      );
    } finally {
      setIsDeleting(false);
    }
  }

  // Función para obtener los alumnos inscriptos en un curso
  async function fetchAlumnosByIdCurso(id: number) {
    try {
      setLoading2(true);
      const alumnos = await getAlumnosByIdCurso(id);
      setAlumnos(alumnos);
    }
    catch (error) {
      console.error("No se pudo obtener los alumnos inscriptos en el curso", error);
    } finally {
      setLoading2(false);
    }
  }
  // Función para obtener los profesionales inscriptos en un curso
  async function fetcProfesionalesByIdCurso(id: number) {
    try {
      setLoading2(true);
      const prof = await getProfesionalesByCursoId(id);
      setProfesionales(prof);
    }
    catch (error) {
      console.error("No se pudo obtener los profesionales inscriptos en el curso", error);
    } finally {
      setLoading2(false);
    }
  }

  //region return
  return (
    <main
      className="relative bg-cover bg-center min-h-screen"

    >
      <Navigate />

      {/* Modal de confirmación de eliminación */}
      {cursoAEliminar && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg relative">
            {errorMessage && <div className="text-red-600 mb-4">{errorMessage}</div>}
            <h2 className="text-lg mb-4">Confirmar Eliminación</h2>

            <p>
              ¿Estás seguro de que deseas eliminar el taller:{" "}
              <strong>{cursoAEliminar.nombre}</strong>?
            </p>
            <div className="flex justify-end space-x-4 mt-4">
              <button
                onClick={() => {
                  handleEliminarCurso(cursoAEliminar.id);
                }}
                disabled={isDeleting}
                className="bg-red-700 py-2 px-5 text-white rounded hover:bg-red-800 disabled:opacity-50"
              >
                {isDeleting ? "Eliminando..." : "Confirmar Eliminación"}
              </button>
              <button
                onClick={() => {
                  setCursoAEliminar(null);
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

      {/* Contenedor Principal */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Encabezado */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Talleres</h1>
              <p className="mt-1 text-sm text-gray-500">
                Gestiona los talleres del sistema
              </p>
            </div>
            <button
              onClick={() => setSelectedCursoId(-1)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
              <span>Nuevo Taller</span>
            </button>
          </div>

          {/* Barra de búsqueda */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nombre, descripción..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Contenedor de talleres */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Encabezado de tabla */}
            <div className="hidden sm:grid grid-cols-12 bg-gray-50 py-4 px-6 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="col-span-5">Taller</div>
              <div className="col-span-4">Descripción</div>
              <div className="col-span-2 text-center">Participantes</div>
              <div className="col-span-1 text-center">Acciones</div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader />
              </div>
            ) : filteredCursos.length === 0 ? (
              // Mensaje de lista vacía
              <div className="py-12 px-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                  <Calendar className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">No hay talleres</h3>
                <p className="text-sm text-gray-500">
                  Comienza creando un taller
                </p>
              </div>
            ) : (
              filteredCursos.map((talleres) => (
                // Tarjetas responsivas
                <div
                  key={talleres.id}
                  className="flex flex-col sm:grid sm:grid-cols-12 items-center sm:items-start py-4 px-6 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  {/* Imagen y Nombre */}
                  <div className="flex items-center gap-4 sm:col-span-5 mb-4 sm:mb-0">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <img
                        src={talleres.imageUrl || NoImage.src}
                        alt={talleres.nombre}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{talleres.nombre}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {talleres.fechaInicio &&
                            new Date(new Date(talleres.fechaInicio).setDate(new Date(talleres.fechaInicio).getDate() + 1)).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Descripción */}
                  <div className="sm:col-span-4 text-sm text-gray-600 line-clamp-2 mb-4 sm:mb-0">
                    {talleres.descripcion}
                  </div>

                  {/* Participantes */}
                  <div className="sm:col-span-2 flex items-center justify-center gap-1.5 mb-4 sm:mb-0">
                    <button
                      title="Alumnos inscriptos"
                      onClick={() => {
                        fetchAlumnosByIdCurso(talleres.id);
                        setCursoSelected(talleres);
                        setOpenModalAlumnos(true);
                      }}
                      className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-800"
                    >
                      <GraduationCap className="w-5 h-5 text-gray-400 hover:text-blue-600" />
                      <span>{getCantidadPorTaller(talleres.id, "alumnos") || 0}</span>
                    </button>
                    <button
                      title="Profesionales inscriptos"
                      onClick={() => {
                        fetcProfesionalesByIdCurso(talleres.id);
                        setCursoSelected(talleres);
                        setOpenModalProfesionales(true);
                      }}
                      className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-800"
                    >
                      <UserRound className="w-5 h-5 text-gray-400 hover:text-blue-600" />
                      <span>{getCantidadPorTaller(talleres.id, "profesionales") || 0}</span>
                    </button>
                  </div>

                  {/* Acciones */}
                  <div className="sm:col-span-1 flex justify-center gap-2">
                    <button
                      onClick={() => { setSelectedCursoId(talleres.id) }}
                      className="text-indigo-600 hover:text-indigo-900 p-1 hover:bg-indigo-50 rounded"
                      title="Editar taller"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setCursoAEliminar(talleres)}
                      className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                      title="Eliminar taller"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal de alumnos a agregar */}
      {(openModalAlumnos || openModalProfesionales) && cursoselected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <UserSelector
            curso={{
              id: cursoselected.id,
              nombre: `${cursoselected.nombre}`,
              personas: [] // Provide an empty array or the appropriate data
            }}
            setParticipantesPorTaller = {setParticipantesPorTaller}
            esAlumno={openModalAlumnos ? true : false}
            setEditar={(isOpen) => {
              if (openModalAlumnos) {
                setOpenModalAlumnos(isOpen);
              } else {
                setOpenModalProfesionales(isOpen);
              }
              if (!isOpen) {
                fetchCursos(); // Update the list of courses when the modal is closed
                // traer las imegenes
                fetchImages();
              }
            }}
            setCursoSelected={setCursoSelected}
            cursoselected={cursoselected ? { ...cursoselected, personas: [] } : null}
            personas={openModalAlumnos ? alumnos : profesionales}
            setPersonas={openModalAlumnos ? setAlumnos : setProfesionales}
          />
        </div>
      )}

      {/* Formulario de edición/creación de curso */}
      {selectedCursoId !== null && (
        <CursoForm
          selectedCursoId={selectedCursoId}
          cursos={cursos}
          setSelectedCursoId={setSelectedCursoId}
          fetchCursos={fetchCursos}
          fetchImages={fetchImages}
          setImagesLoaded={setImagesLoaded}
        />
      )}
    </main>
  );
};

export default withAuth(Cursos);