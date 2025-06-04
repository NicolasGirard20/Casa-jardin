"use client"; // Esta línea indica que este archivo debe ejecutarse en el cliente
import Loader from '@/components/Loaders/loader/loader';
import React, { useState, useEffect } from "react";

// Importamos los servicios que utilizaremos para interactuar con la API
import {
  createCronograma,
  deleteCronogramas,
  getCronogramasPorAula,
} from "../../../../services/cronograma/cronograma";
import { getCursosByIdProfesional, deleteCronogramaDiaHoraProfesional } from "../../../../services/cronograma/profesional_cronograma";
import { getDias, getHoras } from "../../../../services/dia";
import { getAulaById } from "@/services/aulas";
import Navigate from "../../../../components/profesional/navigate/page";
import { AlertCircle, Calendar, ChevronLeft, Loader2, Plus, X } from 'lucide-react';
// Definimos una interfaz para los cursos para tipar correctamente los datos
type Curso = {
  id: number;
  nombre?: string; // Propiedad ahora opcional
  cursoId?: number;
  profesionalId?: number;
};



// Componente principal Horario
export default function HorarioProfesional({ idAula, idProfesional }: { idAula: number, idProfesional: number }) {
  // Estados para almacenar datos y manejar la UI
  const [horas, setHoras] = useState<{ id: number; hora_inicio: string }[]>([]); // Horas del cronograma
  const [dias, setDias] = useState<string[]>([]); // Días de la semana
  const [tabla, setTabla] = useState<string[][]>([]); // Tabla bidimensional para el cronograma
  const [aulaNombre, setAulaNombre] = useState<string>(""); // Nombre del aula
  const [cursos, setCursos] = useState<Curso[]>([]); // Lista de cursos disponibles
  const [selectedCell, setSelectedCell] = useState<{
    row: number;
    col: number;
  } | null>(null); // Celda seleccionada para agregar un curso
  const [isModalOpen, setIsModalOpen] = useState(false); // Controla la visibilidad del modal para seleccionar cursos
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // Controla la visibilidad del modal de confirmación de eliminación
  const [deleteTarget, setDeleteTarget] = useState<{
    row: number;
    col: number;
  } | null>(null); // Celda objetivo para la eliminación
  const [loadingCursos, setLoadingCursos] = useState(false); // Estado para indicar si los cursos están cargando
  const [loading, setLoading] = useState(true); // Estado para indicar si los datos generales están cargando
  const [error, setError] = useState<string | null>(null); // Mensaje de error, si lo hay
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const openConfirmModal = () => setIsConfirmModalOpen(true);
  const closeConfirmModal = () => setIsConfirmModalOpen(false);



  // useEffect para obtener los datos al montar el componente o cuando cambia el id del aula
  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        // Obtener horas y días desde la API
        const horasData = await getHoras();
        const diasData = await getDias();

        // Obtener información del aula según el ID
        const aula = await getAulaById(idAula);
        setAulaNombre(aula?.nombre || "");

        // Actualizar estados con las horas y días obtenidos
        setHoras(horasData || []);
        setDias(diasData ? diasData.map((dia) => dia.nombre) : []);

        // Inicializar la tabla con celdas vacías
        const tablaInicial = horasData
          ? horasData.map(() => Array(diasData.length).fill(""))
          : [];
        setTabla(tablaInicial);

        // Obtener los cronogramas asignados al aula
        const cronogramas = await getCronogramasPorAula(idAula);

        // Rellenar la tabla con los cursos asignados
        cronogramas.forEach((cronograma) => {
          const horaIndex = horasData.findIndex(
            (hora) => hora.id === cronograma.horaId
          );
          const diaIndex = diasData.findIndex(
            (dia) => dia.id === cronograma.diaId
          );
          if (horaIndex !== -1 && diaIndex !== -1) {
            tablaInicial[horaIndex][diaIndex] =
              cronograma.cronograma.curso.nombre;
          }
        });

        setTabla(tablaInicial); // Actualizar la tabla en el estado
        setLoading(false); // Finalizar el estado de carga
      } catch (error) {
        console.error("Error al obtener datos:", error);
        setError("Hubo un problema al cargar los datos."); // Establecer mensaje de error
        setLoading(false); // Finalizar el estado de carga incluso si hay error
      }
    };

    obtenerDatos(); // Llamar a la función para obtener datos
  }, [idAula]); // Dependencia: se ejecuta cuando cambia el id del aula

  // useEffect para obtener los cursos cuando se abre el modal de selección
  useEffect(() => {
    if (isModalOpen) {
      const obtenerCursos = async () => {
        setLoadingCursos(true); // Indicar que los cursos están cargando
        setError(null); // Resetear cualquier error previo
        try {
          const cursosData = await getCursosByIdProfesional(idProfesional); // Obtener cursos desde la API
          // Actualizar el estado de cursos con los datos obtenidos
          setCursos(cursosData || []);

        } catch (error) {
          console.error("Error al obtener los cursos", error);
          setError("No se pudieron cargar los cursos."); // Establecer mensaje de error
        } finally {
          setLoadingCursos(false); // Finalizar el estado de carga de cursos
        }
      };
      obtenerCursos(); // Llamar a la función para obtener cursos
    }
  }, [isModalOpen]); // Dependencia: se ejecuta cuando se abre el modal

  // Función para manejar la apertura del modal de selección de curso
  const handleAddContent = (rowIndex: number, colIndex: number) => {
    setSelectedCell({ row: rowIndex, col: colIndex }); // Establecer la celda seleccionada
    setIsModalOpen(true); // Abrir el modal de selección de curso
  };

  // Función para manejar la selección de un curso
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSelectCurso = async (cursoId: number) => {
    if (selectedCell) {
      const { row, col } = selectedCell;
      const id_dia = col + 1;
      const id_hora = horas[row].id;

      if (tabla[row][col]) {
        setErrorMessage("Ya hay un curso asignado a esta hora y día.");
        return;
      }

      try {
        const result = await createCronograma({
          id_aula: idAula,
          id_curso: cursoId,
          diasHoras: [{ id_dia, id_hora }],
        });

        if (result.error) {
          setErrorMessage(result.error);
          return;
        }

        setTabla((prevTabla) => {
          const newTabla = [...prevTabla];
          newTabla[row][col] =
            cursos.find((curso) => curso.id === cursoId)?.nombre || "";
          return newTabla;
        });

        setErrorMessage(null); // Limpiar el mensaje de error
        setIsModalOpen(false); // Cerrar el modal si la operación fue exitosa
      } catch (error) {
        console.error("Error al crear el cronograma:", error);
        setErrorMessage("Error al asignar el curso. Intente nuevamente.");
      }
    }
  };

  // Función para manejar la eliminación de un curso en una celda específica
  const handleDeleteContent = (rowIndex: number, colIndex: number) => {
    setDeleteTarget({ row: rowIndex, col: colIndex }); // Establecer la celda objetivo para eliminar
    setIsDeleteModalOpen(true); // Abrir el modal de confirmación de eliminación
  };

  // Función para confirmar la eliminación de un curso
  const confirmDelete = async () => {
    if (deleteTarget) {
      const { row, col } = deleteTarget;
      const id_dia = col + 1; // Día correspondiente (1 = Lunes, etc.)
      const id_hora = horas[row].id;

      try {
        // Eliminar el cronograma de la base de datos
        const error = await deleteCronogramaDiaHoraProfesional(idAula, id_dia, id_hora, idProfesional);
        if (error) {
          setErrorMessage(error.success || "Error desconocido");
          return;

        } else {
          setErrorMessage(null);
          setIsDeleteModalOpen(false);
          setDeleteTarget(null);



          // Actualizar la tabla en el estado, limpiando la celda eliminada
          setTabla((prevTabla) => {
            const newTabla = [...prevTabla];
            newTabla[row][col] = ""; // Limpiar la celda
            return newTabla;

          });
        }
      } catch (error) {
        console.error("Error al eliminar el cronograma:", error);
        setError("Error al eliminar el curso. Intente nuevamente."); // Establecer mensaje de error
      }
    }
  };


  useEffect(() => {
    // para el error de la eliminación de un curso tenga un tiempo de vida
    const timer = setTimeout(() => {
      setErrorMessage(null);
    }, 5000);

    return () => clearTimeout(timer); // Cleanup function to clear the timeout
  }, [errorMessage]);


  // Renderizado condicional para mostrar una pantalla de carga mientras los datos se cargan
  if (loading) {
    return (
      <main className=" items-center justify-center min-h-screen bg-gray-100">
        <Navigate />
        <div className="flex flex-col items-center justify-center h-screen">
          <Loader />
          <p className="text-gray-700 mt-4">Cargando el cronograma elegido...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className=" flex-col items-center justify-center min-h-screen bg-gray-100">
        <Navigate />

        <div className="flex items-center justify-center h-screen">
          <div className="text-xl font-bold text-red-500">{error}</div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col min-h-screen bg-gray-50">
      <Navigate />
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <a
              href="/profesional/cronogramap/seleccionar"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:font-semibold transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Volver</span>
            </a>
            <div className="flex items-center gap-4 mb-4">


              <h1 className="text-3xl w-full font-bold text-black flex items-center justify-center gap-2">
                <Calendar className="w-8 h-8 text-black" />
                Cronograma de {aulaNombre}
              </h1>

            </div>
            <p className="text-gray-600 text-center w-full items-center">
              Gestiona los horarios y cursos asignados a esta aula
            </p>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse ">
                <thead className="  bg-gray-100  ">
                  <tr className="bg-indigo-600 text-center">
                    <th className="border-b px-8 text-white py-4 text-sm font-semibold text-gray-900">
                      Hora
                    </th>
                    {dias.map((dia) => (
                      <th
                        key={dia}
                        className="border-b px-6 py-4 text-sm text-white font-semibold text-gray-900"
                        colSpan={6 / dias.length}
                      >
                        {dia}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {horas.map((hora, rowIndex) => (
                    <tr key={hora.id} className="hover:bg-gray-50">
                      <td className="border-b px-6 py-4 text-sm text-gray-900 font-medium">
                        {hora.hora_inicio}
                      </td>
                      {tabla[rowIndex]?.map((content, colIndex) => (
                        <td
                          key={`${rowIndex}-${colIndex}`}
                          className="border-b px-6 py-4 relative"
                        >
                          {content ? (
                            <div className="bg-blue-50 rounded-lg p-3 relative group">
                              <p className="text-sm text-blue-900 font-medium">{content}</p>
                              <button
                                onClick={() => handleDeleteContent(rowIndex, colIndex)}
                                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-red-100 text-red-600 p-1 rounded-full hover:bg-red-200"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAddContent(rowIndex, colIndex)}
                              className="w-full text-sm bg-gray-50 text-gray-600 py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <Plus className="w-4 h-4 mx-auto" />
                            </button>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Actions */}
            <div className="p-6 bg-gray-50 border-t">
              <div className="flex justify-between items-center">

              </div>
            </div>
          </div>

          {/* Info Alert */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-blue-800 mb-1">
                  Información importante
                </h3>
                <p className="text-blue-700 text-sm">
                  El sistema valida que una misma materia no esté asignada en el mismo día y hora en otros cronogramas.
                  Sin embargo, es posible asignar al mismo profesor diferentes cursos en el mismo horario y día.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Selection Modal */}
      {
        isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Seleccionar curso
                </h2>
                {errorMessage && (
                  <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-lg">
                    {errorMessage}
                  </div>
                )}
                <div className="max-h-[60vh] overflow-y-auto">
                  {loadingCursos ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                  ) : (
                    <div className="space-y-2 ">
                      {cursos.map((curso) => (
                        <button
                          key={curso.id}
                          onClick={() => handleSelectCurso(curso.id)}
                          className="w-full hover:underline text-left px-4 py-3  rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          {curso.nombre}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="border-t p-4 bg-gray-50 rounded-b-xl">
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setErrorMessage(null);
                  }}
                  className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Delete Confirmation Modal */}
      {
        isDeleteModalOpen && deleteTarget && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">

              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Confirmar eliminación
                </h2>
                {errorMessage && (
                  <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-lg">
                    {errorMessage}
                  </div>
                )}
                <p className="text-gray-600">
                  ¿Estás seguro de que deseas eliminar este curso del cronograma?
                </p>
              </div>

              <div className="border-t p-4 bg-gray-50 rounded-b-xl flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setDeleteTarget(null);
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )
      }


    </main >
  );
}
