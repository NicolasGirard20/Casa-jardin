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
import { Calendar, ChevronLeft, Clock, MapPin, Users } from "lucide-react";
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
        <div className="flex flex-col items-center justify-center h-screen">
          <Loader />
          <p className="text-gray-700">Cargando su cronograma semanal...</p>
        </div>

        <div className="w-full ">
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
        <div className="w-full ">
          <But_aside />
        </div>
      </main>
    );
  }
  return (
    <div className="min-h-screen ">
      <Navigate />
      <div className="max-w-[90rem] mx-auto p-6">
        <button
          onClick={() => window.location.href = "/usuario/principal"}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:font-semibold transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Volver</span>
        </button>
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl text-black font-bold  flex items-center justify-center gap-2">
            <Calendar className="w-8 h-8 text-black" />
            Horario Académico
          </h1>
          <p className="text-gray-600 mt-2">Gestión de horarios y aulas</p>
        </div>

        {/* Calendar Container */}
        <div className="bg-white rounded-xl shadow-xl overflow-x-auto  border border-indigo-100">
          {/* Calendar Header */}
          <div className="grid grid-cols-7 min-w-[1000px]  bg-indigo-600 text-white">
            <div className="p-4 flex items-center justify-center font-semibold">
              <Clock className="w-5 h-5 mr-2" />
              Hora
            </div>
            {dias.map((dia) => (
              <div key={dia} className="p-4  text-center font-semibold">
                {dia}
              </div>
            ))}
          </div>

          {/* Calendar Body */}
            <div className="">
              {horas.map((hora, rowIndex) => (
              <div
                key={hora.id}
                className={`grid grid-cols-7 min-w-[1000px]   ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-indigo-50'
                }`}
              >
                <div className="p-4 border-r border-indigo-100 flex items-center justify-center font-medium text-indigo-900">
                {hora.hora_inicio}
                </div>
                {tabla[rowIndex]?.map((content, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`p-2 border-r border-indigo-100 relative group hover:bg-indigo-50 transition-colors flex items-center justify-center ${colIndex >= 6 ? 'bg-gray-50' : ''
                  }`}
                >
                  {Array.isArray(content) && content.length > 0 ? (
                  content.map((cursoCronograma, idx) => {
                    const [curso] = cursoCronograma.split("-");
                    return (
                    <div
                      key={idx}
                      className="relative group/card w-full h-full flex flex-col items-center justify-center"
                    >
                      <div className="text-center">
                      <div className="font-medium text-indigo-900 whitespace-normal break-words">
                        {curso}
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-xs text-indigo-600 opacity-90">
                        <MapPin className="w-5 h-5" />
                        <span className="truncate">
                        {aulaNombres[cursoCronograma] || "Aula no disponible"}
                        </span>
                      </div>
                      {/* Gradient border effect on hover */}
                      <div className="absolute inset-0 rounded-lg 
                        opacity-0 group-hover/card:opacity-100 -z-10 blur-[2px] transition-opacity duration-300" />
                      </div>
                    </div>
                    );
                  })
                  ) : (
                  <div className="text-gray-400 text-sm text-center opacity-0 group-hover:opacity-100 transition-opacity">
                    Disponible
                  </div>
                  )}
                </div>
                ))}
              </div>
              ))}
            </div>

        </div>

       
      </div>
      <But_aside />
    </div>
  );

}

export default withAuthUser(Horario);