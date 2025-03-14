"use client";
import React, { useState, useEffect } from "react";
import { getCronogramaByIdAlumno } from "../../../services/cronograma/alumno_cronograma";
import { getCursos } from "../../../services/cursos";
import { getDias, getHoras } from "../../../services/dia";
import { getAlumnoByCookie } from "../../../services/Alumno";
import withAuthUser from "../../../components/alumno/userAuth";
import Navigate from "../../../components/alumno/navigate/page";
import Background from "../../../../public/Images/Background.jpeg";
import Loader from "@/components/Loaders/loader/loader";
import But_aside from "@/components/but_aside/page";
interface Curso {
  id: number;
  nombre: string;
}


function Horario() {
  const [horas, setHoras] = useState<{ id: number; hora_inicio: string }[]>([]);
  const [dias, setDias] = useState<string[]>([]);
  const [tabla, setTabla] = useState<(string | string[])[][]>([]);
  const [aulaNombres, setAulaNombres] = useState<{ [cursoNombre: string]: string }>({});
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

        const alumno = await getAlumnoByCookie();
        const cronogramas = await getCronogramaByIdAlumno(Number(alumno?.id)) || [];

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

  // Renderizado condicional
  if (loading) {
    return (
      <main className=" flex-col items-center justify-center min-h-screen bg-gray-100">
        <Navigate />
        <div className="flex items-center justify-center h-screen">
          <Loader />
        </div>
        <div className="w-full bg-sky-600 py-2">
          <But_aside />
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
        <div className="w-full bg-sky-600 py-2">
          <But_aside />
        </div>
      </main>
    );
  }
  return (
    <main className="flex-col items-center justify-center min-h-screen bg-gray-100" style={{ fontFamily: "Cursive" }}>
      {/* Barra de Navegación */}
      <Navigate />


      {/* Contenido Principal */}
      <div className="w-full max-w-5xl px-6 py-6 bg-white shadow-lg rounded-lg border border-gray-300 mx-auto">
        <div className="overflow-x-auto ">
          {/* Tabla de Horarios */}
          <table className="table-auto w-full border-collapse border border-gray-500 text-sm md:text-base lg:text-lg">
            {/* Título */}
            <caption className="text-xl font-semibold mb-4 text-black  py-2">
              Mis Horarios
            </caption>
            {/* Encabezados */}
            <thead className="bg-[#3f8df5] text-white">
              <tr>
                <th className="border border-gray-500  p-3 text-center min-w-[100px] max-w-[150px]">
                  Hora
                </th>
                {dias.map((dia) => (
                  <th
                    key={dia}
                    className="border border-gray-500  p-3 text-center capitalize min-w-[100px] max-w-[150px]"
                  >
                    {dia}
                  </th>
                ))}
              </tr>
            </thead>
            {/* Cuerpo */}
            <tbody>
              {horas.map((hora, rowIndex) => (
                <tr
                  key={hora.id}
                  className={rowIndex % 2 === 0 ? "bg-gray-100" : "bg-gray-50"}
                >
                  {/* Columna de Hora */}
                  <td className="border border-blue-500 p-3 text-center text-[#3f8df5] font-medium min-w-[100px] max-w-[150px]">
                    {hora.hora_inicio}
                  </td>
                  {/* Columnas de Contenido */}
                  {tabla[rowIndex]?.map((content, colIndex) => (
                    <td
                      key={`${rowIndex}-${colIndex}`}
                      className="border border-blue-500 p-3 text-center min-w-[100px] max-w-[200px] overflow-hidden text-ellipsis"
                    >
                      {content ? (
                        Array.isArray(content) ? (
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
                        )
                      ) : (
                        <div className="text-gray-400 italic">Sin cursos</div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Botón de Volver */}
          <div className="flex justify-center mt-4 mb-4">
            <a
              href="/usuario/principal"
              className="bg-blue-500 text-white px-6 py-2 rounded shadow hover:bg-blue-600 transition-all"
              aria-label="Volver"
            >
              Volver
            </a>
          </div>
        </div>
      </div>
      <div className="w-full bg-sky-600 py-2">
          <But_aside />
        </div>
    </main>

  );

}

export default withAuthUser(Horario);