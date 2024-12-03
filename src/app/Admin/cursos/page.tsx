"use client";

import React, { useEffect, useState } from "react";
import Navigate from "../../../components/Admin/navigate/page";
import Loader from "@/components/loader/loader";

import {updateCurso, getCursos, deleteCurso, createCurso,} from "../../../services/cursos";
import Image from "next/image";
import DeleteIcon from "../../../../public/Images/DeleteIcon.png";
import EditIcon from "../../../../public/Images/EditIcon.png";
import Background from "../../../../public/Images/Background.jpeg";
import ButtonAdd from "../../../../public/Images/Button.png";
//imagen default si el curso no tiene imagen
import NoImage from "../../../../public/Images/default-no-image.png";
import {getImages_talleresAdmin} from "@/services/repoImage";
import withAuth from "../../../components/Admin/adminAuth";
import { autorizarAdmin } from "@/helpers/cookies";
import { useRouter } from "next/navigation";
//para subir imagenes:
import {handleUploadCursoImage, handleDeleteCursoImage, mapearImagenes} from "@/helpers/repoImages";
import { validateCursoDetails } from "@/helpers/validaciones";
const Cursos: React.FC = () => {
  // Estado para almacenar la lista de cursos
  const [cursos, setCursos] = useState<
    {
      id: number;
      nombre: string;
      descripcion: string;
      fechaInicio: Date;
      fechaFin: Date;
      edadMinima: number;
      edadMaxima: number;
      imagen: string | null;
      imageUrl?: string;
    }[]
  >([]);
  // Estado para almacenar el ID del curso seleccionado
  const [selectedCursoId, setSelectedCursoId] = useState<number | null>(null);
  // Estado para almacenar los detalles del curso seleccionado
  const [cursoDetails, setCursoDetails] = useState<{
    nombre: string;
    descripcion: string;
    fechaInicio: Date;
    fechaFin: Date;
    edadMinima: number;
    edadMaxima: number;
    imagen: string | null;
  }>({
    nombre: "",
    descripcion: "",
    fechaInicio: new Date(),
    fechaFin: new Date(),
    edadMinima: 0,
    edadMaxima: 0,
    imagen: null,
  });
  // Estado para almacenar mensajes de error
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  //Estado para almacenar las imagenes
  const [images, setImages] = useState<any[]>([]);
  const [downloadurls, setDownloadurls] = useState<any[]>([]);
  // Efecto para obtener la lista de cursos al montar el componente
  const [cursoAEliminar, setCursoAEliminar] = useState<{
    id: number;
    nombre: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  //para subir una imagen y asignarla al curso
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  //booleano para saber si las imagenes ya se cargaron
  const [imagesLoaded, setImagesLoaded] = useState<boolean>(false);

  //boolean para saber si estan cargando los cursos
  const [loading, setLoading] = useState<boolean>(true);

  //region useEffect
  const router = useRouter();
  useEffect(() => {
    const authorize = async () => {
      await autorizarAdmin(router);
    };
    authorize();
  }, [router]);

  useEffect(() => {
    fetchCursos();
  }, []);

  useEffect(() => {
    // Llamar a fetchImages después de que los cursos se hayan cargado
    if (cursos.length > 0 && !imagesLoaded) {
      fetchImages();
    }
  }, [cursos]);

  // Efecto para actualizar los detalles del curso seleccionado cuando cambia el curso o el ID del curso
  useEffect(() => {
    if (selectedCursoId !== null && selectedCursoId !== -1) {
      const selectedCurso = cursos.find(
        (curso) => curso.id === selectedCursoId
      ); // Busca el curso seleccionado
      if (selectedCurso) {
        setCursoDetails({
          nombre: selectedCurso.nombre,
          descripcion: selectedCurso.descripcion,
          fechaInicio: selectedCurso.fechaInicio,
          fechaFin: selectedCurso.fechaFin,
          edadMinima: selectedCurso.edadMinima,
          edadMaxima: selectedCurso.edadMaxima,
          imagen: selectedCurso.imagen,
        }); // Actualiza los detalles del curso
      }
    } else if (selectedCursoId === -1) {
      // Reinicia los detalles del curso al crear un nuevo curso
      setCursoDetails({
        nombre: "",
        descripcion: "",
        fechaInicio: new Date(),
        fechaFin: new Date(),
        edadMinima: 0,
        edadMaxima: 0,
        imagen: null,
      });
    }
  }, [selectedCursoId, cursos]); // Efecto para actualizar los detalles del curso seleccionado cuando cambia el curso o el ID del curso
  useEffect(() => {
    if (errorMessage != null) {
      setInterval(() => {
        setErrorMessage("");
      }, 50000);
    }
  }, [errorMessage]);
  //endregion useEffect

  // region funciones
  // Función para obtener la lista de cursos
  async function fetchCursos() {
    try {
      let curs = await getCursos(); // Obtén la lista de cursos
      curs.sort((a, b) => a.nombre.localeCompare(b.nombre)); // Ordena los cursos por nombre
      setCursos(curs); // Actualiza el estado con la lista de cursos
    } catch (error) {
      
    } finally {
      setLoading(false); // Establece el estado de carga en falso
    }
  }

  // Función para manejar los cambios en los campos del formulario
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setCursoDetails((prevDetails) => ({
      ...prevDetails,
      [name]: name.includes("fecha") ? new Date(value) : value,
    }));
  }

  //Para manejar el cambio en el input de imagen
  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    // Agrego el nombre de la imagen a cursoDetails
    if (file) {
      const fileName = file.name;
      const lastDotIndex = fileName.lastIndexOf(".");
      const fileExtension =
        lastDotIndex !== -1 ? fileName.substring(lastDotIndex + 1) : ""; // Obtener la extensión del archivo
      const fileNameWithExtension = `${cursoDetails.nombre}.${fileExtension}`; // Concatenar nombre del curso con la extensión
      setCursoDetails({ ...cursoDetails, imagen: fileNameWithExtension });
   
    }
  };
  //para ver las imagenes agregadas sin refresh de pagina
  const handleUploadAndFetchImages = async (selectedFile: File | null) => {
    const result = await handleUploadCursoImage(
      selectedFile,
      cursoDetails.imagen || ""
    );
    if (result.error) {
      setUploadError(result.error);
    } else {
     
      setImagesLoaded(false); // Establecer en falso para que se vuelvan a cargar las imágenes
    }
  };

  // Método para obtener las imagenes
  const fetchImages = async () => {
    const result = await getImages_talleresAdmin();

    if (result.error) {
      setErrorMessage(result.error);
    } else {
      console.log(result);
      setImages(result.images);
      setDownloadurls(result.downloadurls);
  
      // Mapear las imágenes con los cursos
      const updatedCursos = mapearImagenes(cursos, {images: result.images, downloadurls: result.downloadurls});
  
      // Ordenar los cursos alfabéticamente por nombre
      updatedCursos.sort((a, b) => a.nombre.localeCompare(b.nombre));
  
      // Actualiza el estado de los cursos
      setCursos(updatedCursos);
  
      // Marcar las imágenes como cargadas
      setImagesLoaded(true);
  
      // Hacer un console.log de las imageUrl después de actualizar el estado
      updatedCursos.forEach((curso) => {
        if (curso.imageUrl) {
          console.log(`Curso: ${curso.nombre}, Image URL: ${curso.imageUrl}`);
        }
      });
    }
  };


   // Función para manejar el guardado de cambios en el curso
   async function handleSaveChanges() {
    // Elimina los espacios en blanco antes de guardar los detalles
    const trimmedCursoDetails = {
      ...cursoDetails,
      nombre: cursoDetails.nombre.trim(),
      descripcion: cursoDetails.descripcion.trim(),
    };

    const validationError = validateCursoDetails(trimmedCursoDetails);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }
   

    if (selectedCursoId !== null) {
      try {
        // Llama a la API para actualizar el curso con los detalles recortados
        const response = await updateCurso(selectedCursoId, trimmedCursoDetails);
        if (typeof response === "string") {
          setErrorMessage(response); // Muestra el mensaje de error si no se puede actualizar
          return;
        }

        // Si se sube una imagen, se maneja la subida de la imagen
        if (selectedFile && trimmedCursoDetails.imagen) {
          await handleUploadAndFetchImages(selectedFile);
        }

        // Actualizar la lista de cursos después de actualizar uno
        fetchCursos();
        setSelectedCursoId(null); // Cierra el formulario y resetea el curso seleccionado

        // Limpiar el formulario después de actualizar el curso
        setCursoDetails({
          nombre: "",
          descripcion: "",
          fechaInicio: new Date(),
          fechaFin: new Date(),
          edadMinima: 0,
          edadMaxima: 0,
          imagen: null,
        });
        setSelectedFile(null); // Limpiar archivo seleccionado
        setImagesLoaded(false); // Recargar las imágenes
        setErrorMessage(""); // Limpiar mensaje de error si todo fue bien

      } catch (error) {
        console.error("Imposible actualizar el curso", error); // Manejo de errores
      }
    }
  }

  async function handleEliminarCurso(id: number) {
    try {
      //Ventana de confirmación para eliminar el curso

      const result = await deleteCurso(id); // Ahora devuelve un objeto con success y message
      //console.log("Curso eliminado con éxito:", id);
      //Actualizar la lista de cursos despues de eliminar alguno de ellos

      if (result.success === true) {
        console.log(result.message); // "Curso eliminado con éxito"
        setErrorMessage(null); // Limpiar mensaje de error en caso de éxito
        if(cursoDetails.imagen){
            handleDeleteCursoImage(cursoDetails.imagen || ""); // Eliminar la imagen del repositorio
        }
        // Actualizar la lista de cursos, excluyendo el curso eliminado
        setCursos(cursos.filter((curso) => curso.id !== id));
        setCursoAEliminar(null); // Cerrar la ventana de confirmación
      } else {
        // Si la eliminación falló, mostrar el mensaje de error devuelto
        setErrorMessage(result.message);
      }
    } catch (error) {
      setErrorMessage(
        "Hubo un error inesperado al intentar eliminar el curso."
      ); // Manejo de errores
    }
  }
  async function handleCreateCurso() {
    // Elimina los espacios en blanco antes de guardar los detalles
    const trimmedCursoDetails = {
      ...cursoDetails,
      nombre: cursoDetails.nombre.trim(),
      descripcion: cursoDetails.descripcion.trim(),
    };

    const validationError = validateCursoDetails(trimmedCursoDetails); // Llama a la función de validación con los detalles recortados
    if (validationError) {
      setErrorMessage(validationError); // Muestra el mensaje de error si hay un error
      return;
    }

    // Validar que el nombre del curso no esté duplicado
    try {
      // Llama a la API para crear el curso con los detalles recortados
      const response = await createCurso(trimmedCursoDetails); // Asegúrate de tener esta función para crear un curso
      if (typeof response === "string") {
        setErrorMessage(response); // Muestra el mensaje de error si no se puede crear
        return;
      }

      // Si se sube una imagen, se maneja la subida de la imagen
      if (selectedFile && trimmedCursoDetails.imagen) {
        await handleUploadAndFetchImages(selectedFile);
      }

      // Actualizar la lista de cursos después de crear uno nuevo
      fetchCursos();
      setSelectedCursoId(null); // Cierra el formulario y resetea el curso seleccionado

      // Limpiar el formulario después de crear el curso
      setCursoDetails({
        nombre: "",
        descripcion: "",
        fechaInicio: new Date(),
        fechaFin: new Date(),
        edadMinima: 0,
        edadMaxima: 0,
        imagen: null,
      });
      setSelectedFile(null); // Limpiar archivo seleccionado
      setImagesLoaded(false); // Recargar las imágenes
      setErrorMessage(""); // Limpiar mensaje de error si todo fue bien

    } catch (error) {
      console.error("Imposible crear el curso", error); // Manejo de errores
    }
  }



  //region return
  return (
    <main className="relative min-h-screen w-screen" style={{ fontFamily: "Cursive" }}>
        <Navigate />
        <div className="relative h-[80vh] w-full">
            <Image
                src={Background}
                alt="Background"
                layout="fill"
                objectFit="cover"
                quality={80}
                priority={true}
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ opacity: 0.88 }}
            />
        </div>
        <h1 className="absolute top-20 left-4 sm:top-40 sm:left-40 mb-5 text-2xl sm:text-3xl bg-white rounded-lg p-2">Talleres</h1>
        <div
            className="top-40 sm:top-60 border p-1 absolute left-1/2 transform -translate-x-1/2 h-[60vh] max-h-[60vh] w-11/12 sm:w-auto overflow-y-auto"
            style={{ background: "#D9D9D9" }}
        >
            {loading ? (
                <div className="w-full h-auto flex flex-col items-center justify-center">
                    <Loader />
                    <h1>Cargando Talleres</h1>
                </div>
             ) : (
              <>
              <div className="flex justify-start mb-4">
          <button onClick={() => setSelectedCursoId(-1)} className="flex items-center mx-7 mt-6">
            <Image
              src={ButtonAdd}
              alt="Agregar Curso"
              width={70}
              height={70}
              className="mx-2"
            />
            <span className="text-black font-medium">Agregar nuevo taller</span>
          </button>
        </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 my-4">
                      {cursos.map((curso, index) => (
                          <div
                              key={curso.id}
                              className="border p-4 mx-2 relative w-full sm:w-47 h-47 flex flex-col justify-center items-center bg-white"
                          >
                              <div className="relative w-full h-20">
                                  <Image
                                      src={curso.imageUrl || NoImage}
                                      alt="Background Image"
                                      objectFit="cover"
                                      className="w-full h-full pointer-events-none"
                                      layout="fill"
                                  />
                                  <button
                                      onClick={() => setCursoAEliminar(curso)}
                                      className="absolute top-0 right-0 text-red-600 font-bold"
                                  >
                                      <Image
                                          src={DeleteIcon}
                                          alt="Eliminar"
                                          width={27}
                                          height={27}
                                          className="pointer-events-none"
                                      />
                                  </button>
                                  <button
                                      onClick={() => setSelectedCursoId(curso.id)}
                                      className="absolute top-0 right-8 text-red-600 font-bold"
                                  >
                                      <Image src={EditIcon} alt="Editar" width={27} height={27} className="pointer-events-none"/>
                                  </button>
                              </div>
                              <h3 className="flex bottom-0 text-black z-1">{curso.nombre}</h3>
                          </div>
                      ))}
                  </div>
                 
              </>
          )}
        </div>

        {selectedCursoId !== null && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-md relative max-h-full overflow-y-auto">
            <h2 className="text-xl font-semibold mb-3">
              {selectedCursoId === -1 ? "Crear Taller" : "Editar Taller"}
            </h2>
            {errorMessage && (
              <div className="mb-3 text-red-600 text-sm">{errorMessage}</div>
            )}
            <div className="mb-3">
              <label htmlFor="nombre" className="block text-sm font-medium">
                Nombre:
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                placeholder="Nombre del taller"
                maxLength={50}
                value={cursoDetails.nombre}
                onChange={handleChange}
                className="p-1 w-full border rounded text-sm"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="descripcion" className="block text-sm font-medium">
                Descripción:
              </label>
              <input
                type="text"
                id="descripcion"
                name="descripcion"
                placeholder="Descripción del taller"
                value={cursoDetails.descripcion}
                onChange={handleChange}
                className="p-1 w-full border rounded text-sm"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="edadMinima" className="block text-sm font-medium">
                Edad mínima:
              </label>
              <input
                type="text"
                id="edadMinima"
                name="edadMinima"
                pattern="[0-9]+"
                placeholder="Ingrese la edad mínima"
                maxLength={2} // Limita a dos dígitos (si es necesario)
                value={cursoDetails.edadMinima}
                onChange={(e) => {
                  const regex = /^[0-9]*$/; // Permite solo números
                  if (regex.test(e.target.value)) {
                    handleChange(e); // Actualiza solo si es un número válido
                  }
                }}
                className="p-2 w-full border rounded text-sm"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="edadMaxima" className="block text-sm font-medium">
                Edad máxima:
              </label>
              <input
                type="text"
                id="edadMaxima"
                name="edadMaxima"
                placeholder="Ingrese la edad máxima"
                maxLength={2} // Limita la entrada a dos dígitos
                value={cursoDetails.edadMaxima}
                onChange={(e) => {
                  const regex = /^[0-9]*$/; // Solo permite números
                  if (regex.test(e.target.value)) {
                    handleChange(e); // Actualiza solo si el valor es válido
                  }
                }}
                className="p-1 w-full border rounded text-sm"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="fechaInicio" className="block">
                Fecha de inicio del taller:
              </label>
              <input
                type="date"
                id="fechaInicio"
                name="fechaInicio"
                value={
                  cursoDetails.fechaInicio && cursoDetails.fechaInicio instanceof Date && !isNaN(cursoDetails.fechaInicio.getTime())
                    ? cursoDetails.fechaInicio.toISOString().split('T')[0]
                    : ""
                }
                onChange={handleChange}
                className="p-2 w-full border rounded"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="fechaFin" className="block">
                Fecha de fin del taller:
              </label>
              <input
                type="date"
                id="fechaFin"
                name="fechaFin"
                value={
                  cursoDetails.fechaFin && cursoDetails.fechaFin instanceof Date && !isNaN(cursoDetails.fechaFin.getTime())
                    ? cursoDetails.fechaFin.toISOString().split('T')[0]
                    : ""
                }
                onChange={handleChange}
                className="p-2 w-full border rounded"
              />
            </div>


            <div className="mb-3">
              <label htmlFor="imagen" className="block text-sm font-medium">
                Imagen:
              </label>
              <input
                type="file"
                id="imagen"
                name="imagen"
                accept=".png, .jpg, .jpeg, .avif"
                onChange={onFileChange}
                className="p-1 w-full border rounded text-sm"
              />
              {uploadError && (
                <div className="text-red-600 text-xs">{uploadError}</div>
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={
                  selectedCursoId === -1 ? handleCreateCurso : handleSaveChanges
                }
                className="bg-red-600 py-1 px-3 text-white rounded text-sm hover:bg-red-700"
              >
                Guardar
              </button>
              <button
                onClick={() => setSelectedCursoId(null)}
                className="bg-gray-600 py-1 px-3 text-white rounded text-sm hover:bg-gray-700"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
        {cursoAEliminar && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg relative">
                    {errorMessage && <div style={{ color: "red" }}>{errorMessage}</div>}

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
                            className="bg-red-700 py-2 px-5 text-white rounded hover:bg-red-800"
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
    </main>
);
};
export default withAuth(Cursos);