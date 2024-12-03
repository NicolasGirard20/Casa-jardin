"use client";
// #region Imports
import React, { use, useEffect, useRef, useState } from "react";
import Navigate from "../../../components/Admin/navigate/page";
import But_aside from "../../../components/but_aside/page";
import { Alumno, createAlumno, createAlumnoAdmin, deleteAlumno, dniExists, emailExists, getAlumnos, updateAlumno } from "../../../services/Alumno";
import { getAlumnoByCookie } from "../../../services/Alumno";
import Image from "next/image";
import ButtonAdd from "../../../../public/Images/Button.png";
import DeleteIcon from "../../../../public/Images/DeleteIcon.png";
import EditIcon from "../../../../public/Images/EditIcon.png";
import Background from "../../../../public/Images/Background.jpeg"
import { getImages_talleresAdmin } from "@/services/repoImage";

import Talleres from "@/components/talleres/page";
import { addDireccion, getDireccionById, getDireccionCompleta, updateDireccionById } from "@/services/ubicacion/direccion";
import { addLocalidad, getLocalidadById, getLocalidadByName, Localidad, updateLocalidad } from "@/services/ubicacion/localidad";
import { addProvincias, getProvinciasById, getProvinciasByName, updateProvinciaById } from "@/services/ubicacion/provincia";
import { addPais, getPaisById } from "@/services/ubicacion/pais";
import { createAlumno_Curso } from "@/services/alumno_curso";
import { Curso } from "@/services/cursos";
import withAuth from "../../../components/Admin/adminAuth";
import PasswordComponent from "@/components/Password/page";
import { hashPassword } from "@/helpers/hashPassword";
import { createResponsable, deleteResponsable, deleteResponsableByAlumnoId, getAllResponsables, updateResponsable } from "@/services/responsable";
import { validateApellido, validateDireccion, validateDni, validateEmail, validateNombre, validatePasswordComplexity, validatePhoneNumber } from "@/helpers/validaciones";
// #endregion

const Alumnos: React.FC = () => {
    // #region UseStates
    const [alumnos, setAlumnos] = useState<any[]>([]);
    const [alumnosBuscados, setAlumnosBuscados] = useState<Alumno[]>([]);
    const [alumnosMostrados, setAlumnosMostrados] = useState<any[]>([]);
    const [alumnoAbuscar, setAlumnoAbuscar] = useState<string>("");
    const [habilitarAlumnosBuscados, setHabilitarAlumnosBuscados] = useState<boolean>(true);
    const [selectedAlumno, setSelectedAlumno] = useState<any>(null);

    const [obAlumno, setObAlumno] = useState<any>(null);

    const [alumnoDetails, setAlumnoDetails] = useState<any>({
        id: 0,
        nombre: "",
        apellido: "",
        dni: 0,
        telefono: 0,
        email: "",
        password: "",
        fechaNacimiento: new Date(),
        direccionId: null
    });
    const [alumnoDetailsCopia, setAlumnoDetailsCopia] = useState<any>({
        id: 0,
        nombre: "",
        apellido: "",
        dni: 0,
        telefono: 0,
        email: "",
        password: "",
        fechaNacimiento: new Date(),
        direccionId: null
    });
    const [responsableDetails, setResponsableDetails] = useState<any>({
        id: 0,
        nombre: "",
        apellido: "",
        dni: 0,
        telefono: 0,
        email: "",
        alumnoId: 0,
        direccionId: null
    });
    const [responsableDetailsCopia, setResponsableDetailsCopia] = useState<any>({
        id: 0,
        nombre: "",
        apellido: "",
        dni: 0,
        telefono: 0,
        email: "",
        alumnoId: 0,
        direccionId: null
    });
    const [responsables, setResponsables] = useState<any[]>([]);
    // Estado para almacenar mensajes de error
    const [errorMessage, setErrorMessage] = useState<string>("");
    //Estado para almacenar las imagenes
    const [images, setImages] = useState<any[]>([]);

    //useState para almacenar la dirección
    //useState para almacenar la dirección
    const [nacionalidadName, setNacionalidadName] = useState<string>();
    // Estado para almacenar el ID de la provincia, inicialmente nulo
    const [provinciaName, setProvinciaName] = useState<string>();

    // Estado para almacenar el ID de la localidad, inicialmente nulo
    const [localidadName, setLocalidadName] = useState<string>();

    // Estado para almacenar la direccionID, inicialmente nulo
    const [user, setUser] = useState<any>(null);

    // Estado para almacenar la calle, inicialmente nulo
    const [calle, setcalle] = useState<string | null>(null);

    // Estado para almacenar el número de la dirección, inicialmente nulo
    const [numero, setNumero] = useState<number | null>(null);

    // Estado para almacenar los cursos elegidos, inicialmente un array vacío
    const [cursosElegido, setCursosElegido] = useState<Curso[]>([]);

    // Referencia para el contenedor de desplazamiento
    const scrollRef = useRef<HTMLDivElement>(null);

    const [habilitarCambioContraseña, setHabilitarCambioContraseña] = useState<boolean>(false)
    const [correcto, setCorrecto] = useState(false);
    //decidir si el alumno elegido es mayor o menor
    const [mayor, setMayor] = useState<boolean>(false);
    // #endregion

    // #region UseEffects
    //useEffect para obtener los alumnos
    useEffect(() => {
        fetchAlumnos();
        fetchImages();
        handleCancel_init();
    }, []);

    useEffect(() => {
        if (errorMessage !== "") {
            setInterval(() => {
                setErrorMessage("")
            }, 5000);
        }
    }, [errorMessage])

    useEffect(() => {
        if (obAlumno && obAlumno.direccionId) {
            getUbicacion(obAlumno);
        } else if (obAlumno && obAlumno.direccionId === null) {
            setNacionalidadName("");
            setProvinciaName("");
            setLocalidadName("");
            setcalle("");
            setNumero(null);
        }
    }, [obAlumno]);
    useEffect(() => {
        if ((errorMessage.length > 0) && scrollRef.current) {
            scrollRef.current.scrollTop = 0;
        }
    }, [errorMessage]);

    useEffect(() => {
        if (selectedAlumno !== null) {
            setAlumnoDetails({
                id: selectedAlumno.id,
                nombre: selectedAlumno.nombre,
                apellido: selectedAlumno.apellido,
                dni: selectedAlumno.dni,
                telefono: selectedAlumno.telefono,
                direccionId: selectedAlumno.direccionId,
                email: selectedAlumno.email,
                password: "",
                fechaNacimiento: selectedAlumno.fechaNacimiento && new Date(selectedAlumno.fechaNacimiento).toISOString().split('T')[0]
            });
            setAlumnoDetailsCopia({
                id: selectedAlumno.id,
                nombre: selectedAlumno.nombre,
                apellido: selectedAlumno.apellido,
                dni: selectedAlumno.dni,
                telefono: selectedAlumno.telefono,
                direccionId: selectedAlumno.direccionId,
                email: selectedAlumno.email,
                password: "",
                fechaNacimiento: selectedAlumno.fechaNacimiento && new Date(selectedAlumno.fechaNacimiento).toISOString().split('T')[0]
            });
            if (selectedAlumno.fechaNacimiento) {
                const edad = new Date().getFullYear() - new Date(selectedAlumno.fechaNacimiento).getFullYear();
                if (edad < 18) {
                    setMayor(false);
                    const responsableALum = responsables.filter(responsable => responsable.alumnoId === selectedAlumno.id)
                    setResponsableDetails({
                        nombre: responsableALum[0]?.nombre || "",
                        apellido: responsableALum[0]?.apellido || "",
                        dni: responsableALum[0]?.dni || null,
                        telefono: responsableALum[0]?.telefono || null,
                        email: responsableALum[0]?.email || "",
                        alumnoId: selectedAlumno.id,
                        direccionId: responsableALum[0]?.direccionId || null
                    });
                    setResponsableDetailsCopia({
                        nombre: responsableALum[0]?.nombre || "",
                        apellido: responsableALum[0]?.apellido || "",
                        dni: responsableALum[0]?.dni || null,
                        telefono: responsableALum[0]?.telefono || null,
                        email: responsableALum[0]?.email || "",
                        alumnoId: selectedAlumno.id,
                        direccionId: responsableALum[0]?.direccionId || null
                    });
                } else setMayor(true);
            }
        } else {
            setAlumnoDetails({
                nombre: "",
                apellido: "",
                dni: null,
                telefono: null,
                email: "",
                password: "",
                fechaNacimiento: new Date()
            });
        }
    }, [selectedAlumno, alumnos]);
    // #endregion

    // #region Métodos
    async function fetchAlumnos() {
        try {
            const data = await getAlumnos();
            console.log(data);
            setAlumnos(data);
            setAlumnosMostrados(data);
            const responsables = await getAllResponsables();
            setResponsables(responsables);
        } catch (error) {
            console.error("Imposible obetener Alumnos", error);
        }
    }

    // Método para obtener las imagenes
    const fetchImages = async () => {
        const result = await getImages_talleresAdmin();
        if (result.error) {
            setErrorMessage(result.error)
        } else {
            console.log(result)
            setImages(result.images);

        }
    };
    //region solo considera repetidos
    async function createUbicacion() {
        // Obtener la localidad asociada a la dirección
        //console.log("Antes de crear la ubicacion", (localidadName), calle, numero, provinciaName, nacionalidadName);
        const nacionalidad = await addPais({ nombre: String(nacionalidadName) });
        const prov = await addProvincias({ nombre: String(provinciaName), nacionalidadId: Number(nacionalidad?.id) });

        const localidad = await addLocalidad({ nombre: String(localidadName), provinciaId: Number(prov?.id) });
        //console.log("LOCALIDAD", localidad);
        const direccion = await addDireccion({ calle: String(calle), numero: Number(numero), localidadId: Number(localidad?.id) });
        //console.log("DIRECCION", direccion);
        return direccion;
    }

    async function getUbicacion(userUpdate: any) {
        // Obtener la dirección del usuario por su ID
        //console.log("SI DIRECCIONID ES FALSE:", Number(userUpdate?.direccionId));
        const direccion = await getDireccionCompleta(userUpdate?.direccionId);
        /* console.log("DIRECCION", direccion);
        console.log("LOCALIDAD", direccion?.localidad);
        console.log("PROVINCIA", direccion?.localidad?.provincia);
        console.log("PAIS", direccion?.localidad?.provincia?.nacionalidad); */
        //console.log("NACIONALIDAD", nacionalidad);
        // Actualizar los estados con los datos obtenidos
        setLocalidadName(String(direccion?.localidad?.nombre));
        setProvinciaName(String(direccion?.localidad?.provincia?.nombre));
        setNacionalidadName(String(direccion?.localidad?.provincia?.nacionalidad?.nombre));
        setNumero(Number(direccion?.numero));
        setcalle(String(direccion?.calle));
        return { direccion };
    }

    //region validate
    async function validatealumnoDetails() {
        const { nombre, apellido, password, email, telefono, dni } = alumnoDetails || {};
        const { nombre: nombreR, apellido: apellidoR, email: EmailR,
            dni: dniR, telefono: telefonoR } = responsableDetails || {};

        //validar que el nombre sea de al menos 2 caracteres y no contenga números
        let resultValidate;
        if (alumnoDetails) {
            resultValidate = validateNombre(nombre);
            if (resultValidate) return resultValidate;

            resultValidate = validateApellido(apellido);
            if (resultValidate) return resultValidate;

            resultValidate = validateEmail(email);
            if (resultValidate) return resultValidate;
            if (email !== alumnoDetailsCopia.email) {
                const estado = await emailExists(email)
                if (estado) {
                    return "El email ya está registrado.";
                }
                if (resultValidate) return resultValidate;
            }


            resultValidate = validateDni(String(dni));
            if (resultValidate) return resultValidate;
            if (dni !== alumnoDetailsCopia.dni) {
                const estado = await dniExists(Number(dni))
                if (estado) {
                    return "El dni ya está registrado.";
                }
            }
            if (mayor && telefono && typeof (telefono) === "number") {
                resultValidate = validatePhoneNumber(String(telefono));
                if (resultValidate) return resultValidate;
            }
            if (password && password.length > 0) {
                resultValidate = validatePasswordComplexity(password);
                if (resultValidate) return resultValidate;
            }

        }
        resultValidate = validateDireccion(nacionalidadName, provinciaName, localidadName, String(calle), Number(numero));
        if (resultValidate) return resultValidate

        if (responsableDetails && mayor === false) {
            resultValidate = validateNombre(nombreR);
            if (resultValidate) return resultValidate;

            resultValidate = validateApellido(apellidoR);
            if (resultValidate) return resultValidate;

            resultValidate = validateEmail(EmailR);
            if (resultValidate) return resultValidate;
            if (EmailR !== responsableDetailsCopia.email) {
                const estado = await emailExists(EmailR)
                if (estado) {
                    return "El email del responsable ya está registrado.";
                }
            }

            //el Dni no puede estar vacio
            resultValidate = validateDni(String(dniR));
            if (resultValidate) return resultValidate;
            if (dniR !== responsableDetailsCopia.dni) {
                const estado = await dniExists(dniR)
                if (estado) {
                    return "El dni del responsable ya está registrado.";
                }
            }
            //el teléfono puede estar vacio
            if (telefonoR && typeof (telefonoR) === "number") {
                resultValidate = validatePhoneNumber(String(telefonoR));
                if (resultValidate) return resultValidate;
            }
        }
        // if (!/\d/.test(fechaNacimiento)) return ("La fecha de nacimiento es obligatoria");
    }
    // Función para manejar los cambios en los campos del formulario
    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;

        setAlumnoDetails((prevDetails: any) => ({
            ...prevDetails,
            [name]: value // Convierte `telefono` a número entero si el campo es `telefono` y maneja `fechaNacimiento`

        }));
        // console.log("FECHA", name, value);
    }
    function handleChangeResponsable(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setResponsableDetails((prevDetails: any) => ({
            ...prevDetails,
            [name]: value // Convierte `telefono` a número entero si el campo es `telefono`
        }));
    }
    function setVariablesState() {
        setNacionalidadName("");
        setProvinciaName("");
        setLocalidadName("");
        setcalle("");
        setNumero(null);
        setObAlumno(null);
        setSelectedAlumno(null);
        setCursosElegido([]);
        fetchAlumnos();
        setErrorMessage("");
    }
    async function handleSaveChanges() {

        const validationError = await validatealumnoDetails();



        if (validationError) {
            setErrorMessage(validationError);
            return;
        }
        //se agrega al telefono el código de país

        //SI NO TIENIA DIRECCIÓN CARGADA 
        if (!obAlumno.direccionId) {
            const dir = await createUbicacion();
            //si es menor
            if (mayor === false) {
                //console.log("fecha 1", new Date(alumnoDetails.fechaNacimiento));
                // console.log("fecha 2", (alumnoDetails.fechaNacimiento));
                const newAlumno = await updateAlumno(alumnoDetails?.id || 0, {
                    nombre: alumnoDetails.nombre, apellido: alumnoDetails.apellido,
                    dni: Number(alumnoDetails.dni), email: alumnoDetails.email,
                    direccionId: Number(dir?.id), fechaNacimiento: new Date(alumnoDetails.fechaNacimiento),
                    password: alumnoDetails.password
                });
                if (typeof newAlumno === "string") return setErrorMessage(newAlumno);
                await updateResponsable(alumnoDetails?.id || 0, {
                    nombre: responsableDetails.nombre, apellido: responsableDetails.apellido,
                    dni: Number(responsableDetails.dni), email: responsableDetails.email, telefono: String(responsableDetails.telefono),
                    alumnoId: newAlumno.id, direccionId: Number(dir?.id)
                });
                if (typeof newAlumno === "string") return setErrorMessage(newAlumno);
                for (const curso of cursosElegido) {                                  //recorre los cursos elegidos y los guarda en la tabla intermedia
                    await createAlumno_Curso({ cursoId: curso.id, alumnoId: newAlumno.id });
                }

                setVariablesState();
                return;
            }
            //SI ES MAYOR
            //console.log("ALUMNODETAILS", alumnoDetails);
            const newAlumno = await updateAlumno(alumnoDetails?.id || 0, {
                nombre: alumnoDetails.nombre, apellido: alumnoDetails.apellido,
                dni: Number(alumnoDetails.dni), email: alumnoDetails.email, telefono: String(alumnoDetails.telefono),
                direccionId: Number(dir?.id), fechaNacimiento: new Date(alumnoDetails.fechaNacimiento),
                password: alumnoDetails.password
            });
            if (typeof newAlumno === "string") return setErrorMessage(newAlumno);

            for (const curso of cursosElegido) {                                  //recorre los cursos elegidos y los guarda en la tabla intermedia
                await createAlumno_Curso({ cursoId: curso.id, alumnoId: newAlumno.id });
            }

            setVariablesState();
            return;
        }
        //---------------SI YA TIENE DIRECCIÓN CARGADA
        const { direccion } = await getUbicacion(obAlumno);
        const localidad = direccion?.localidad;
        const prov = localidad?.provincia;
        const nacionalidad = prov?.nacionalidad;
        try {
            const newDireccion = await updateDireccionById(Number(direccion?.id), {
                calle: String(calle),
                numero: Number(numero),
                localidadId: Number(localidad?.id)
            });
            //console.log("newDireccion", newDireccion);
            await updateLocalidad(Number(localidad?.id), {
                nombre: String(localidadName),
                provinciaId: Number(prov?.id)
            });
            //console.log("newLocalidad", newLocalidad);
            await updateProvinciaById(Number(prov?.id), {
                nombre: String(provinciaName),
                nacionalidadId: Number(nacionalidad?.id)
            });
            //--------SI ES MENOR
            if (mayor === false) {
                // console.log("fecha 1", new Date(alumnoDetails.fechaNacimiento));
                //console.log("fecha 2", (alumnoDetails.fechaNacimiento));
                const newAlumno = await updateAlumno(alumnoDetails?.id || 0, {
                    nombre: alumnoDetails.nombre, apellido: alumnoDetails.apellido,
                    dni: Number(alumnoDetails.dni), email: alumnoDetails.email,
                    direccionId: Number(direccion?.id), fechaNacimiento: new Date(alumnoDetails.fechaNacimiento), password: alumnoDetails.password
                });
                if (typeof newAlumno === "string") return setErrorMessage(newAlumno);
                await updateResponsable(alumnoDetails?.id || 0, {
                    nombre: responsableDetails.nombre, apellido: responsableDetails.apellido,
                    dni: Number(responsableDetails.dni), email: responsableDetails.email, telefono: String(responsableDetails.telefono),
                    alumnoId: newAlumno.id, direccionId: Number(direccion?.id)
                });
                if (typeof newAlumno === "string") return setErrorMessage(newAlumno);
                for (const curso of cursosElegido) {                                  //recorre los cursos elegidos y los guarda en la tabla intermedia
                    await createAlumno_Curso({ cursoId: curso.id, alumnoId: newAlumno.id });
                }
                setVariablesState();
                return;
            }
            //console.log("ALUMNODETAILS", alumnoDetails);

            //-------------SI ES MAYOR
            const newAlumno = await updateAlumno(alumnoDetails?.id || 0, {
                nombre: alumnoDetails.nombre, apellido: alumnoDetails.apellido,
                dni: Number(alumnoDetails.dni), telefono: String(alumnoDetails.telefono),
                direccionId: Number(newDireccion?.id), email: alumnoDetails.email, fechaNacimiento: new Date(alumnoDetails.fechaNacimiento),
                password: alumnoDetails.password
            });
            if (typeof newAlumno === "string") return setErrorMessage(newAlumno);
            for (const curso of cursosElegido) {                                  //recorre los cursos elegidos y los guarda en la tabla intermedia
                await createAlumno_Curso({ cursoId: curso.id, alumnoId: newAlumno.id });
            }

            setVariablesState();
        } catch (error) {
            console.error("Error al actualizar el profesional", error);
        }
    }
    async function handleCreateAlumno() {
        const validationError = await validatealumnoDetails();
        // console.log("newDireccion", direccion);
        if (validationError) {
            setErrorMessage(validationError);
            return;
        }
        const dir = await createUbicacion();
        //se agrega al telefono el código de país

        try {
            //alumno Mayor
            if (selectedAlumno == -1) {
                //region hashPassword
                //se crea el alumno, si ya existe se lo actualiza pero sin cambiar la contraseña y el email.
                const newAlumno = await createAlumnoAdmin({
                    nombre: alumnoDetails.nombre, apellido: alumnoDetails.apellido,
                    dni: Number(alumnoDetails.dni), email: alumnoDetails.email, telefono: String(alumnoDetails.telefono),
                    direccionId: Number(dir?.id), password: alumnoDetails.password, rolId: 2,     //rol 2 es alumno
                    fechaNacimiento: new Date(alumnoDetails.fechaNacimiento)
                });
                console.log("newAlumno", newAlumno);
                if (typeof newAlumno === "string") return setErrorMessage(newAlumno);
                for (const curso of cursosElegido) {                                  //recorre los cursos elegidos y los guarda en la tabla intermedia
                    await createAlumno_Curso({ cursoId: curso.id, alumnoId: newAlumno.id });
                    //console.log(prof_cur)
                }

                setVariablesState();
            }
            //alumno Menor
            if (selectedAlumno === -2) {

                const newAlumno = await createAlumnoAdmin({
                    nombre: alumnoDetails.nombre, apellido: alumnoDetails.apellido,
                    dni: Number(alumnoDetails.dni), email: alumnoDetails.email,
                    direccionId: Number(dir?.id), password: alumnoDetails.password, rolId: 2,     //rol 2 es alumno
                    fechaNacimiento: new Date(alumnoDetails.fechaNacimiento)
                });

                if (typeof newAlumno === "string") return setErrorMessage(newAlumno);
                for (const curso of cursosElegido) {                                  //recorre los cursos elegidos y los guarda en la tabla intermedia
                    await createAlumno_Curso({ cursoId: curso.id, alumnoId: newAlumno.id });
                    //console.log(prof_cur)
                }

                //responsable
                await createResponsable({
                    nombre: responsableDetails.nombre, apellido: responsableDetails.apellido,
                    dni: Number(responsableDetails.dni), email: responsableDetails.email, telefono: String(alumnoDetails.telefono),
                    alumnoId: newAlumno.id, direccionId: Number(dir?.id)
                });
                setVariablesState();
            }

        } catch (error) {
            console.error("Error al crear el profesional", error);
        }
    }
    async function handleEliminarAlumno(alumno: any) {
        console.log(alumno);
        //elimino el responsable si el alumno es menor
        if (mayor === false) {
            console.log("responsable", responsableDetails);

            const responsable = await deleteResponsableByAlumnoId(alumno.id);
            console.log("responsable borrado", responsable);
        }
        const alumnoBorrado = await deleteAlumno(alumno.id);
        console.log("alumno borrado", alumnoBorrado);
        fetchAlumnos();
    }
    async function handleCancel_init() {
        setNacionalidadName("");
        setProvinciaName("");
        setLocalidadName("");
        setcalle("");
        setNumero(null);
        setObAlumno(null);
        setCursosElegido([]);
        setResponsableDetails({
            nombre: "",
            apellido: "",
            dni: 0,
            telefono: 0,
            email: "",
            alumnoId: 0,
            direccionId: 0
        })
    }
    // #endregion
    // Function to handle search input change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setHabilitarAlumnosBuscados(true);
        const searchTerm = e.target.value.toLowerCase();
        let filteredAlumnos = alumnosMostrados.filter(alumno =>
            alumno.nombre.toLowerCase().includes(searchTerm) ||
            alumno.apellido.toLowerCase().includes(searchTerm)/*  ||
            alumno.email.toLowerCase().includes(searchTerm) */
        );

        setAlumnosBuscados([]);
        console.log(e.target.value);
        setAlumnosBuscados(filteredAlumnos);
        setAlumnoAbuscar(e.target.value);
        setAlumnos(filteredAlumnos);
    };



    // #region Return
    return (
        <main className="relative min-h-screen w-screen" style={{ fontFamily: "Cursive" }}>
            <div className="fixed top-0 left-0 right-0 flex justify-between w-full px-4 pt-2 bg-sky-600 z-20">
                <Navigate />
            </div>
            <div className="relative min-h-screen w-full pt-16">
                {/* Background */}
                <div className="absolute inset-0 w-full h-full z-0">
                    <Image
                        src={Background}
                        alt="Background"
                        layout="fill"
                        objectFit="cover"
                        quality={80}
                        priority={true}
                        className="w-full h-full pointer-events-none"
                        style={{ opacity: 0.88 }}
                    />
                </div>

                {/* Encabezado */}
                <div className="relative mt-16 sm:mt-20 flex flex-col items-center z-10">
                    <h1 className="text-2xl sm:text-3xl bg-white rounded-lg p-2 shadow-lg">ALUMNOS</h1>
                </div>

                {/* Barra de búsqueda */}
                <div className="relative mt-4 flex justify-center z-10">
                    <div className="relative w-11/12 sm:w-1/4">
                        <input
                            type="text"
                            placeholder="Buscar..."
                            className="p-2 border rounded w-full"
                            value={alumnoAbuscar}
                            onChange={handleSearchChange}
                        />
                    </div>
                </div>

                {/* Contenedor Principal */}
                <div className="relative mt-8 flex justify-center z-10">
                    <div className="border p-4 w-11/12 sm:w-2/3 md:w-1/2 lg:w-1/3 h-[60vh] bg-gray-800 bg-opacity-60 overflow-y-auto rounded-lg">
                        <div className="flex flex-col space-y-4">
                            {alumnos.map((alumno, index) => (
                                <div
                                    key={index}
                                    className="border p-4 relative bg-white w-full flex flex-col justify-center items-center rounded shadow-md"
                                >
                                    <div className="flex justify-between w-full mb-2">
                                        <h3 className="text-lg font-semibold text-black">{alumno.nombre} {alumno.apellido}</h3>
                                        <div className="flex space-x-2">
                                            <button onClick={() => handleEliminarAlumno(alumno)} className="text-red-600 font-bold">
                                                <Image src={DeleteIcon} alt="Eliminar" width={27} height={27} />
                                            </button>
                                            <button onClick={() => {
                                                setSelectedAlumno(alumno); setObAlumno(alumno); console.log("mayor??", mayor);
                                            }} className="text-blue-600 font-bold">
                                                <Image src={EditIcon} alt="Editar" width={27} height={27} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        <p>Email: {alumno.email}</p>
                                        {alumno.fechaNacimiento && (
                                            <p>
                                                {new Date().getFullYear() - new Date(alumno.fechaNacimiento).getFullYear() < 18 ? "Menor de edad" : "Mayor de edad"}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => { setSelectedAlumno(-1); setObAlumno(null); setMayor(true) }} className="mt-6 mx-4 bg-white rounded-full p-2 hover:bg-sky-400">
                            Agregar mayor
                        </button>
                        <button onClick={() => { setSelectedAlumno(-2); setObAlumno(null); setMayor(false) }} className="mt-6 mx-4 bg-white rounded-full p-2 hover:bg-sky-400">
                            Agregar menor
                        </button>
                    </div>
                </div>

                {/* Modal */}
                {selectedAlumno !== null && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
                        <div ref={scrollRef} className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg relative" style={{ height: '70vh', overflow: "auto" }}>
                            <h2 className="text-2xl font-bold mb-4">
                                {selectedAlumno === -1 ? "Nuevo Alumno" : "Editar Alumno"}
                            </h2>
                            {errorMessage && (
                                <div className="mb-4 text-red-600">
                                    {errorMessage}
                                </div>
                            )}
                            <h1 className=" w-full mt-8 mb-3 font-semibold underline">Datos del alumno</h1>
                            <div className="mb-4">
                                <label htmlFor="nombre" className="block">Nombre:</label>
                                <input
                                    type="text"
                                    id="nombre"
                                    name="nombre"
                                    placeholder="Ej: Juan"
                                    pattern="\d{35}" // Este patrón asegura que solo se acepten 25 caracteres
                                    maxLength={35}  // Limitar a 25 caracteres
                                    value={alumnoDetails.nombre}
                                    onChange={handleChange}
                                    className="p-2 w-full border rounded"
                                />
                                <label htmlFor="apellido" className="block">Apellido:</label>
                                <input
                                    type="text"
                                    id="apellido"
                                    name="apellido"
                                    placeholder="Ej: Perez"
                                    pattern="\d{35}" // Este patrón asegura que solo se acepten 25 caracteres
                                    maxLength={35}  // Limitar a 25 caracteres
                                    value={alumnoDetails.apellido}
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

                                    placeholder={selectedAlumno === -2 ? "Si no tiene email, el mismo debe ser del responsable" : "Ej: dominio@email.com"}
                                    pattern="\d{75}" // Este patrón asegura que solo se acepten 45 caracteres
                                    maxLength={75}  // Limitar a 25 caracteres
                                    value={alumnoDetails.email}
                                    onChange={handleChange}
                                    className="p-2 w-full border rounded"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="dni" className="block">DNI:</label>
                                <input
                                    type="text" // Cambiado a "text" para mayor control
                                    id="dni"
                                    name="dni"
                                    placeholder="Ingrese su DNI"
                                    value={alumnoDetails.dni || ''} // Asegurar un valor por defecto como cadena vacía
                                    maxLength={8} // Limitar a 8 caracteres
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, ""); // Eliminar cualquier caracter no numérico
                                        const formattedValue = value

                                        setAlumnoDetails({ ...alumnoDetails, dni: formattedValue }); // Actualizar el estado
                                    }}
                                    className="p-2 w-full border rounded"
                                />
                            </div>

                            {selectedAlumno !== -2 && mayor === true && (
                                <div className="mb-4">
                                    <label htmlFor="telefono" className="block">Teléfono:</label>
                                    <div className="flex items-center">
                                        <span className="p-2 bg-gray-200 rounded-l">+54</span>
                                        <input
                                            type="text"
                                            id="telefono"
                                            name="telefono"
                                            placeholder="Ej: 3411234567"
                                            maxLength={10} // Limitar a 10 dígitos
                                            value={alumnoDetails.telefono || ''} // Asegurar un valor inicial válido
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\D/g, ""); // Eliminar caracteres no numéricos
                                                setAlumnoDetails({ ...alumnoDetails, telefono: value }); // Actualizar el estado
                                            }}
                                            className="p-2 w-full border rounded-r"
                                        />
                                    </div>
                                    {alumnoDetails.telefono && alumnoDetails.telefono.length !== 10 && (
                                        <p className="text-red-500 text-sm mt-1">
                                            El número de teléfono debe tener exactamente 10 dígitos.
                                        </p>
                                    )}
                                </div>

                            )}
                            <div className="flex-col flex mb-4">
                                <label htmlFor="fechaNacimiento">Fecha de Nacimiento</label>
                                <input
                                    id="fechaNacimiento"
                                    type="date"
                                    name="fechaNacimiento"
                                    className="border rounded"
                                    value={alumnoDetails.fechaNacimiento}
                                    onChange={handleChange}
                                    min={mayor === false ?
                                        new Date(new Date().setFullYear(new Date().getFullYear() - 17)).toISOString().split('T')[0] :
                                        new Date(new Date().setFullYear(new Date().getFullYear() - 100)).toISOString().split('T')[0]
                                    }
                                    max={mayor === true ?
                                        new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0] :
                                        new Date(new Date().setFullYear(new Date().getFullYear() - 3)).toISOString().split('T')[0]
                                    }
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="password" className="block">Contraseña:</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    placeholder={(selectedAlumno === -1 || selectedAlumno === -2) ? "Ingrese una contraseña" : "Si desea cambiar la contraseña, ingresela aquí"}
                                    value={alumnoDetails.password}
                                    onChange={handleChange}
                                    className="p-2 w-full border rounded"
                                />
                            </div>
                            {((!nacionalidadName && !provinciaName && !localidadName && !calle && !numero && (selectedAlumno !== -1 || selectedAlumno !== -2) && obAlumno?.direccionId)) && <p className=" text-red-600">Cargando su ubicación...</p>}
                            <>
                                <div className="mb-4">
                                    <label htmlFor="pais" className="block">País:</label>
                                    <input
                                        type="text"
                                        id="pais"
                                        name="pais"
                                        placeholder="Ej: Argentina"
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
                                        placeholder="Ej: Entre Rios"
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
                                        placeholder="Ej: Crespo"
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
                                        placeholder="Ej: Av. San Martín"
                                        pattern="\d{35}" // Este patrón asegura que solo se acepten 25 caracteres
                                        maxLength={35}  // Limitar a 25 caracteres
                                        value={String(calle)}
                                        onChange={(e) => setcalle(e.target.value)}
                                        className="p-2 w-full border rounded"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="numero" className="block mb-1 font-medium">Número:</label>
                                    <input
                                        type="text"
                                        id="numero"
                                        name="numero"
                                        placeholder="Ej: 1234"
                                        value={Number(numero)}
                                        maxLength={6} // Limitar a 5 caracteres
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            // Permitir solo números y limitar a 6 caracteres
                                            if (/^\d{0,6}$/.test(value)) {
                                                setNumero(Number(value));
                                            }
                                        }}
                                        className="p-2 w-full border rounded"
                                    />
                                </div>

                            </>
                            {mayor !== true && (
                                <div>
                                    <h1 className=" w-full mt-8 mb-3 font-semibold underline">Datos del responsable</h1>
                                    <div className="mb-4">
                                        <label htmlFor="ResponsableNombre" className="block">Nombre :</label>
                                        <input
                                            type="text"
                                            id="ResponsableNombre"
                                            name="nombre"

                                            placeholder="Ej: Juan"
                                            pattern="\d{35}" // Este patrón asegura que solo se acepten 25 caracteres
                                            maxLength={35}  // Limitar a 25 caracteres
                                            value={responsableDetails.nombre}
                                            onChange={handleChangeResponsable}
                                            className="p-2 w-full border rounded"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label htmlFor="ResponsableApellido" className="block">Apellido:</label>
                                        <input
                                            type="text"
                                            id="ResponsableApellido"
                                            name="apellido"
                                            placeholder="Ej: Perez"
                                            pattern="\d{35}" // Este patrón asegura que solo se acepten 25 caracteres
                                            maxLength={35}  // Limitar a 25 caracteres
                                            value={responsableDetails.apellido}
                                            onChange={handleChangeResponsable}
                                            className="p-2 w-full border rounded"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label htmlFor="dniR" className="block">DNI:</label>
                                        <input
                                            type="text"
                                            id="dniR"
                                            name="dni"
                                            placeholder="Ingrese el DNI del responsable"
                                            maxLength={8} // Limitar a 8 caracteres
                                            value={responsableDetails.dni || ''} // Asegurar que el valor esté vacío si no existe
                                            onChange={(e) => {
                                               
                                                const value = e.target.value.replace(/\D/g, ""); // Eliminar cualquier caracter no numérico
                                                const formattedValue = value
        
                                                handleChangeResponsable({ target: { name: 'dni', value: formattedValue } } as React.ChangeEvent<HTMLInputElement>); // Actualizar el estado
                                            }}
                                            className="p-2 w-full border rounded"
                                        />
                                    </div>
                               

                                    <div className="mb-4">
                                        <label htmlFor="telefonoR" className="block">Teléfono:</label>
                                        <div className="flex">
                                            <span className="p-2 bg-gray-200 rounded-l">+54</span>
                                            <input
                                                type="text"
                                                id="telefonoR"
                                                name="telefono"
                                                placeholder="Ej: 3411234567"
                                                maxLength={12} // Limitar a 12 dígitos
                                                value={responsableDetails.telefono || ''} // Asegurar un valor inicial válido
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/\D/g, ""); // Eliminar cualquier caracter no numérico
                                                    const formattedValue = value
            
                                                    handleChangeResponsable({ target: { name: 'telefono', value: formattedValue } } as React.ChangeEvent<HTMLInputElement>); // Actualizar el estado
                                                }}
                                                className="p-2 w-full border rounded"
                                            />
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <label htmlFor="emailR" className="block">Email:</label>
                                        <input
                                            type="text"
                                            id="emailR"
                                            name="email"
                                            maxLength={75}  // Limitar a 25 caracteres
                                            pattern="\d{75}" // Este patrón asegura que solo se acepten 25 caracteres
                                            placeholder="Ingrese el email del responsable"
                                            value={responsableDetails.email}
                                            onChange={handleChangeResponsable}
                                            className="p-2 w-full border rounded"
                                        />
                                    </div>
                                </div>
                            )}
                            <div>
                                <Talleres crearEstado={selectedAlumno} user={obAlumno} cursosElegido={cursosElegido} setCursosElegido={setCursosElegido} />
                            </div>
                            <div className="flex justify-end space-x-4">
                                <button
                                    onClick={selectedAlumno === -1 || selectedAlumno === -2 ? handleCreateAlumno : handleSaveChanges}
                                    className="bg-red-700 py-2 px-5 text-white rounded hover:bg-red-800"
                                >
                                    Guardar
                                </button>
                                <button
                                    onClick={() => { setSelectedAlumno(null); handleCancel_init() }}
                                    className="bg-gray-700 py-2 px-5 text-white rounded hover:bg-gray-800">
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
// #endregion
//export default Alumnos;
export default withAuth(Alumnos);
