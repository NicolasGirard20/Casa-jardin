"use client"
import type React from "react"
import { useState, useEffect } from "react"
import Image from "next/image"
import Navigate from "../../../components/profesional/navigate/page"
import { useRouter } from "next/navigation"
import { autorizarUser, fetchUserData } from "@/helpers/cookies"
import { getImagesUser } from "@/services/repoImage"
import { mapearImagenes } from "@/helpers/repoImages"
import { Apple } from "lucide-react"
import Loader from "@/components/Loaders/loader/loader"
import NoImage from "../../../../public/Images/default-no-image.png" // Imagen por defecto si no hay imagen del profesional
import ProfesionalForm from "@/components/formularios/profesionalForm"

type Profesional = {
  id: number
  nombre: string
  apellido: string
  telefono: string
  email: string
  rolId: number
  especialidad?: string
  imagen?: string
}

const Cuenta: React.FC = () => {
  // States
  const [user, setUser] = useState<Profesional | null>(null)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [editar, setEditar] = useState<boolean>(false)
  const [changed, setChanged] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [imageError, setImageError] = useState<boolean>(false)

  const router = useRouter()

  //autorizar usuario
  useEffect(() => {
    autorizarUser(router)
  }, [router])

  //fetch datos del usuario
  useEffect(() => {
    if (!user) {
      fetchUserConImagen()
    }
  }, [user])

  //actualizar usuario si hay cambios en el form
  useEffect(() => {
    if (changed) {
      fetchUserConImagen()
      setChanged(false)
    }
  }, [changed])

  const fetchImage = async (u: any) => {
    if (u?.imagen) {
      try {
        const res = await getImagesUser()
        //buscar imagen
        const img = mapearImagenes([u], {
          images: res.images,
          downloadurls: res.downloadurls,
        })
        if (img && img.length > 0 && img[0].imageUrl) {
          setDownloadUrl(img[0].imageUrl)
          return img[0].imageUrl
        }
      } catch (error) {
        console.error("Error fetching image:", error)
        setImageError(true)
      }
    }
    return null
  }

  // Fetch de datos e imagen del usuario
  const fetchUserConImagen = async () => {
    setLoading(true)
    try {
      const userData = await fetchUserData()
      setUser(userData)

      if (userData?.imagen) {
        const imageUrl = await fetchImage(userData)
        setDownloadUrl(imageUrl)
        setImageError(false)
      } else {
        // Si no hay imagen, resetear el estado
        setDownloadUrl(null)
        setImageError(false)
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navigate />
      <div className="w-full py-6">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-center text-black">Datos del Profesional</h1>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <Loader />
          <p className="text-black font-medium">Cargando datos del profesional...</p>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 flex items-center justify-between">
              <div className="flex items-center">
                <Apple className="mr-2" size={24} />
                <h2 className="text-xl font-semibold">Información Personal</h2>
              </div>
              <button
                onClick={() => setEditar(true)}
                className="inline-flex items-center px-4 py-2 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-1 focus:ring-offset-green-600"
              >
                Editar Mis Datos
              </button>
            </div>

            <div className="md:flex">
              {/*foto*/}
              <div className="md:w-1/3 relative h-[300px]">
                {downloadUrl && !imageError ? (
                  <Image
                    src={downloadUrl || NoImage.src}
                    alt="Imagen de perfil"
                    fill
                    className="object-cover"
                    priority
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <Image
                    src={NoImage || "/placeholder.svg"}
                    alt="Imagen de perfil por defecto"
                    fill
                    className="object-cover"
                    priority
                  />
                )}
              </div>

              {/*datos profesional */}
              <div className="md:w-2/3">
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-500">Nombre</label>
                      <p className="text-gray-900">{user?.nombre || "No disponible"}</p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-500">Apellido</label>
                      <p className="text-gray-900">{user?.apellido || "No disponible"}</p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-gray-900">{user?.email || "No disponible"}</p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-500">Teléfono</label>
                      <p className="text-gray-900">{user?.telefono || "No disponible"}</p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-500">Especialidad</label>
                      <p className="text-gray-900">{user?.especialidad || "No especificada"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* formulario */}
      {editar && user && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <ProfesionalForm
            profesional={
              user && {
                id: user.id,
                nombre: user.nombre,
                apellido: user.apellido,
                telefono: user.telefono,
                email: user.email,
                especialidad: String(user.especialidad),
                imagen: user.imagen,
              }
            }
            setEditar={setEditar}
            setChanged={setChanged}
            downloadUrl={downloadUrl || ""}
          />
        </div>
      )}
    </main>
  )
}

export default Cuenta
