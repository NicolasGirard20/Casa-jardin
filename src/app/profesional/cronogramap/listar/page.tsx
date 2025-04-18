"use client";

import React, { useState, useEffect } from "react";
import { getCursos } from "../../../../services/cursos";
import { getCronogramaByIdProfesional } from "../../../../services/cronograma/profesional_cronograma";
import { getDias, getHoras } from "../../../../services/dia";
import { getProfesionalByCookie, getProfesionalById } from "../../../../services/profesional";
import { get } from "http";
import Navigate from "../../../../components/profesional/navigate/page";
import Loader from '@/components/Loaders/loader/loader';

interface Curso {
    id: number;
    nombre: string;
}

export default function Horario() {
    const [horas, setHoras] = useState<{ id: number; hora_inicio: string }[]>([]);
    const [dias, setDias] = useState<string[]>([]);
    const [tabla, setTabla] = useState<string[][]>([]);
    const [cursos, setCursos] = useState<Curso[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [aulaNombres, setAulaNombres] = useState<{ [key: string]: string }>({});
    const [loadingCursos, setLoadingCursos] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const obtenerDatos = async () => {
            try {
                const horasData = await getHoras();
                const diasData = await getDias();

                setHoras(horasData || []);
                setDias(diasData ? diasData.map((dia) => dia.nombre) : []);

                const tablaInicial = horasData
                    ? horasData.map(() => Array(diasData.length).fill([]))
                    : [];
                setTabla(tablaInicial);
                const idProfesional = await getProfesionalByCookie(); // Assuming you have a function to get the ID from a cookie

                if (!idProfesional) {
                    setError("No se pudo obtener el ID del profesional.");
                    setLoading(false);
                    return;
                }

                const cronogramas = await getCronogramaByIdProfesional(Number(idProfesional.id)) || [];

                const aulaMap: { [cursoNombre: string]: string } = {};

                cronogramas.forEach((cronograma) => {
                    const horaIndex = horasData.findIndex((hora) => hora.id === cronograma.horaId);
                    const diaIndex = diasData.findIndex((dia) => dia.id === cronograma.diaId);

                    if (horaIndex !== -1 && diaIndex !== -1) {
                        const cursoNombre = cronograma.cronograma.curso.nombre;
                        const aulaNombre = cronograma.cronograma.aula.nombre;

                        // Asociar el curso con su aula específica en este cronograma
                        aulaMap[`${cursoNombre}-${cronograma.cronogramaId}`] = aulaNombre;

                        // Actualizar la tabla, guardando el curso con el ID específico del cronograma
                        const currentCell = tablaInicial[horaIndex][diaIndex];
                        if (Array.isArray(currentCell)) {
                            tablaInicial[horaIndex][diaIndex] = [
                                ...currentCell,
                                `${cursoNombre}-${cronograma.cronogramaId}`,
                            ];
                        } else {
                            tablaInicial[horaIndex][diaIndex] = [`${cursoNombre}-${cronograma.cronogramaId}`];
                        }
                    }
                });

                // Guardar el mapa de aulas en el estado
                setAulaNombres(aulaMap);
                setTabla(tablaInicial);
                setLoading(false);
            } catch (error) {
                console.error("Error al obtener datos:", error);
                setError("Hubo un problema al cargar los datos.");
                setLoading(false);
            }
        };

        obtenerDatos();
    }, []);

    useEffect(() => {
        if (isModalOpen) {
            const obtenerCursos = async () => {
                setLoadingCursos(true);
                setError(null);
                try {
                    const cursosData = await getCursos();
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
    //  panatalla de carga
    if (loading) {
      return (
        <main className=" flex-col items-center justify-center min-h-screen bg-gray-100">
          <Navigate />
          <div className="flex items-center justify-center h-screen">
            <Loader />
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
        <main className=" flex-col items-center justify-center min-h-screen bg-gray-100">
        <Navigate />
        <div className="w-full max-w-5xl px-6 py-6 bg-white shadow-lg rounded-lg border border-gray-300 mx-auto">
          <div className="overflow-x-auto">
            <table className="table-auto w-full border-collapse border border-gray-500 text-sm md:text-base lg:text-lg">
              <caption className="text-xl font-semibold mb-4 text-black  py-2">
                Mis horarios como profesor
              </caption>
              <thead>
                <tr className="bg-[#3f8df5] text-white">
                  <th className="border border-gray-500 p-2 text-center min-w-[100px] max-w-[150px]">
                    Hora
                  </th>
                  {dias.length > 0 &&
                    dias.map((dia) => (
                      <th
                        key={dia}
                        className="border border-gray-500 p-2 text-center min-w-[100px] max-w-[150px] capitalize"
                      >
                        {dia}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {horas.length > 0 &&
                  horas.map((hora, rowIndex) => (
                    <tr
                      key={hora.id}
                      className={rowIndex % 2 === 0 ? "bg-gray-100" : "bg-gray-50"}
                    >
                      <td className="border border-blue-500  p-2 text-center text-[#3f8df5] font-bold min-w-[100px] max-w-[150px]">
                        {hora.hora_inicio}
                      </td>
                      {tabla[rowIndex]?.map((content, colIndex) => (
                        <td
                          key={`${rowIndex}-${colIndex}`}
                          className="border border-blue-500  p-2 text-center min-w-[100px] max-w-[200px] overflow-hidden text-ellipsis"
                        >
                          {content ? (
                            <>
                              {Array.isArray(content) ? (
                                content.map((cursoCronograma, idx) => {
                                  const [curso] = cursoCronograma.split("-");
                                  return (
                                    <div key={idx} className="text-sm text-gray-700">
                                      <span>{curso}</span>
                                      <div className="text-xs text-gray-500">
                                        {aulaNombres[cursoCronograma] || "Aula no disponible"}
                                      </div>
                                    </div>
                                  );
                                })
                              ) : (
                                <div className="text-sm text-gray-700">
                                  <span>{content}</span>
                                  <div className="text-xs text-gray-500">
                                    {aulaNombres[content] || "Aula no disponible"}
                                  </div>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="text-gray-400 italic">Sin cursos</div>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
      
          <div className="flex justify-center mt-4 space-x-4">
            <a
              href="/profesional/cronogramap/seleccionar"
              className="bg-[#3f8df5] text-white px-4 py-2 rounded shadow hover:bg-blue-600 transition-all"
              aria-label="Modificar"
            >
              Modificar
            </a>
      
            <a
              href="/profesional/principal"
              className="bg-gray-500 text-white px-4 py-2 rounded shadow hover:bg-gray-600 transition-all"
              aria-label="Volver"
            >
              Volver
            </a>
          </div>
        </div>
      </main>
      
    );
      
}
