"use client";
import React, { useState, useEffect } from "react";
import { AlertCircle, X, Plus, ChevronLeft, Calendar } from "lucide-react";
import {
  createCronograma,
  getCronogramasPorAula,
  deleteCronogramas,
  deleteCronogramaDiaHora,
  getCursosCronograma
} from "../../../services/cronograma/cronograma";
import Loader from '@/components/Loaders/loader/loader';
import Navigate from "../../../components/Admin/navigate/page";
import { getDias, getHoras } from "../../../services/dia";
import { getAulaById } from "@/services/aulas";
import withAuth from "../../../components/Admin/adminAuth";

interface Curso {
  id: number;
  nombre: string;
}

export function Horario({ idAula }: { idAula: number }) {
  const [horas, setHoras] = useState<{ id: number; hora_inicio: string }[]>([]);
  const [dias, setDias] = useState<string[]>([]);
  const [tabla, setTabla] = useState<string[][]>([]);
  const [aulaNombre, setAulaNombre] = useState<string>("");
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ row: number; col: number } | null>(null);
  const [loadingCursos, setLoadingCursos] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const horasData = await getHoras();
        const diasData = await getDias();
        const aula = await getAulaById(idAula);

        setAulaNombre(aula?.nombre || "");
        setHoras(horasData || []);
        setDias(diasData ? diasData.map((dia) => dia.nombre) : []);

        const tablaInicial = horasData ? horasData.map(() => Array(diasData.length).fill("")) : [];
        const cronogramas = await getCronogramasPorAula(idAula);

        cronogramas.forEach((cronograma) => {
          const horaIndex = horasData.findIndex((hora) => hora.id === cronograma.horaId);
          const diaIndex = diasData.findIndex((dia) => dia.id === cronograma.diaId);
          if (horaIndex !== -1 && diaIndex !== -1) {
            tablaInicial[horaIndex][diaIndex] = cronograma.cronograma.curso.nombre;
          }
        });

        setTabla(tablaInicial);
        setLoading(false);
      } catch (error) {
        console.error("Error al obtener datos:", error);
        setError("Hubo un problema al cargar los datos.");
        setLoading(false);
      }
    };

    obtenerDatos();
  }, [idAula]);

  useEffect(() => {
    if (isModalOpen) {
      const obtenerCursos = async () => {
        setLoadingCursos(true);
        setError(null);
        try {
          const cursosData = await getCursosCronograma();
          setCursos(cursosData || []);
        } catch (error) {
          console.error("Error al obtener los cursos", error);
          setError("No se pudieron cargar los cursos.");
        } finally {
          setLoadingCursos(false);
        }
      };
      obtenerCursos();
    }
  }, [isModalOpen]);

  const handleAddContent = (rowIndex: number, colIndex: number) => {
    setSelectedCell({ row: rowIndex, col: colIndex });
    setIsModalOpen(true);
  };

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
          newTabla[row][col] = cursos.find((curso) => curso.id === cursoId)?.nombre || "";
          return newTabla;
        });

        setErrorMessage(null);
        setIsModalOpen(false);
      } catch (error) {
        console.error("Error al crear el cronograma:", error);
        setErrorMessage("Error al asignar el curso. Intente nuevamente.");
      }
    }
  };

  const handleDeleteContent = (rowIndex: number, colIndex: number) => {
    setDeleteTarget({ row: rowIndex, col: colIndex });
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (deleteTarget) {
      const { row, col } = deleteTarget;
      const id_dia = col + 1;
      const id_hora = horas[row].id;

      try {
        await deleteCronogramaDiaHora(idAula, id_dia, id_hora);
        setTabla((prevTabla) => {
          const newTabla = [...prevTabla];
          newTabla[row][col] = "";
          return newTabla;
        });
      } catch (error) {
        console.error("Error al eliminar el cronograma:", error);
        setError("Error al eliminar el curso. Intente nuevamente.");
      } finally {
        setIsDeleteModalOpen(false);
        setDeleteTarget(null);
      }
    }
  };

  const limpiarTodoElCronograma = async () => {
    try {
      await deleteCronogramas(idAula);
      setTabla(horas.map(() => Array(dias.length).fill("")));
      setError(null);
      setIsConfirmModalOpen(false);
    } catch (error) {
      console.error("Error al eliminar el cronograma:", error);
      setError("Error al limpiar el cronograma. Intente nuevamente.");
    }
  };

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
      <main className="flex min-h-screen bg-gray-50">
        <Navigate />
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-lg w-full mx-4">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
            <p className="text-red-700 text-center">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 w-full bg-red-100 text-red-700 py-2 rounded-md hover:bg-red-200 transition-colors"
            >
              Reintentar
            </button>
          </div>
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
              href="/Admin/aulaSelector"
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
                <thead className="  bg-gray-100 ">
                  <tr className="bg-indigo-600 text-center">
                    <th className="border-b px-8 py-4 text-sm text-white font-semibold ">
                      Hora
                    </th>
                    {dias.map((dia) => (
                      <th
                        key={dia}
                        className="border-b px-6 py-4 text-white text-sm font-semibold"
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
                <button
                  onClick={() => setIsConfirmModalOpen(true)}
                  className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors"
                >
                  Limpiar cronograma
                </button>
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
      {isModalOpen && (
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
                    <Loader />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {cursos.map((curso) => (
                      <button
                        key={curso.id}
                        onClick={() => handleSelectCurso(curso.id)}
                        className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
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
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Confirmar eliminación
              </h2>
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
      )}

      {/* Clear All Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Confirmar limpieza del cronograma
              </h2>
              <p className="text-gray-600">
                ¿Estás seguro de que deseas eliminar todo el cronograma de {aulaNombre}?
                Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="border-t p-4 bg-gray-50 rounded-b-xl flex justify-end space-x-4">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={limpiarTodoElCronograma}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
