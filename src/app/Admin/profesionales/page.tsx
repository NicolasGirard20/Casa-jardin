"use client"
// #region Imports
import type React from "react"
import { useEffect, useRef, useState } from "react"
import Navigate from "../../../components/Admin/navigate/page"
import { deleteProfesional, getProfesionalesNoPassword } from "../../../services/profesional"
//imagen default si el curso no tiene imagen
import NoImage from "../../../../public/Images/default-no-image.png"
import { getImagesUser } from "@/services/repoImage"
import withAuth from "../../../components/Admin/adminAuth" //para subir imagenes:
import { handleDeleteProfesionalImage, mapearImagenes } from "@/helpers/repoImages"
import Background from "../../../../public/Images/Background.jpeg"
import Loader from "@/components/Loaders/loadingTalleres/page";
import { Briefcase, Mail, Pencil, Phone, Plus, Search, Trash2, BookOpen } from "lucide-react"
//para el nuevo formulario
import type { ProfesionalSchema } from "@/components/formularios/profesionalAdminForm"
import ProfesionalAdminForm from "@/components/formularios/profesionalAdminForm"
import CursoSelector from "@/components/Admin/cursoSelector"

// #endregion

const Profesionales = () => {
  // #region UseStates
  const [profesionales, setProfesionales] = useState<any[]>([])
  const [profesionalAbuscar, setProfesionalAbuscar] = useState<string>("")
  // const [selectedProfesional, setSelectedProfesional, setProfesionalesListaCompleta] = useState<any>([]);
  const [profesionalesListaCompleta, setProfesionalesListaCompleta] = useState<any[]>([])
  // Estado para almacenar mensajes de error
  const [errorMessage, setErrorMessage] = useState<string>("")
  // Referencia para el contenedor de desplazamiento
  const scrollRef = useRef<HTMLDivElement>(null)
  //booleano para saber si las imagenes ya se cargaron
  const [imagesLoaded, setImagesLoaded] = useState<boolean>(false)
  const [imageUrls, setImageUrls] = useState<any>({})
  //para el modal de eliminación
  const [ProfesionalAEliminar, setProfesionalAEliminar] = useState<any[]>([])
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  //para el nuevo formulario
  const [selectedProfesional, setSelectedProfesional] = useState<ProfesionalSchema | null>(null)
  const [editar, setEditar] = useState<boolean>(false)
  const [changed, setChanged] = useState<boolean>(false)
  const [nueva, setNueva] = useState<boolean>(false)
  //para editar cursos
  const [editarCursos, setEditarCursos] = useState<boolean>(false)

  //para el loader
  const [loading, setLoading] = useState<boolean>(true)
  const [loadingImages, setLoadingImages] = useState<boolean>(true)

  // #region UseEffects

  //useEffect para obtener los profesionales
  useEffect(() => {
    if (profesionales.length === 0) {
      fetchProfesionales()
      handleCancel_init()
    }
  }, [profesionales.length])

  useEffect(() => {
    // Llamar a fetchImages después de que los cursos se hayan cargado
    if (profesionales.length > 0 && !imagesLoaded) {
      fetchImages()
    }
  }, [profesionales, imagesLoaded])

  useEffect(() => {
    if (errorMessage !== "") {
      setInterval(() => {
        setErrorMessage("")
      }, 5000)
    }
  }, [errorMessage])

  useEffect(() => {
    if (errorMessage.length > 0 && scrollRef.current) {
      scrollRef.current.scrollTop = 0
    }
  }, [errorMessage])

  //si hay algun cambio
  useEffect(() => {
    const loadChanges = async () => {
      if (changed) {
        //fetch de los profesionales
        await fetchProfesionales()
        //reset image loaded state to trigger a fresh image fetch
        setImagesLoaded(false)
        //listo
        setChanged(false)
      }
    }
    loadChanges()
  }, [changed])

  /*  */
  // #endregion
  async function fetchProfesionales() {
    setLoading(true)
    try {
      const data = await getProfesionalesNoPassword()

      setProfesionales(data)
      setProfesionalesListaCompleta(data)
    } catch (error) {
      console.error("Imposible obetener Profesionales", error)
    }
    setLoading(false)
  }

  // Método para obtener las imagenes
  const fetchImages = async () => {
    setLoadingImages(true)
    try {
      const result = await getImagesUser()

      if (result.error) {
        setErrorMessage(result.error)
      } else {
        console.log("Images fetched:", result)

        // Mapear las imágenes y crear un diccionario de imageUrls
        const updatedProfesionales = mapearImagenes(profesionales, {
          images: result.images,
          downloadurls: result.downloadurls,
        })

        // Create a fresh imageUrls dictionary without cache-busting parameter
        const newImageUrls: any = {}
        updatedProfesionales.forEach((profesional) => {
          if (profesional.imageUrl) {
            // Store the original URL without modification
            newImageUrls[profesional.id] = profesional.imageUrl
          }
        })

        // Actualiza el estado con el diccionario de imageUrls y los profesionales actualizados
        setImageUrls(newImageUrls)
        setProfesionales(updatedProfesionales)

        // Marcar las imágenes como cargadas
        setImagesLoaded(true)

        // Log for debugging
        updatedProfesionales.forEach((profesional) => {
          if (profesional.imageUrl) {
            console.log(`Profesional: ${profesional.id}, Image URL: ${profesional.imageUrl}`)
          }
        })
      }
    } catch (error) {
      console.error("Error fetching images:", error)
      setErrorMessage("Error al cargar las imágenes")
    } finally {
      setLoadingImages(false)
    }
  }

  async function handleEliminarProfesional(profesional: any[]) {
    try {
      setIsDeleting(true)
      //borrar profesional del repo
      for (const prof of profesional) {
        await deleteProfesional(prof.id)
        // Borrar imagen del repo
        if (prof.imagen) await handleDeleteProfesionalImage(prof.imagen)
      }
      fetchProfesionales()
      setIsDeleting(false)
      setProfesionalAEliminar([])
    } catch (error) {
      console.error("Error al eliminar el profesional", error)
    }
  }

  async function handleCancel_init() {
    setSelectedProfesional(null)
    fetchProfesionales()
    setErrorMessage("")
  }

  // Function to handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value.toLowerCase()
    const filteredProf = profesionalesListaCompleta.filter(
      (prof) => prof.nombre.toLowerCase().includes(searchTerm) || prof.apellido.toLowerCase().includes(searchTerm),
    )

    setProfesionalAbuscar(e.target.value)
    setProfesionales(filteredProf)
  }


  // #endregion

  // #region Return
  return (
    <main
      className="relative bg-cover bg-center min-h-screen"
      style={{
        backgroundImage: `url(${Background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Navigate />

      {ProfesionalAEliminar.length === 1 && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg relative">
            {errorMessage && <div style={{ color: "red" }}>{errorMessage}</div>}

            <h2 className="text-lg mb-4">Confirmar Eliminación</h2>
            <p>
              ¿Estás seguro de que deseas eliminar al profesional{" "}
              {ProfesionalAEliminar[0]?.nombre + " " + ProfesionalAEliminar[0]?.apellido}?
            </p>
            <div className="flex justify-end space-x-4 mt-4">
              <button
                onClick={() => {
                  handleEliminarProfesional(ProfesionalAEliminar)
                }}
                disabled={isDeleting}
                className="bg-red-700 py-2 px-5 text-white rounded hover:bg-red-800"
              >
                {isDeleting ? "Eliminando..." : "Confirmar Eliminación"}
              </button>
              <button
                onClick={() => {
                  setProfesionalAEliminar([])
                  setErrorMessage("")
                }}
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">PROFESIONALES</h1>
              <p className="mt-1 text-sm text-gray-500">Gestiona los profesionales del sistema</p>
            </div>
            {/* Botón para agregar un nuevo profesional */}
            <button
              onClick={() => {
                setNueva(true)
                setEditar(true)
                setSelectedProfesional(null)
              }}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
              <span>Nuevo Profesional</span>
            </button>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nombre..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={profesionalAbuscar}
                onChange={handleSearchChange}
              />
            </div>
          </div>
          {/* Listado de profesionales */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-12 bg-gray-50 py-4 px-6 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="col-span-2">CÓDIGO</div>
              <div className="col-span-4">NOMBRE</div>
                <div className="col-span-3">CONTACTO</div>
                <div className="col-span-3 text-center">ACCIÓN</div>
            </div>
            {loading || loadingImages ? (
              <div className="flex justify-center items-center py-12">
              <Loader />
            </div>
            ) : profesionales.length === 0 ? (
              <div className="py-12 px-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                  <Briefcase className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">No hay profesionales registrados</h3>
                <p className="text-sm text-gray-500">Comienza agregando un profesional</p>
              </div>
            ) : (
              profesionales
                .sort((a, b) => a.id - b.id)
                .map((profesional) => (
                  <div
                    key={profesional.id}
                    className="grid grid-cols-12 items-center py-4 px-6 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <div className="col-span-12 sm:col-span-2">
                      <span className="text-sm font-medium text-gray-900">{profesional.id}</span>
                    </div>
                    <div className="col-span-12 sm:col-span-4 flex items-center gap-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <img
                          src={imageUrls[profesional.id] || NoImage.src}
                          onError={(e) => {
                            e.currentTarget.src = NoImage.src
                          }}
                          alt={profesional.nombre}
                          className="w-full h-full object-cover"
                          key={`img-${profesional.id}-${changed}`} // Use changed state as part of key to force re-render
                        />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {profesional.nombre} {profesional.apellido}
                        </h3>
                      </div>
                    </div>
                    <div className="col-span-12 sm:col-span-4">
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {profesional.email}
                        </span>
                        {profesional.telefono && (
                          <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                            <Phone className="w-4 h-4 text-gray-400" />
                            +54 {profesional.telefono}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="col-span-12 sm:col-span-2 flex justify-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedProfesional(profesional)
                          setEditar(true)
                          setNueva(false)
                        }}
                        className="text-indigo-600 hover:text-indigo-900 p-1 hover:bg-indigo-50 rounded"
                        title="Editar profesional"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedProfesional(profesional)
                          setEditarCursos(true);
                        }}
                        className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded"
                        title="Editar Talleres"
                      >
                        <BookOpen className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setProfesionalAEliminar([profesional])}
                        className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                        title="Eliminar profesional"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
        {/* formulario */}
      </div>
      {selectedProfesional && editar && (
        <div className="z-50">
          <ProfesionalAdminForm
            profesional={selectedProfesional}
            setEditar={setEditar}
            setChanged={setChanged}
            nueva={false}
            downloadUrl={selectedProfesional.id ? imageUrls[selectedProfesional.id] : ""}
            
          />
        </div>
      )}
      {nueva && editar && (
        <div className="z-50">
          <ProfesionalAdminForm
            profesional={null}
            setEditar={setEditar}
            setChanged={setChanged}
            nueva={true}
            downloadUrl=""
            setProfesionalesListaCompleta = {setProfesionalesListaCompleta}
          />
        </div>
      )}
      {/* para agregar talleres a profesional */}
      {editarCursos && selectedProfesional && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <CursoSelector 
            persona ={{
                id: Number(selectedProfesional.id),
                nombre: `${selectedProfesional.nombre} ${selectedProfesional.apellido}`,
                email: selectedProfesional.email,
                cursos: []
            }}
            esAlumno={false}
            setEditar={setEditarCursos}
        />
        </div>
      )}
    </main>
  )
  // #endregion
}
export default withAuth(Profesionales)

