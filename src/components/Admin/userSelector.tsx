import React, { useState, useEffect } from 'react';
import { Search, Plus, X, Loader, Trash2, Pencil, Loader2 } from 'lucide-react';
import { getCursos } from '@/services/cursos';
import { getCursosByIdAlumno, createAlumno_Curso, deleteAlumno_Curso, getAlumnosByIdCurso } from '@/services/alumno_curso';
import { getCursosByIdProfesional, createProfesional_Curso, deleteProfesional_Curso, getProfesionalesByCursoId } from '@/services/profesional_curso';
import { set } from 'zod';
import { getAlumnos } from '@/services/Alumno';
import { getProfesionales } from '@/services/profesional';

interface Curso {
  id: number;
  nombre: string;
  personas: Persona[];
}

interface Persona {
  id: number;
  nombre: string;
  apellido: string
  email: string;

}

interface Props {
  curso: Curso;
  esAlumno: boolean;
  setEditar: React.Dispatch<React.SetStateAction<boolean>>;
  setCursoSelected: React.Dispatch<React.SetStateAction<any>>;
  cursoselected: Curso | null;
  personas: Persona[];
  setPersonas: React.Dispatch<React.SetStateAction<Persona[]>>;
  setParticipantesPorTaller: React.Dispatch<React.SetStateAction<{ cursoId: number; alumnos: number; profesionales: number }[]>>;
}

export default function UserSelector(props: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [curso, setCurso] = useState<Curso>(props.curso);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [personasSeleccionadas, setpersonasSeleccionadas] = useState<Persona[]>([]);

  //Estado para alamcenar las personas a eliminar
  const [personasSeleccionadasEliminadas, setpersonasSeleccionadasEliminadas] = useState<Persona[]>([]);
  const [personaBaja, setpersonaBaja] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [personaAlta, setpersonaAlta] = useState<boolean>(false);
  const [isAdding, setIsAdding] = useState(false);

  //estado para visualizar la edición
  const [openEdit, setOpenEdit] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await fetchPersonas();
        await fetchPersonasCurso();
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchPersonas = async () => {
    const pers = props.esAlumno? await getAlumnos() : await getProfesionales();
    setPersonas(pers);
  };

  const fetchPersonasCurso = async () => {
    const person = props.esAlumno
      ? await getAlumnosByIdCurso((curso.id))
      : await getProfesionalesByCursoId(curso.id);
    setCurso({ ...curso, personas: person });
  };

  // Filtrar personas que estén inscriptos
  const filteredPersonas = personas
    .filter(persona => !curso.personas.some(inscripto => inscripto.id === persona.id))
    .filter(persona => persona.nombre.toLowerCase().includes(searchTerm.toLowerCase()));

  const onCerrar = () => {
    props.setEditar(false);
  };

  const handleCheckboxChange = (persona: Persona) => {
    setpersonasSeleccionadas(prevState => {
      if (prevState.some(selected => selected.id === persona.id)) {
        return prevState.filter(selected => selected.id !== persona.id);
      } else {
        return [...prevState, persona];
      }
    });
  };

  const onAgregarPersona = async () => {
    if (personasSeleccionadas.length === 0) return;

    /* setLoading(true); */
    setIsAdding(true);
    try {
      // Agregar cursos seleccionados a curso_personas / curso_profesionales
      const promises = personasSeleccionadas.map(persona => {
        if (props.esAlumno) {
          return createAlumno_Curso({ cursoId: curso.id, alumnoId: persona.id });
        } else {
          return createProfesional_Curso({ cursoId: curso.id, profesionalId: persona.id });
        }

      });

      await Promise.all(promises);
      await fetchPersonasCurso();
      setpersonasSeleccionadas([]);
    } catch (error) {
      console.error('Error al agregar cursos:', error);
    } finally {
      props.setPersonas(prevpersonas => [...prevpersonas, ...personasSeleccionadas]);
      setLoading(false);
      setIsAdding(false);
      setpersonaAlta(false);
      
      // Actualiza el estado de participantes por taller
      props.setParticipantesPorTaller(prev => {
        // Busca el índice del taller correspondiente al curso actual
        const idx = prev.findIndex(p => p.cursoId === curso.id);
        // Crea una copia del array anterior para no mutar el estado directamente
        const updated = [...prev];
        if (idx !== -1) {
          if (props.esAlumno) {
        // Si es alumno, incrementa la cantidad de alumnos en el taller correspondiente
        updated[idx] = {
          ...updated[idx],
          alumnos: updated[idx].alumnos + personasSeleccionadas.length
        };
          } else {
        // Si es profesional, incrementa la cantidad de profesionales en el taller correspondiente
        updated[idx] = {
          ...updated[idx],
          profesionales: updated[idx].profesionales + personasSeleccionadas.length
        };
          }
          // Devuelve el array actualizado
          return updated;
        }
        // Si no se encontró el taller, retorna el array anterior sin cambios
        return prev;
      });
    }
  };

  const onEliminarPersonas = async ()=> {
    /* setLoading(true); */
    if (personasSeleccionadasEliminadas.length === 0) return;
    setIsDeleting(true);
    try {
      if (props.esAlumno) {
        for (const persona of personasSeleccionadasEliminadas) {
          await deleteAlumno_Curso(persona.id, curso.id);
        }

      } else {
        for (const persona of personasSeleccionadasEliminadas) {
          await deleteProfesional_Curso(persona.id, curso.id);
        }
      }
      await fetchPersonasCurso();
      

    } catch (error) {
      console.error('Error al eliminar curso:', error);
    } finally {
      props.setPersonas(prevpersonas => prevpersonas.filter(alumno => !personasSeleccionadasEliminadas.some(selected => selected.id === alumno.id)));
      setpersonasSeleccionadasEliminadas([])
      setLoading(false);
      setIsDeleting(false);
      setpersonaBaja(false);
// Actualiza el estado de participantes por taller
      props.setParticipantesPorTaller(prev => {
        // Busca el índice del taller correspondiente al curso actual
        const idx = prev.findIndex(p => p.cursoId === curso.id);
        // Crea una copia del array anterior para no mutar el estado directamente
        const updated = [...prev];
        if (idx !== -1) {
          if (props.esAlumno) {
        // Si es alumno, resta la cantidad de alumnos en el taller correspondiente
        updated[idx] = {
          ...updated[idx],
          alumnos: updated[idx].alumnos - personasSeleccionadas.length
        };
          } else {
        // Si es profesional, resta la cantidad de profesionales en el taller correspondiente
        updated[idx] = {
          ...updated[idx],
          profesionales: updated[idx].profesionales - personasSeleccionadas.length
        };
          }
          // Devuelve el array actualizado
          return updated;
        }
        // Si no se encontró el taller, retorna el array anterior sin cambios
        return prev;
      });
    }
  };

  //region return
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 px-4">

      {/* Modal para mostrar los personas del curso seleccionado */}
      {loading ? (
        <Loader className="h-12 w-12 animate-spin text-white" />


      ) : (
        <div className="fixed w-full flex items-center justify-center  bg-opacity-50  p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl relative max-h-[80vh] overflow-y-auto">
            <div className="bg-blue-700 p-6 flex justify-between items-center">
              <h2 className="text-lg md:text-xl font-semibold text-white">
                {props.esAlumno? "Alumnos": "Profesionales"} del Curso: {props.curso?.nombre}
              </h2>
            </div>
            <div className="mb-4 p-6 overflow-x-auto">
                <table className="w-full border-collapse bg-white text-sm md:text-base">
                <thead className="bg-gray-200">
                  <tr>
                  <th className="py-2 px-3 border-b border-gray-300 text-left">Código</th>
                  <th className="py-2 px-3 border-b border-gray-300 text-left">Nombre</th>
                  <th className="py-2 px-3 border-b border-gray-300 text-left">Apellido</th>
                  <th className="py-2 px-3 border-b border-gray-300 text-left">Email</th>
                  {openEdit && (
                    <th
                    title="Eliminar"
                    onClick={()=>{
                      personasSeleccionadasEliminadas.length === 0 ? "": setpersonaBaja(true)}
                    }
                    className={` py-2 px-3 border-b border-gray-300 text-center ${personasSeleccionadasEliminadas.length === 0 ? "cursor-not-allowe": " hover:text-red-700 cursor-pointer "}`}
                    >
                    <Trash2 className={` `} size={20} />
                    </th>
                  )}
                  </tr>
                </thead>
                <tbody>
                  {props.personas.length === 0 ? (
                  <tr>
                    <td
                    colSpan={openEdit ? 5 : 4}
                    className="py-4 px-3 text-center text-gray-600"
                    >
                    No hay {props.esAlumno ? "personas": "profesionales"} registrados en este curso.
                    </td>
                  </tr>
                  ) : (
                  props.personas
                    .map((alumno) => (
                    <tr
                      key={alumno.id}
                      className="odd:bg-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-2 px-3 border-b border-gray-300">
                      {alumno.id}
                      </td>
                      <td className="py-2 px-3 border-b border-gray-300">
                      {alumno.nombre}
                      </td>
                      <td className="py-2 px-3 border-b border-gray-300">
                      {alumno.apellido}
                      </td>
                      <td className="py-2 px-3 border-b border-gray-300">
                      {alumno.email}
                      </td>
                      {openEdit && (
                      <td className="py-2 px-3 border-b border-gray-300 text-center">
                        <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                          setpersonasSeleccionadasEliminadas((prev) => [
                            ...prev,
                            alumno,
                          ]);
                          } else {
                          setpersonasSeleccionadasEliminadas((prev) =>
                            prev.filter(
                            (persona) => persona.id !== alumno.id
                            )
                          );
                          }
                        }}
                        className={` cursor-pointer h-4 w-4 -translate-x-1 text-blue-600 rounded border-gray-300 focus:ring-blue-500`}
                        title="Alumno a eliminar"
                        />
                      </td>
                      )}
                    </tr>
                    ))
                  )}
                </tbody>
                </table>
            </div>
            <div className="flex justify-between px-6 mb-8">
              <button
                onClick={() => {
                  setOpenEdit(!openEdit)
                  setpersonasSeleccionadas([])
                  setpersonasSeleccionadasEliminadas([])
                }
                }
                className={`flex items-center gap-2 px-3 py-1 rounded-md transition-colors ${openEdit
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-blue-600 hover:bg-blue-700'
                  } text-white`}
              >
                {openEdit ? <X size={14} /> : <Pencil size={14} />}
                <span>{openEdit ? 'Cancelar' : 'Editar'}</span>
              </button>
              {/* Botón para inscripción con contador */}
              <div className="flex items-center gap-4 px-2">
                <button
                  onClick={() => setpersonaAlta(true)}
                  disabled={personasSeleccionadas.length === 0}
                  className={`flex items-center justify-center gap-2 px-4 py-1 rounded-md transition-colors w-full max-w-[150px] ${personasSeleccionadas.length === 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                    } ${openEdit ? 'flex' : 'hidden'}`}
                >
                  <Plus size={16} />
                  <span>Agregar</span>
                </button>
                {personasSeleccionadas.length > 0 && (
                  <span className={`text-sm text-gray-600  ${openEdit ? 'flex' : 'hidden'}`}>
                    {personasSeleccionadas.length} {props.esAlumno? "alumno": "profesional"}{personasSeleccionadas.length !== 1 ? 's' : ''} seleccionado{personasSeleccionadas.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => {props.setCursoSelected(null); props.setEditar(false)}}
              className="absolute top-4 right-4 text-white hover:text-red-700 transition-colors"
            >
              <X size={24} />
            </button>

            {
              openEdit && (
                <>
                  <div className="border-t border-gray-300 mt-4">
                    <h2 className=" underline text-lg md:text-xl font-semibold text-center my-4 text-blue-600">
                      {props.esAlumno ? "Alumnos" : "Profesionales"} en la academia
                    </h2>
                  </div>
                  {/* Barra de búsqueda */}
                  <div className="mt-8 p-2">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder={`Buscar ${props.esAlumno ? "alumno" : "profesional"} `}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
                    </div>

                    {/* Resultados de la búsqueda */}
                    <div className="my-4  border rounded-lg">
                      <div className="max-h-64 overflow-y-auto divide-y">
                        {filteredPersonas.length > 0 ? (
                          filteredPersonas.map(persona => (
                            <div
                              key={persona.id}
                              className="p-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                            >
                              <span>{persona.nombre} {persona.apellido}</span>
                              <input
                                type="checkbox"
                                checked={personasSeleccionadas.some(selected => selected.id === persona.id)}
                                onChange={() => handleCheckboxChange(persona)}
                                className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                              />
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-gray-500">
                            {searchTerm ? "Sin resultados" : `No hay ${props.esAlumno ? "personas" : "profesionales"} disponibles`}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>

              )}
          </div>

        </div >
      )
      }

      {
        personaBaja && (
          <div className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg relative">
              {errorMessage && <div style={{ color: "red" }}>{errorMessage}</div>}

              <h2 className="text-lg mb-4">Confirmar Eliminación</h2>
              <p>
                ¿Estás seguro de que deseas eliminar {personasSeleccionadas.length === 1 ? "al" : "a los"} siguiente{personasSeleccionadas.length === 0 ? "" : "s"} {props.esAlumno ? "alumno" : "profesionale"}{personasSeleccionadas.length == 1 ? "" : "s"} de {curso.nombre}: {" "}
                <strong>{personasSeleccionadasEliminadas.map(curso => curso.nombre).join(", ")}</strong>?
              
              </p>
              <div className="flex justify-end space-x-4 mt-4">
                <button
                  onClick={() => {
                    onEliminarPersonas();
                  }}
                  disabled={isDeleting}
                  className="bg-red-700 py-2 px-5 text-white rounded hover:bg-red-800"
                >
                  {isDeleting ? "Eliminando..." : "Confirmar Eliminación"}
                </button>
                <button
                  onClick={() => setpersonaBaja(false)}
                  disabled={isDeleting}
                  className="bg-gray-700 py-2 px-5 text-white rounded hover:bg-gray-800"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )
      }
      {
        personaAlta && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg relative">
              {errorMessage && <div style={{ color: "red" }}>{errorMessage}</div>}

              <h2 className="text-lg mb-4">Confirmar Alta</h2>
              <p>
                ¿Estás seguro de que deseas dar de alta {personasSeleccionadas.length === 1 ? "al" : "a los"} siguiente{personasSeleccionadas.length === 1 ? "" : "s"} {props.esAlumno ? "alumno" : "profesionale"}{personasSeleccionadas.length == 0 ? "" : "s"} al taller {curso.nombre}:{" "}
                <strong>{personasSeleccionadas.map(curso => curso.nombre).join(", ")}</strong>?
              </p>
              <div className="flex justify-end space-x-4 mt-4">
                <button
                  onClick={() => {
                    onAgregarPersona();
                  }}
                  disabled={isAdding}
                  className="bg-blue-700 py-2 px-5 text-white rounded hover:bg-blue-800"
                >
                  {isAdding ? "Agregando..." : "Agregar"}
                </button>
                <button
                  onClick={() => setpersonaAlta(false)}
                  disabled={isAdding}
                  className="bg-gray-700 py-2 px-5 text-white rounded hover:bg-gray-800"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )
      }

    </div >
  );
}