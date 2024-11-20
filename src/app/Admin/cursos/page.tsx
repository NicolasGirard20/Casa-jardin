"use client";

import React, { useEffect, useState } from "react";
import Navigate from "../../../components/Admin/navigate/page";
import But_aside from "../../../components/but_aside/page";
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

  //region useEffect
  const router = useRouter();
  useEffect(() => {
    const authorize = async () => {
      await autorizarAdmin(router);
    };
    authorize();
  }, [router]);

  useEffect(() => {
    fetchCursos(); // Llama a la función para obtener cursos
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
      console.error("Imposible obtener cursos", error); // Manejo de errores
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
      console.log("Imagen seleccionada:", fileNameWithExtension);
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
      console.log("Image uploaded successfully:", result.result);
      setImagesLoaded(false); // Establecer en falso para que se vuelvan a cargar las imágenes
    }
  };

  // Método para obtener las imagenes
  const fetchImages = async () => {
    const result = await getImages_talleresAdmin();
    console.log(result.images, "LAS IMAGENESSSSS");
    console.log(result.downloadurls, "LOS DOWNLOADURLS");
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
          console.log("Imagen URL:", curso.imageUrl);
        }
      });
    }
  };

  // Función para validar los detalles del curso
  function validateCursoDetails() {
    const {
      nombre,
      descripcion,
      fechaInicio,
      fechaFin,
      edadMinima,
      edadMaxima,
    } = cursoDetails;

    // Validar que el nombre tenga entre 2 y 50 caracteres
    if (nombre.length < 2 || nombre.length > 50) {
      return "El nombre debe tener entre 2 y 50 caracteres.";
    }

    // Validar que la descripción tenga entre 5 y 300 palabras
    const descripcionWords = descripcion.trim().split(/\s+/).length;
    if (descripcionWords < 5) {
      return "La descripción debe tener al menos 5 palabras.";
    }
    if (descripcionWords > 300) {
      return "La descripción no puede exceder las 300 palabras.";
    }

    // Validar que el nombre y la descripción no contengan caracteres no permitidos
    const regex = /^[a-zA-Z0-9À-ÿ\u00f1\u00d1\u00fc\u00dc\s.,:-]*$/;
    if (!regex.test(nombre)) {
      return "El nombre del curso solo puede contener letras, números, espacios, puntos, comas y guiones.";
    }
    if (!regex.test(descripcion)) {
      return "La descripción solo puede contener letras, números, espacios, puntos, comas y guiones.";
    }

    // Validar que la fecha de inicio sea anterior a la fecha de fin
    if (new Date(fechaInicio) >= new Date(fechaFin)) {
      return "La fecha de inicio debe ser anterior a la fecha de fin.";
    }
    // el rango de fechas no puede ser menor a 7 días
    const diffTime = Math.abs(new Date(fechaFin).getTime() - new Date(fechaInicio).getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 7) {
      return "El rango de fechas no puede ser menor a 7 días.";
    }

    // Validar rango de edades si ambos están definidos
    // Validar que la edad mínima sea un número entero positivo
    // Validar que la edad mínima sea un número entero positivo
    if (!Number.isInteger(edadMinima) && edadMinima < 0) {
      return "La edad mínima debe ser un número entero positivo.";
    }

    // Validar que la edad máxima no exceda los 110 años y sea un número entero

    // Validar rango de edades si ambos están definidos
    if (edadMinima > edadMaxima) {
      return "La edad mínima no puede ser mayor que la edad máxima.";
    } else if (edadMaxima > 110) {
      return "La edad máxima no puede ser mayor que 110 años.";
    }
    return null; // Retorna null si no hay errores
  }


  // Función para manejar el guardado de cambios en el curso
  async function handleSaveChanges() {
    const validationError = validateCursoDetails(); // Llama a la función de validación
    if (validationError) {
      setErrorMessage(validationError); // Muestra el mensaje de error si hay un error
      return;
    }

    if (selectedCursoId !== null) {
      try {
        const reponse = await updateCurso(selectedCursoId, cursoDetails); // Actualiza el curso
        if (typeof reponse === "string") {
          setErrorMessage(reponse); // Muestra el mensaje de error si no se puede actualizar
          return;
        }
        //subir la imagen al repositorio (se guarda con nombre del curso . extension) )
        if (selectedFile && cursoDetails.imagen) {
            await handleUploadAndFetchImages(selectedFile);
        }
        
        setSelectedCursoId(null); // Resetea el curso seleccionado
        fetchCursos(); // Refresca la lista de cursos
        setErrorMessage(""); // Limpiar mensaje de error si todo fue bien
      } catch (error) {
        console.error("Imposible actualizar curso", error); // Manejo de errores
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
    const validationError = validateCursoDetails(); // Valida los detalles del curso antes de crear

    if (validationError) {
      setErrorMessage(validationError); // Muestra el mensaje de error si la validación falla
      return;
    }

    try {
      const newCurso = await createCurso(cursoDetails);
      // manejo del error si no se puede crear el curso

      if (typeof newCurso === "string") {
        setErrorMessage(newCurso);
      } else {
        setCursos([...cursos, newCurso]);
        setSelectedCursoId(newCurso.id); // Cierra el formulario y resetea el curso seleccionado
        setCursoDetails({
          nombre: "",
          descripcion: "",
          fechaInicio: new Date(),
          fechaFin: new Date(),
          edadMinima: 0,
          edadMaxima: 0,
        imagen: null,
        });
        setErrorMessage(""); // Limpia el mensaje de error si todo sale bien
        setSelectedCursoId(null);
        // Subir la imagen al repositorio y actualizar las imágenes
        if (selectedFile) {
            await handleUploadAndFetchImages(selectedFile);
          } else {
            await fetchImages(); // Refresca la lista de imágenes si no hay imagen seleccionada
          }
      }
    } catch (error) {
      console.error("Imposible crear", error);
    }
  }

  //region return
  return (
    <main className="relative min-h-screen w-screen">
      <Navigate />
      <div className="relative h-[80vh]">
        <Image
          src={Background}
          className="h-[80hv]"
          alt="Background"
          layout="fill"
          objectFit="cover"
          quality={80}
          priority={true}
        />
      </div>
      <h1 className="absolute top-40 left-60 mb-5 text-3xl">Talleres</h1>

      <div
        className="top-60 border p-1 absolute left-40 h-90 max-h-90"
        style={{ background: "#D9D9D9" }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 my-4">
          {cursos.map((curso, index) => (
            <div
              key={curso.id}
              className="border p-4 mx-2 relative w-47 h-47 justify-center items-center"
            >
              <div className="relative w-30 h-20">
                <Image
                   src={curso.imageUrl || NoImage}
                  alt="Background Image"
                  objectFit="cover"
                  className="w-full h-full"
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
                  />
                </button>
                <button
                  onClick={() => setSelectedCursoId(curso.id)}
                  className="absolute top-0 right-8 text-red-600 font-bold"
                >
                  <Image src={EditIcon} alt="Editar" width={27} height={27} />
                </button>
              </div>
              <h3 className="flex bottom-0 text-black z-1">{curso.nombre}</h3>
            </div>
          ))}
        </div>
        <button onClick={() => setSelectedCursoId(-1)} className="mt-6 mx-4">
          <Image
            src={ButtonAdd}
            className="mx-3"
            alt="Image Alt Text"
            width={70}
            height={70}
          />
        </button>
      </div>

      <But_aside />

      {selectedCursoId !== null && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg relative">
            <h2 className="text-2xl font-bold mb-4">
              {selectedCursoId === -1 ? "Crear Talleres" : "Editar Talleres"}
            </h2>
            {errorMessage && (
              <div className="mb-4 text-red-600">{errorMessage}</div>
            )}
            <div className="mb-4">
              <label htmlFor="nombre" className="block">
                Nombre:
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={cursoDetails.nombre}
                onChange={handleChange}
                className="p-2 w-full border rounded"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="descripcion" className="block">
                Descripción:
              </label>
              <input
                type="text"
                id="descripcion"
                name="descripcion"
                value={cursoDetails.descripcion}
                onChange={handleChange}
                className="p-2 w-full border rounded"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="edadMinima" className="block">
                Edad mínima del taller:
              </label>
              <input
                type="number"
                id="edadMinima"
                name="edadMinima"
                value={cursoDetails.edadMinima}
                onChange={handleChange}
                className="p-2 w-full border rounded"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="edadMaxima" className="block">
                Edad máxima del taller:
              </label>
              <input
                type="number"
                id="edadMaxima"
                name="edadMaxima"
                value={cursoDetails.edadMaxima}
                onChange={handleChange}
                className="p-2 w-full border rounded"
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
                  cursoDetails.fechaInicio
                    ? cursoDetails.fechaInicio.toISOString().split("T")[0]
                    : ""
                } // Verifica que no sea null o undefined
                onChange={handleChange}
                className="p-2 w-full border rounded"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="fechaInicio" className="block">
                Fecha de finalización del taller:
              </label>
              <input
                type="date"
                id="fechaFin"
                name="fechaFin"
                value={
                  cursoDetails.fechaFin
                    ? cursoDetails.fechaFin.toISOString().split("T")[0]
                    : ""
                } // Igual que arriba
                onChange={handleChange}
                className="p-2 w-full border rounded"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="imagen" className="block">
                Imagen:
              </label>
              <input
                type="file"
                id="imagen"
                name="imagen"
                accept=".png, .jpg, .jpeg .avif"
                onChange={onFileChange}
                className="p-2 w-full border rounded"
              />
              {uploadError && <div style={{ color: "red" }}>{uploadError}</div>}
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={
                  selectedCursoId === -1 ? handleCreateCurso : handleSaveChanges
                }
                className="bg-red-700 py-2 px-5 text-white rounded hover:bg-red-800"
              >
                Guardar
              </button>
              <button
                onClick={() => setSelectedCursoId(null)}
                className="bg-gray-700 py-2 px-5 text-white rounded hover:bg-gray-800"
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
                onClick={() => setCursoAEliminar(null)}
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