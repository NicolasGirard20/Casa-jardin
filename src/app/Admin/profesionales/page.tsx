"use client";
// #region Imports
import React, { useEffect, useRef, useState } from "react";
import Navigate from "../../../components/Admin/navigate/page";
import But_aside from "../../../components/but_aside/page";
import { getProfesionales, deleteProfesional, createProfesional, updateProfesional, Profesional, getProfesionalById } from "../../../services/profesional";
import Image from "next/image";
import DeleteIcon from "../../../../public/Images/DeleteIcon.png";
import EditIcon from "../../../../public/Images/EditIcon.png";
import Background from "../../../../public/Images/Background.jpeg"
import ButtonAdd from "../../../../public/Images/Button.png";
//imagen default si el curso no tiene imagen
import NoImage from "../../../../public/Images/default-no-image.png";
import { getImagesUser } from "@/services/repoImage";

import { addDireccion, getDireccionById, getDireccionCompleta, updateDireccionById } from "@/services/ubicacion/direccion";
import { addProvincias, getProvinciasById, getProvinciasByName, updateProvinciaById } from "@/services/ubicacion/provincia";
import { addLocalidad, getLocalidadById, getLocalidadByName, Localidad, updateLocalidad } from "@/services/ubicacion/localidad";
import Talleres from "@/components/talleres/page";
import { createProfesional_Curso, getCursosByIdProfesional } from "@/services/profesional_curso";
import { Curso, getCursoById } from "@/services/cursos";
import { addPais, getPaisById } from "@/services/ubicacion/pais";
import withAuth from "../../../components/Admin/adminAuth";

//para subir imagenes:
import { handleUploadProfesionalImage, handleDeleteProfesionalImage, } from "@/helpers/repoImages";
import { mapearImagenes } from "@/helpers/repoImages";
// #endregion

const Profesionales = () => {
    // #region UseStates
    const [profesionales, setProfesionales] = useState<any[]>([]);
    const [profesionalesBuscados, setProfesionalesBuscados] = useState<any[]>([])
    const [profesionalAbuscar, setProfesionalAbuscar] = useState<string>("")
    const [selectedProfesional, setSelectedProfesional] = useState<any>(null);
    const [profesionalesListaCompleta, setProfesionalesListaCompleta] = useState<any[]>([]);
    const [habilitarProfesionalesBuscados, setHabilitarProfesionalesBuscados] = useState<boolean>(true);

    const [obProfesional, setObProfesional] = useState<any>(null);

    const [profesionalDetails, setProfesionalDetails] = useState<any>({});

    // Estado para almacenar mensajes de error
    const [errorMessage, setErrorMessage] = useState<string>("");

    //Estado para almacenar las imagenes
    const [images, setImages] = useState<any[]>([]);

    //useState para almacenar la dirección
    const [nacionalidadName, setNacionalidadName] = useState<string>();
    // Estado para almacenar el ID de la provincia, inicialmente nulo
    const [provinciaName, setProvinciaName] = useState<string>();

    // Estado para almacenar el ID de la localidad, inicialmente nulo
    const [localidadName, setLocalidadName] = useState<string>();

    // Estado para almacenar la calle, inicialmente nulo
    const [calle, setcalle] = useState<string | null>(null);

    // Estado para almacenar el número de la dirección, inicialmente nulo
    const [numero, setNumero] = useState<number | null>(null);

    // Estado para almacenar los cursos elegidos, inicialmente un array vacío
    const [cursosElegido, setCursosElegido] = useState<any[]>([]);

    // Referencia para el contenedor de desplazamiento
    const scrollRef = useRef<HTMLDivElement>(null);

    //habilitar sección de cambio de contraseña
    const [habilitarCambioContraseña, setHabilitarCambioContraseña] = useState<boolean>(false);
    //estado para responder a la confirmación de cambio de contraseña
    const [correcto, setCorrecto] = useState(false);

    //para subir una imagen y asignarla al curso
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    //booleano para saber si las imagenes ya se cargaron
    const [imagesLoaded, setImagesLoaded] = useState<boolean>(false);
    const [imageUrls, setImageUrls] = useState<any>({});
    // #endregion

    // #region UseEffects
    //useEffect para obtener los profesionales
    useEffect(() => {
        if (profesionales.length === 0) {
            fetchProfesionales();
            //getCursosElegidos()
            //fetchImages();
            handleCancel_init();
        }

    }, []);

    useEffect(() => {
        // Llamar a fetchImages después de que los cursos se hayan cargado
        if (profesionales.length > 0 && !imagesLoaded) {
            fetchImages();
        }
    }, [profesionales]);

    useEffect(() => {
        if (errorMessage !== "") {
            setInterval(() => {
                setErrorMessage("")
            }, 5000);
        }
    }, [errorMessage])
    useEffect(() => {
        if (obProfesional && obProfesional.direccionId) {
            getUbicacion(obProfesional);
        } else if (obProfesional && obProfesional.direccionId === null) {
            setNacionalidadName("");
            setProvinciaName("");
            setLocalidadName("");
            setcalle("");
            setNumero(0);
            setCursosElegido([]);
        }
    }, [obProfesional]);
    useEffect(() => {
        if ((errorMessage.length > 0) && scrollRef.current) {
            scrollRef.current.scrollTop = 0;
        }
    }, [errorMessage]);

    useEffect(() => {
        if (selectedProfesional !== null && selectedProfesional !== -1) {
            setProfesionalDetails({
                id: selectedProfesional.id,
                nombre: selectedProfesional.nombre || '',
                apellido: selectedProfesional.apellido || '',
                email: selectedProfesional.email || '',
                password: '',
                telefono: selectedProfesional.telefono ? selectedProfesional.telefono : '',
                especialidad: selectedProfesional.especialidad || '',
                direccionId: selectedProfesional.direccionId || '',
            });
        } else if (selectedProfesional === -1) {
            setProfesionalDetails({
                nombre: '',
                apellido: '',
                email: '',
                password: '',
                telefono: '',
                especialidad: '',
            });
        }
    }, [selectedProfesional, profesionales]);
    // #endregion
    async function fetchProfesionales() {
        try {
            const data = await getProfesionales();
            /*             data.map(async (profesional) => {
                            const cursos = await getCursosByIdProfesional(profesional.id);
                            setCursosElegido(prevCursosElegido => [...prevCursosElegido, { id: profesional.id, cursos: cursos }]);
                            console.log("Fetching cursos", cursos);
                        }); */
            //console.log(data);
            setProfesionales(data);
            setProfesionalesListaCompleta(data);
        } catch (error) {
            setErrorMessage("Error al obtener los profesionales");
        }
    }
    async function getUbicacion(userUpdate: any) {
        // Obtener la dirección del usuario por su ID
        //console.log("SI DIRECCIONID ES FALSE:", Number(userUpdate?.direccionId));
        const direccion = await getDireccionCompleta(userUpdate?.direccionId);

        //console.log("NACIONALIDAD", nacionalidad);
        // Actualizar los estados con los datos obtenidos
        setLocalidadName(String(direccion?.localidad?.nombre));
        setProvinciaName(String(direccion?.localidad?.provincia?.nombre));
        setNacionalidadName(String(direccion?.localidad?.provincia?.nacionalidad?.nombre));
        setNumero(Number(direccion?.numero));
        setcalle(String(direccion?.calle));
        return direccion
    }


    //region solo considera repetidos
    async function createUbicacion() {
        // Obtener la localidad asociada a la dirección

        const nacionalidad = await addPais({ nombre: String(nacionalidadName) });
        const prov = await addProvincias({ nombre: String(provinciaName), nacionalidadId: Number(nacionalidad?.id) });

        const localidad = await addLocalidad({ nombre: String(localidadName), provinciaId: Number(prov?.id) });

        const direccion = await addDireccion({ calle: String(calle), numero: Number(numero), localidadId: Number(localidad?.id) });

        return direccion;
    }
    // #region Métodos

    function setVariablesState() {
        setNacionalidadName("");
        setProvinciaName("");
        setLocalidadName("");
        setcalle("");
        setNumero(0);
        setObProfesional(null);
        setSelectedProfesional(null);
        fetchProfesionales();
        setErrorMessage("");
    }
    // Función para manejar los cambios en los campos del formulario
    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setProfesionalDetails((prevDetails: any) => ({
            ...prevDetails,
            [name]: /* name === 'password' ? (() => hashPassword(value)) :  */value
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
            // Concatenar id, nombre y apellido del profesional con la extensión // Concatenar nombre del profesional con la extensión

            const fileNameWithExtension = `${profesionalDetails.id}_${profesionalDetails.nombre}_${profesionalDetails.apellido}.${fileExtension}`;
            setProfesionalDetails({ ...profesionalDetails, imagen: fileNameWithExtension });

        }
    };

    // Método para obtener las imagenes
    const fetchImages = async () => {
        const result = await getImagesUser();

        if (result.error) {
            setErrorMessage(result.error);
        } else {
            console.log(result);
            setImages(result.images);

            // Mapear las imágenes y crear un diccionario de imageUrls
            const updatedProfesionales = mapearImagenes(profesionales, {
                images: result.images,
                downloadurls: result.downloadurls,
            });
            const newImageUrls: any = {};
            updatedProfesionales.forEach((profesional) => {
                if (profesional.imageUrl) {
                    newImageUrls[profesional.id] = profesional.imageUrl;
                }
            });

            // Actualiza el estado con el diccionario de imageUrls y los profesionales actualizados
            setImageUrls(newImageUrls);
            setProfesionales(updatedProfesionales);

            // Marcar las imágenes como cargadas
            setImagesLoaded(true);

            // Hacer un console.log de las imageUrl después de actualizar el estado
            updatedProfesionales.forEach((profesional) => {
                if (profesional.imageUrl) {
                    console.log(profesional.imageUrl);
                }
            });
        }
    };
    //region check validation!!
    function validateProfesionalDetails() {
        const { nombre, apellido, email, especialidad, password, telefono } = profesionalDetails;
        const nameRegex = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\u00fc\u00dc\s]*$/; // caracteres permitidos
        if (!nameRegex.test(nombre)) {
            return "El nombre solo debe contener letras y espacios.";
        }
        if (!nameRegex.test(apellido)) {
            return "El apellido solo debe contener letras y espacios.";
        }
        if (!nameRegex.test(especialidad)) {
            return "La especialidad solo debe contener letras y espacios.";
        }

        //validar que el nombre sea de al menos 2 caracteres
        if (nombre.length < 2 || nombre.length > 35) {
            return "El nombre debe tener al menos 2 caracteres";
        }
        //validar que el apellido sea de al menos 2 caracteres
        if (apellido.length < 2 || apellido.length > 35) {
            return "El apellido debe tener al menos 2 caracteres";
        }

        if (password.length > 0) {
            const passwordRegex = /^(?=.*[A-Z])[\wÀ-ÿ\d@$!%*?&]{8,}$/
                ;
            if (!passwordRegex.test(password)) return "La contraseña debe tener al menos una letra mayúscula y 8 caracteres";
        }
        //  const phoneRegex = /^\+54\d{9}$/; ---> para guardarlo en la base de datos

        //validar que el nuemero de telefono sea de solo numeros
        if (isNaN(Number(telefono))) {
            return "El teléfono debe contener solo números";
        }
        //validar que el telefono no sea menor 9 caracteres
        if (telefono.length < 9) {
            return "El número de telefono con cumple con el formato correcto";
        }
        //validar que el email sea valido 
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return "El email no es válido";
        }
        // validar que la especialidad no sea menor a 2 caracteres
        if (especialidad.length < 2 || especialidad.length > 35) {
            return "La especialidad debe tener al menos 2 caracteres";
        }


        // Validar que el número sea un número y mayor que 0
        if (isNaN(Number(numero)) || Number(numero) <= 0) {
            return "El número de la dirección debe ser un número mayor que 0";
        }

        // Validar la dirección
        if (!calle?.trim() || calle.length < 2 || calle.length > 20) {
            return "La dirección debe tener entre 2 y 20 caracteres y no puede estar vacía.";
        }



        // Validar la localidad
        if (!localidadName?.trim() || localidadName.length < 2 || localidadName.length > 35) {
            return "La localidad debe tener entre 2 y 35 caracteres.";
        }

        // Validar la provincia
        if (!provinciaName?.trim() || provinciaName.length < 2 || provinciaName.length > 35) {
            return "La provincia debe tener entre 2 y 35 caracteres.";
        }

        // Validar la nacionalidad
        if (!nacionalidadName?.trim() || nacionalidadName.length < 2 || nacionalidadName.length > 35) {
            return "La nacionalidad debe tener entre 2 y 35 caracteres.";
        }
        return null; // Si todo es válido


    }

    //para ver las imagenes agregadas sin refresh de pagina
    const handleUploadAndFetchImages = async (selectedFile: File | null) => {
        const result = await handleUploadProfesionalImage(
            selectedFile,
            profesionalDetails.imagen || ""
        );
        if (result.error) {
            setUploadError(result.error);
        } else {

            setImagesLoaded(false); // Establecer en falso para que se vuelvan a cargar las imágenes
        }
    };

    async function handleSaveChanges() {

        const validationError = validateProfesionalDetails();


        if (validationError) {
            setErrorMessage(validationError);
            return;
        }
        if (!obProfesional.direccionId) {
            const dir = await createUbicacion();
            const newProfesional = await updateProfesional(obProfesional?.id || 0, {
                nombre: profesionalDetails.nombre, apellido: profesionalDetails.apellido,
                especialidad: String(profesionalDetails.especialidad), email: String(profesionalDetails.email),
                telefono: (profesionalDetails.telefono), password: String(profesionalDetails.password),
                direccionId: Number(dir?.id)
            });
            if (typeof newProfesional === "string") return setErrorMessage(newProfesional);

            for (const curso of cursosElegido) {                                  //recorre los cursos elegidos y los guarda en la tabla intermedia
                await createProfesional_Curso({ cursoId: curso.id, profesionalId: newProfesional.id });
                //if (typeof prof_cur === "string") return setErrorMessage(prof_cur);
                //console.log(prof_cur)
            }
            setVariablesState();
            return;
        }
        const direcciProf = await getUbicacion(obProfesional);
        try {
            const newDireccion = await updateDireccionById(Number(direcciProf?.id), {
                calle: String(calle),
                numero: Number(numero),
                localidadId: Number(direcciProf?.localidad.id)
            });

            const newLocalidad = await updateLocalidad(Number(direcciProf?.localidad?.id), {
                nombre: String(localidadName),
                provinciaId: Number(direcciProf?.localidad.provincia.id)
            });

            await updateProvinciaById(Number(direcciProf?.localidad.provincia?.id), {
                nombre: String(provinciaName),
                nacionalidadId: Number(direcciProf?.localidad.provincia.nacionalidad.id)
            });


            const newProfesional = await updateProfesional(obProfesional?.id || 0, {
                nombre: profesionalDetails.nombre, apellido: profesionalDetails.apellido,
                especialidad: String(profesionalDetails.especialidad), email: String(profesionalDetails.email),
                telefono: String(profesionalDetails.telefono), password: String(profesionalDetails.password),
                direccionId: Number(direcciProf?.id), imagen: profesionalDetails.imagen
            });
            // si el resultado es un string, entonces es un mensaje de error
            if (typeof newProfesional === "string") return setErrorMessage(newProfesional);

            if (selectedFile) {
                await handleUploadAndFetchImages(selectedFile);
            }
            for (const curso of cursosElegido) {                                  //recorre los cursos elegidos y los guarda en la tabla intermedia
                await createProfesional_Curso({ cursoId: curso.id, profesionalId: newProfesional.id });
                //if (typeof prof_cur === "string") return setErrorMessage(prof_cur);
                //console.log(prof_cur)
            }
            setVariablesState();
        } catch (error) {
            console.error("Error al actualizar el profesional", error);
        }
    }

    async function handleEliminarProfesional(profesional: any) {
        try {
            //borrar profesional del repo
            await deleteProfesional(profesional.id);
            //borarr imagen del repo
            if (profesional.imagen) await handleDeleteProfesionalImage(profesional.imagen);
            fetchProfesionales();
        } catch (error) {
            console.error("Error al eliminar el profesional", error);
        }
    }

    async function handleCreateProfesional() {
        const validationError = validateProfesionalDetails();
        const direccion = await createUbicacion();
        console.log("newDireccion", direccion);
        if (validationError) {
            setErrorMessage(validationError);
            return;
        }
        try {

            //acualizo los datos de la direccion del alumno, el hash de la contra se hace en el servicio
            const newProfesional = await createProfesional({
                nombre: profesionalDetails.nombre, apellido: profesionalDetails.apellido,
                especialidad: String(profesionalDetails.especialidad), email: String(profesionalDetails.email),
                telefono: String(profesionalDetails.telefono), password: String(profesionalDetails.password),
                direccionId: Number(direccion?.id), imagen: profesionalDetails.imagen
            });
            if (typeof newProfesional === "string") return setErrorMessage(newProfesional);

            // Subir la imagen al repositorio y actualizar las imágenes
            if (selectedFile) {
                await handleUploadAndFetchImages(selectedFile);
            } else {
                await fetchImages(); // Refresca la lista de imágenes si no hay imagen seleccionada
            }

            for (const curso of cursosElegido) {                                  //recorre los cursos elegidos y los guarda en la tabla intermedia
                await createProfesional_Curso({ cursoId: curso.id, profesionalId: newProfesional.id });
                //if (typeof prof_cur === "string") return setErrorMessage(prof_cur);
                //console.log(prof_cur)
            }
            console.log("newProfesional", newProfesional)
            console.log("ProfesionalDetails", profesionalDetails)
            console.log(cursosElegido)
            setProfesionales([...profesionales, newProfesional]);
            setVariablesState();


        } catch (error) {
            setErrorMessage("Error al crear el profesional:");
        }
    }
    async function handleCancel_init() {
        setNacionalidadName("");
        setProvinciaName("");
        setLocalidadName("");
        setcalle("");
        setCursosElegido([]);
        setNumero(0);
        setObProfesional(null);
    }
    function getCursosElegidos(profesionalId: number) {
        const cursos = cursosElegido.find((curso) => curso.id === profesionalId);
        // console.log("Cursos", cursos);
        return cursos?.cursos;

    }
    // Function to handle search input change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setHabilitarProfesionalesBuscados(true);
        const searchTerm = e.target.value.toLowerCase();
        let filteredProf = profesionalesListaCompleta.filter(prof =>
            prof.nombre.toLowerCase().includes(searchTerm) ||
            prof.apellido.toLowerCase().includes(searchTerm)/*  ||
            alumno.email.toLowerCase().includes(searchTerm) */
        );

        setProfesionalesBuscados([]);
        if (e.target.value.length > 0) setProfesionalesBuscados(filteredProf);
        setProfesionalAbuscar(e.target.value);
    };
    // #endregion


    // #region Return
    return (
        <main className="relative min-h-screen w-screen" >
            <Navigate />
            <div className="fixed inset-0 z-[-1]">
                <Image src={Background} alt="Background" layout="fill" objectFit="cover" quality={80} priority={true} />
            </div>

            <h1 className="absolute top-40 left-60 mb-5 text-3xl" onClick={() => console.log(cursosElegido)} >Profesionales</h1>
            <div className="absolute top-40 right-20 mb-5">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Buscar..."
                        className="p-2 border rounded"
                        value={profesionalAbuscar}
                        onChange={handleSearchChange}
                    />
                    <div
                        onClick={() => { profesionalesBuscados.length > 0 && setProfesionales(profesionalesBuscados) }}
                        className="absolute cursor-pointer p-3 bg-slate-500 inset-y-0 right-0 flex items-center pr-3">
                        <Image src="/Images/SearchIcon.png" alt="Buscar" width={20} height={20} />
                    </div>
                </div>
                <button onClick={() => setProfesionales(profesionalesListaCompleta)}>Cargar Todos</button>
                {profesionalesBuscados.length > 0 && habilitarProfesionalesBuscados && <div className="absolute top-10 right-0 mt-2 w-full max-w-md bg-white border rounded shadow-lg">
                    {profesionalesBuscados.map((profesional, index) => (
                        <div key={index} onClick={() => { setProfesionalAbuscar(profesional.nombre + " " + profesional.apellido); setHabilitarProfesionalesBuscados(false) }} className="p-2 border-b hover:bg-gray-100 cursor-pointer">
                            <p className="text-black">{profesional.nombre} {profesional.apellido}</p>
                        </div>
                    ))}
                </div>}
            </div>
            <div className="top-60 border p-1 absolute left-40 h-90 max-h-90 w-1/2 bg-gray-400 bg-opacity-50" style={{ height: '50vh', overflow: "auto" }}>
                <div className="flex flex-col space-y-4 my-4 w-full px-4">
                    {profesionales.map((profesional, index) => (
                        <div key={index} className="border p-4 mx-2 relative bg-white w-47 h-47 justify-center items-center" >
                            <div className="relative w-full h-40"> {/* Set a fixed height for the container */}
                                <Image
                                    src={imageUrls[profesional.id] || NoImage}
                                    alt={`${profesional.nombre} ${profesional.apellido} - ${profesional.imagenUrl}}`}
                                    objectFit="cover"
                                    className="w-full h-full" /* Ensure the image fills the container */
                                    layout="fill"
                                />
                                <button onClick={() => handleEliminarProfesional(profesional)} className="absolute top-0 right-0 text-red-600 font-bold">
                                    <Image src={DeleteIcon} alt="Eliminar" width={27} height={27} />
                                </button>

                                <button onClick={() => { setSelectedProfesional(profesional); setObProfesional(profesional); console.log(profesional) }} className="absolute top-0 right-8 text-red-600 font-bold">
                                    <Image src={EditIcon} alt="Editar" width={27} height={27} />
                                </button>
                            </div>
                            <h3 className="flex  bottom-0 text-black z-1">{profesional.nombre} {profesional.apellido}</h3>
                            <div className="text-sm text-gray-600">
                                <p>Email: {profesional.email}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <button onClick={() => { setSelectedProfesional(-1); setObProfesional(null) }} className="mt-6 mx-4">
                    <Image src={ButtonAdd}
                        className="mx-3"
                        alt="Image Alt Text"
                        width={70}
                        height={70} />
                </button>
            </div>
            <div className="fixed bottom-0 py-5 bg-white w-full" style={{ opacity: 0.66 }}>
                <But_aside />
            </div>
            {selectedProfesional !== null && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div ref={scrollRef} className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg relative" style={{ height: '70vh', overflow: "auto" }}>
                        <h2 className="text-2xl font-bold mb-4">
                            {selectedProfesional === -1 ? "Nuevo Profesional" : "Editar Profesional"}
                        </h2>
                        {errorMessage && (
                            <div className="mb-4 text-red-600">
                                {errorMessage} {/* Muestra el mensaje de error */}
                            </div>
                        )}
                        <div className="mb-4">
                            <label htmlFor="nombre" className="block">Nombre:</label>
                            <input
                                type="text"
                                id="nombre"
                                name="nombre"
                                pattern="\d{35}" // Este patrón asegura que solo se acepten 25 caracteres
                                maxLength={35}  // Limitar a 25 caracteres
                                value={profesionalDetails.nombre}
                                onChange={handleChange}
                                className="p-2 w-full border rounded"
                            />
                            <label htmlFor="apellido" className="block">Apellido:</label>
                            <input
                                type="text"
                                id="apellido"
                                name="apellido"
                                pattern="\d{35}" // Este patrón asegura que solo se acepten 25 caracteres
                                maxLength={35}  // Limitar a 25 caracteres
                                value={profesionalDetails.apellido}
                                onChange={handleChange}
                                className="p-2 w-full border rounded"
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="email" className="block">Email:</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                pattern="\d{35}" // Este patrón asegura que solo se acepten 25 caracteres
                                maxLength={35}  // Limitar a 25 caracteres
                                value={profesionalDetails.email}
                                onChange={handleChange}
                                className="p-2 w-full border rounded"
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="especialidad" className="block">Especialidad:</label>
                            <input
                                type="text"
                                id="especialidad"
                                name="especialidad"
                                pattern="\d{35}" // Este patrón asegura que solo se acepten 25 caracteres
                                maxLength={35}  // Limitar a 25 caracteres
                                value={profesionalDetails.especialidad}
                                onChange={handleChange}
                                className="p-2 w-full border rounded"
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="telefono" className="block">Teléfono:</label>
                            <div className="flex">
                                <h3 className="p-2">+54</h3>
                                <input
                                    type="tel"
                                    id="telefono"
                                    name="telefono"
                                    placeholder="Ej: 11-23456789"
                                    value={profesionalDetails.telefono}
                                    onChange={handleChange}
                                    className="p-2 w-full border rounded"
                                    pattern="\d{11}" // Este patrón asegura que solo se acepten 9 dígitos
                                    maxLength={11}  // Limitar a 9 dígitos después del +54
                                    required
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="password" className="block">Contraseña:</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                placeholder={(selectedProfesional === -1 || selectedProfesional === -2) ? "" : "Si desea cambiar la contraseña, ingresela aquí"}
                                value={profesionalDetails.password}
                                onChange={handleChange}
                                className="p-2 w-full border rounded"
                            />
                        </div>
                        {((!nacionalidadName && !provinciaName && !localidadName && !calle && !numero && selectedProfesional !== -1) && obProfesional.direccionID) && <p className=" text-red-600">Cargando su ubicación...</p>}
                        {
                            <>
                                <div className="mb-4">
                                    <label htmlFor="pais" className="block">País:</label>
                                    <input
                                        type="text"
                                        id="pais"
                                        name="pais"
                                        value={String(nacionalidadName)}
                                        onChange={(e) => setNacionalidadName(e.target.value)}
                                        pattern="\d{35}" // Este patrón asegura que solo se acepten 25 caracteres
                                        maxLength={35}  // Limitar a 25 caracteres
                                        className="p-2 w-full border rounded"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="provincia" className="block">Provincia:</label>
                                    <input
                                        type="text"
                                        id="provincia"
                                        name="provincia"
                                        pattern="\d{35}" // Este patrón asegura que solo se acepten 25 caracteres
                                        maxLength={35}  // Limitar a 25 caracteres
                                        value={String(provinciaName)}
                                        onChange={(e) => setProvinciaName(e.target.value)}
                                        className="p-2 w-full border rounded"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="localidad" className="block">Localidad:</label>
                                    <input
                                        type="text"
                                        id="localidad"
                                        name="localidad"
                                        pattern="\d{35}" // Este patrón asegura que solo se acepten 25 caracteres
                                        maxLength={35}  // Limitar a 25 caracteress
                                        value={String(localidadName)}
                                        onChange={(e) => setLocalidadName(e.target.value)}
                                        className="p-2 w-full border rounded"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="calle" className="block">Calle:</label>
                                    <input
                                        type="text"
                                        id="calle"
                                        name="calle"
                                        pattern="\d{35}" // Este patrón asegura que solo se acepten 25 caracteres
                                        maxLength={35}  // Limitar a 25 caracteres
                                        value={String(calle)}
                                        onChange={(e) => setcalle(e.target.value)}
                                        className="p-2 w-full border rounded"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="numero" className="block">Número:</label>
                                    <input
                                        type="number"
                                        id="numero"
                                        name="numero"
                                        value={Number(numero)}
                                        onChange={(e) => setNumero(Number(e.target.value))}
                                        className="p-2 w-full border rounded"
                                    />
                                </div>
                            </>
                        }
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
                        <div>
                            <Talleres crearEstado={selectedProfesional} user={obProfesional} cursosElegido={cursosElegido} setCursosElegido={setCursosElegido} />
                        </div>

                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={((selectedProfesional === -1 ? handleCreateProfesional : handleSaveChanges))}
                                className="bg-red-700 py-2 px-5 text-white rounded hover:bg-red-800">
                                Guardar
                            </button>
                            <button
                                onClick={() => { setSelectedProfesional(null); handleCancel_init() }}
                                className="bg-gray-700 py-2 px-5 text-white rounded hover:bg-gray-800">
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )
            }
        </main >
    )
    // #endregion
}
export default withAuth(Profesionales);