import React, { useState, useEffect } from 'react';
import { Search, Plus, X, Loader, Trash2 } from 'lucide-react';
import { getCursos } from '@/services/cursos';
import { getCursosByIdAlumno, createAlumno_Curso, deleteAlumno_Curso } from '@/services/alumno_curso';
import { getCursosByIdProfesional, createProfesional_Curso, deleteProfesional_Curso } from '@/services/profesional_curso';
import { set } from 'zod';

interface Curso {
  id: number;
  nombre: string;
}

interface Persona {
  id: number;
  nombre: string;
  email: string;
  cursos: Curso[];
}

interface Props {
  persona: Persona;
  esAlumno: boolean;
  edad?: number;
  setEditar: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function CursoSelector(props: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [persona, setPersona] = useState<Persona>(props.persona); 
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(false);
  const [cursosSeleccionados, setCursosSeleccionados] = useState<Curso[]>([]);
  const [cursoBaja, setcursoBaja] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [cursoAlta, setcursoAlta] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await fetchCursos();
        await fetchCursosPersona();
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const fetchCursos = async () => {
    const cur = await getCursos();
    setCursos(cur);
  };

  const fetchCursosPersona = async () => {
    const cur = props.esAlumno
      ? await getCursosByIdAlumno(persona.id)
      : await getCursosByIdProfesional(persona.id);
    setPersona({...persona, cursos: cur});
  };

  // Filtrar cursos que no estén inscriptos
  const filteredCursos = cursos
    .filter(curso => !persona.cursos.some(inscripto => inscripto.id === curso.id))
    .filter(curso => curso.nombre.toLowerCase().includes(searchTerm.toLowerCase()));

  const onCerrar = () => {
    props.setEditar(false);
  };

  const handleCheckboxChange = (curso: Curso) => {
    setCursosSeleccionados(prevState => {
      if (prevState.some(selected => selected.id === curso.id)) {
        return prevState.filter(selected => selected.id !== curso.id);
      } else {
        return [...prevState, curso];
      }
    });
  };

  const onAgregarCurso = async () => {
    if (cursosSeleccionados.length === 0) return;
    
    setLoading(true);
    setIsAdding(true);
    try {
      // Agregar cursos seleccionados a curso_alumnos / curso_profesionales
      const promises = cursosSeleccionados.map(curso => {
        if (props.esAlumno) {
          return createAlumno_Curso({ cursoId: curso.id, alumnoId: persona.id });
        } else {
          return createProfesional_Curso({ cursoId: curso.id, profesionalId: persona.id });
        }
        
      });
      
      await Promise.all(promises);
      await fetchCursosPersona();
      setCursosSeleccionados([]);
    } catch (error) {
      console.error('Error al agregar cursos:', error);
    } finally {
      setLoading(false);
      setIsAdding(false);
      setcursoAlta(null);

    }
  };

  const onEliminarCurso = async (cursoId: number) => {
    setLoading(true);
    setIsDeleting(true);
    try {
      if (props.esAlumno) {
        await deleteAlumno_Curso(persona.id, cursoId);
      } else {
        await deleteProfesional_Curso(persona.id, cursoId);
      }
      await fetchCursosPersona();

    } catch (error) {
      console.error('Error al eliminar curso:', error);
    } finally {
      setLoading(false);
      setIsDeleting(false);
      setcursoBaja(null);

    }
  };


  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 px-4">
      
      {cursoBaja && (
            <div className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg relative">
                {errorMessage && <div style={{ color: "red" }}>{errorMessage}</div>}

                <h2 className="text-lg mb-4">Confirmar Eliminación</h2>
                <p>
                    ¿Estás seguro de que deseas eliminar al usuario del curso:{" "}
                    <strong>{cursoBaja.nombre}</strong>?
                </p>
                <div className="flex justify-end space-x-4 mt-4">
                    <button
                    onClick={() => {
                      onEliminarCurso(cursoBaja.id);
                    }}
                    disabled={isDeleting}
                    className="bg-red-700 py-2 px-5 text-white rounded hover:bg-red-800"
                    >
                    {isDeleting ? "Eliminando..." : "Confirmar Eliminación"}
                    </button>
                    <button
                    onClick={() => setcursoBaja(null)}
                    disabled={isDeleting}
                    className="bg-gray-700 py-2 px-5 text-white rounded hover:bg-gray-800"
                    >
                    Cancelar
                    </button>
                </div>
                </div>
            </div>
            )}
          {cursoAlta && (
            <div className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg relative">
                {errorMessage && <div style={{ color: "red" }}>{errorMessage}</div>}

                <h2 className="text-lg mb-4">Confirmar Alta</h2>
                <p>
                    ¿Estás seguro de que deseas dar de alta al usuario en los siguientes cursos:{" "}
                    <strong>{cursosSeleccionados.map(curso => curso.nombre).join(", ")}</strong>?
                </p>
                <div className="flex justify-end space-x-4 mt-4">
                    <button
                    onClick={() => {
                      onAgregarCurso();
                    }}
                    disabled={isAdding}
                    className="bg-red-700 py-2 px-5 text-white rounded hover:bg-red-800"
                    > 
                    {isAdding ? "Agregando..." : "Agregar"}
                    </button>
                    <button
                    onClick={() => setcursoAlta(null)}
                    disabled={isAdding}
                    className="bg-gray-700 py-2 px-5 text-white rounded hover:bg-gray-800"
                    >
                    Cancelar
                    </button>
                </div>
                </div>
            </div>
            )}
      {loading ? (
        <Loader className="h-12 w-12 animate-spin text-white" />
      ) : (
        <div className="bg-white rounded-lg shadow-lg  max-w-2xl w-full mx-auto relative">
          <button 
            onClick={onCerrar} 
            className="absolute top-4 right-4 text-white hover:text-red-700 transition-colors"
          >
            <X size={24} />
          </button>

          <div className="mb-6">
            <div className='bg-sky-600 rounded-t-lg w-full h-auto flex p-4'>
                <h2 className="text-2xl font-bold mb-4 text-white">Cursos de {persona.nombre}</h2>
            </div>
            {/* Cursos inscriptos */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-semibold mb-2">Cursos Inscriptos</h3>
              <div className="max-h-48 overflow-y-auto">
                <ul className="space-y-2">
                  {persona.cursos.map(curso => (
                    <li 
                      key={curso.id}
                      className="flex items-center justify-between text-gray-700 py-2 px-2 hover:bg-gray-100 rounded-md"
                    >
                      <span>{curso.nombre}</span>
                      <button
                        onClick={() => setcursoBaja(curso)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="Eliminar curso"
                      >
                        <Trash2 size={18} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Botón para inscripción con contador */}
            <div className="flex items-center gap-4 p-2">
              <button 
                onClick={() => setcursoAlta(true)}
                disabled={cursosSeleccionados.length === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  cursosSeleccionados.length === 0 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <Plus size={20} />
                <span>Agregar a Curso</span>
              </button>
              {cursosSeleccionados.length > 0 && (
                <span className="text-sm text-gray-600">
                  {cursosSeleccionados.length} curso{cursosSeleccionados.length !== 1 ? 's' : ''} seleccionado{cursosSeleccionados.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* Barra de búsqueda */}
          <div className="mt-8 p-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar cursos disponibles"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
            </div>

            {/* Resultados de la búsqueda */}
            <div className="mt-4 border rounded-lg">
              <div className="max-h-64 overflow-y-auto divide-y">
                {filteredCursos.length > 0 ? (
                  filteredCursos.map(curso => (
                    <div 
                      key={curso.id}
                      className="p-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                    >
                      <span>{curso.nombre}</span>
                      <input
                        type="checkbox"
                        checked={cursosSeleccionados.some(selected => selected.id === curso.id)}
                        onChange={() => handleCheckboxChange(curso)}
                        className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    {searchTerm ? "Sin resultados" : "No hay cursos disponibles"}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}