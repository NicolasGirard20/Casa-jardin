"use client"
import React, { useRef, useState, useEffect, use } from 'react';
import Background from "../../../../public/Images/Background.jpeg";
import But_aside from "../../../components/but_aside/page";
import Image from "next/image";
import Navigate from "../../../components/profesional/navigate/page";
import { addDireccion, getDireccionById, getDireccionCompleta, updateDireccionById } from '@/services/ubicacion/direccion';
import { addProvincias, getProvinciasById, updateProvinciaById } from '@/services/ubicacion/provincia';
import { addLocalidad, getLocalidadById, getLocalidadesByProvinciaId, updateLocalidad } from '@/services/ubicacion/localidad';
import { addPais, getPaisById } from '@/services/ubicacion/pais';

import { Curso, getCursoById } from '@/services/cursos';
//import withAuthUser from "../../../components/profesional/userAuth";
import { useRouter } from 'next/navigation';
import { autorizarUser, fetchUserData } from '@/helpers/cookies';
import PasswordComponent from '@/components/Password/page';
import { getCursosByIdProfesional } from '@/services/profesional_curso';
import { updateProfesional } from '@/services/profesional';
import { validateApellido, validateDireccion, validateDni, validateEmail, validateNombre, validatePhoneNumber } from '@/helpers/validaciones';
import { emailExists } from '@/services/Alumno';
type Usuario = {
    id: number;
    nombre: string;
    apellido: string;
    telefono: number;
    email: string;
    /*     password: string; */
    direccionId: number;
    rolId: number;
};

const Cuenta: React.FC = () => {
    //region UseStates
    // Estado para asegurar cambios, inicialmente 0
    const [openBox, setOpenBox] = useState<number>(0);

    // Estado para almacenar mensajes de error, inicialmente vacío
    const [errorMessage, setErrorMessage] = useState<string>("");

    // Referencia para el contenedor de desplazamiento
    const scrollRef = useRef<HTMLDivElement>(null);

    // Estado para almacenar los datos del usuario, inicialmente nulo
    const [user, setUser] = useState<Usuario | null>();

    // Estado para almacenar los detalles del curso, inicialmente vacío
    const [profesionalDetails, setprofesionalDetails] = useState<{
        id: number; nombre: string; apellido: string;
        telefono: number; email: string; direccionId?: number; rolId?: number;
    }>({
        id: user?.id || 0,
        nombre: user?.nombre || '',
        apellido: user?.apellido || '',
        telefono: user?.telefono || 0,
        email: user?.email || '',
        direccionId: user?.direccionId || 0,
        rolId: user?.rolId || 0
    });
    const [profesionalDetailsCopia, setprofesionalDetailsCopia] = useState<{
        id: number; nombre: string; apellido: string;
        telefono: number; email: string; direccionId?: number; rolId?: number;
    }>();
    const [nacionalidadName, setNacionalidadName] = useState<string>();
    // Estado para almacenar el ID de la provincia, inicialmente nulo
    const [provinciaName, setProvinciaName] = useState<string>();

    // Estado para almacenar el ID de la localidad, inicialmente nulo
    const [localidadName, setLocalidadName] = useState<string>();

    // Estado para almacenar la calle, inicialmente nulo
    const [calle, setcalle] = useState<string | null>();

    // Estado para almacenar el número de la dirección, inicialmente nulo
    const [numero, setNumero] = useState<number | null>();

    // Estado para almacenar los cursos elegidos, inicialmente un array vacío
    const [cursosElegido, setCursosElegido] = useState<Curso[]>([]);
    //para obtener user by email

    const [habilitarCambioContraseña, setHabilitarCambioContraseña] = useState<boolean>(false);
    const [correcto, setCorrecto] = useState<boolean>(false);

    //listas de cursos
    const [cursos, setCursos] = useState<Curso[]>()

    //endregion

    //region UseEffects
    // Función para obtener los datos del usuario

    const router = useRouter();
    useEffect(() => {
        if (user && !profesionalDetails.email) {
            getUser()

        }

    }, [user]);
    // Para cambiar al usuario de página si no está logeado
    useEffect(() => {
        authorizeAndFetchData();
    }, [router]);

    const authorizeAndFetchData = async () => {

        // Primero verifico que el user esté logeado
        //console.log("router", router);
        await autorizarUser(router);
        // Una vez autorizado obtengo los datos del user y seteo el email
        const user = await fetchUserData();
        //console.log("user", user);
        setUser(user)
        if (!user) return;
        let talleres = await getCursosByIdProfesional(Number(user?.id));
        console.log("talleres", talleres);
        setCursos([])
        talleres.map((curso) => {
            setCursos(prev => (prev ? [...prev, curso] : [curso]));
        })
        //console.timeEnd("authorizeAndFetchData");
    };
    useEffect(() => {
        if ((errorMessage.length > 0) && scrollRef.current) {
            scrollRef.current.scrollTop = 0;
        }
    }, [errorMessage]);

    useEffect(() => {
        if (errorMessage != null) {
            setInterval(() => {
                setErrorMessage("")
            }, 10000);
        }
    }, [errorMessage]);
    //endregion

    //region Funciones


    async function createUbicacion() {
        const nacionalidad = await addPais({ nombre: String(nacionalidadName) });
        const prov = await addProvincias({ nombre: String(localidadName), nacionalidadId: Number(nacionalidad?.id) });
        const localidad = await addLocalidad({ nombre: String(localidadName), provinciaId: Number(prov?.id) });

        const direccion = await addDireccion({ calle: String(calle), numero: Number(numero), localidadId: Number(localidad?.id) });
        return { direccion, nacionalidad };
    }
    async function getUbicacion(userUpdate: any) {

        const direccion = await getDireccionCompleta(userUpdate?.direccionId);
        console.log("DIRECCION", direccion);
        console.log("LOCALIDAD", direccion?.localidad);
        console.log("PROVINCIA", direccion?.localidad?.provincia);
        console.log("PAIS", direccion?.localidad?.provincia?.nacionalidad);
        //console.log("NACIONALIDAD", nacionalidad);
        // Actualizar los estados con los datos obtenidos
        setLocalidadName(String(direccion?.localidad?.nombre));
        setProvinciaName(String(direccion?.localidad?.provincia?.nombre));
        setNacionalidadName(String(direccion?.localidad?.provincia?.nacionalidad?.nombre));
        setNumero(direccion?.numero);
        setcalle(direccion?.calle);
        return { direccion };
    }
    async function getUser() {

        console.log(user?.nombre);
        const userUpdate: Usuario = {
            id: user?.id || 0,
            nombre: user?.nombre || '',
            apellido: user?.apellido || '',
            telefono: user?.telefono || 0,
            email: user?.email || '',
            /*             password: user?.password || '', */
            direccionId: user?.direccionId || 0,
            rolId: user?.rolId || 0
        }
        if (!userUpdate.direccionId) {
            setNacionalidadName("")
            setProvinciaName("")
            setLocalidadName("")
            setcalle("")
            setNumero(0)
        } else if (userUpdate.direccionId) getUbicacion(userUpdate);

        setprofesionalDetails({
            id: userUpdate.id,
            nombre: userUpdate.nombre, apellido: userUpdate.apellido,
            telefono: (userUpdate.telefono),
            email: userUpdate.email, direccionId: userUpdate.direccionId, rolId: userUpdate.rolId
        });
        setprofesionalDetailsCopia({
            id: userUpdate.id,
            nombre: userUpdate.nombre, apellido: userUpdate.apellido,
            telefono: (userUpdate.telefono),
            email: userUpdate.email, direccionId: userUpdate.direccionId, rolId: userUpdate.rolId
        });
        setUser(userUpdate);
        //setOpenBox(!openBox)

        //CARGAR TODAS LAS DIRECCIONES
    }
    //region validate
    async function validateProfesionalDetails() {
        const { nombre, apellido, email, telefono } = profesionalDetails || {};
        /*         if (JSON.stringify(alumnoDetails) === JSON.stringify(alumnoDetailsCopia)) {
                    return;
                } */
        console.log("responsableDetails", profesionalDetails);

        //validar que el nombre sea de al menos 2 caracteres y no contenga números
        let resultValidate;
        if (profesionalDetails) {
            resultValidate = validateNombre(nombre);
            if (resultValidate) return resultValidate;

            resultValidate = validateApellido(apellido);
            if (resultValidate) return resultValidate;

            resultValidate = validateEmail(email);
            if (resultValidate) return resultValidate;
            if (email !== profesionalDetailsCopia?.email) {
                const estado = await emailExists(email)
                if (estado) {
                    return "El email ya está registrado.";
                }
                if (resultValidate) return resultValidate;
            }

            if (telefono && typeof (telefono) === "number") {
                resultValidate = validatePhoneNumber(String(telefono));
                if (resultValidate) return resultValidate;

            }

        }
        resultValidate = validateDireccion(nacionalidadName, provinciaName, localidadName, String(calle), Number(numero));
        if (resultValidate) return resultValidate

    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setprofesionalDetails(prevDetails => ({
            ...prevDetails,
            [name]: (value)
        }));
    }

    async function handleSaveChanges() {

        const validationError = await validateProfesionalDetails();
        if (validationError) {
            setErrorMessage(validationError);
            return;
        }
        if (!profesionalDetails.direccionId) {
            const { direccion } = await createUbicacion();
            console.log("profesionalDETAILS", profesionalDetails);
            const newprofesional = await updateProfesional(Number(profesionalDetails?.id), {
                nombre: profesionalDetails.nombre, apellido: profesionalDetails.apellido,
                email: profesionalDetails.email, telefono: String(profesionalDetails.telefono),
                direccionId: Number(direccion?.id)
            });
            if (typeof newprofesional === "string") return setErrorMessage(newprofesional);
            newprofesional.direccionId = direccion?.id;
            console.log("newprofesional", newprofesional);
            setOpenBox(0);
            getUser();
            authorizeAndFetchData();
            return;
        }
        const { direccion } = await getUbicacion(profesionalDetails);

        try {

            const newDireccion = await updateDireccionById(Number(direccion?.id), {
                calle: String(calle),
                numero: Number(numero),
                localidadId: Number(direccion?.localidad?.id)
            });
            console.log("newDireccion", newDireccion);
            const newLocalidad = await updateLocalidad(Number(direccion?.localidad?.id), {
                nombre: String(localidadName),
                provinciaId: Number(direccion?.localidad?.provincia?.id)
            });
            console.log("newLocalidad", newLocalidad);
            await updateProvinciaById(Number(direccion?.localidad?.provincia?.id), {
                nombre: String(provinciaName),
                nacionalidadId: Number(direccion?.localidad?.provincia?.nacionalidad?.id)
            });

            console.log("profesionalDETAILS", profesionalDetails);
            const newprofesional = await updateProfesional(Number(profesionalDetails?.id), {
                nombre: profesionalDetails.nombre, apellido: profesionalDetails.apellido,
                telefono: String(profesionalDetails.telefono),
                direccionId: Number(newDireccion?.id), email: profesionalDetails.email
            });
            console.log("newprofesional", newprofesional);
        } catch (error) {
            setErrorMessage("Ha ocurrido un error al guardar los cambios.");
        }
        setNacionalidadName(String(direccion?.localidad?.provincia?.nacionalidad?.nombre))
        setOpenBox(0);
        getUser();
        authorizeAndFetchData();
        console.log(openBox)

    }
    //endregion
    //region return
    return (
        <main style={{ fontFamily: "Cursive" }}>
            <Navigate />
            {/*            <div className="fixed inset-0 z-[-1]">
                <Image src={Background} alt="Background" layout="fill" objectFit="cover" quality={80} priority={true} />
            </div> */}
            <div className='absolute mt-20 top-5 '>
                <h1 className='flex my-20 items-center justify-center  font-bold text-3xl'>Datos del Profesional</h1>
                <div className='flex  justify-center w-screen'>
                    <div className=" mx-auto bg-gray-100 rounded-lg shadow-md px-8 py-6 grid grid-cols-2 gap-x-12 w-8/12">
                        <div className="mb-4">
                            <label className="block text-gray-700 font-bold mb-2">Nombre:</label>
                            <p className="p-2 border rounded bg-gray-100">{user?.nombre} {user?.apellido}</p>
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 font-bold mb-2">Talleres:</label>
                            {cursos?.length !== 0 ? (
                                <p className="p-2 border rounded bg-gray-100" style={{ height: '10vh', overflow: "auto" }}> {cursos?.map((curso) => curso.nombre).join(", ")}</p>
                            ) : <p className="p-2 border rounded bg-gray-100">Talleres no cargados</p>}
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 font-bold mb-2">Domicilio:</label>
                            <p className="p-2 border rounded bg-gray-100">{nacionalidadName ? nacionalidadName : "-"}, {provinciaName ? provinciaName : "-"}, {localidadName ? localidadName : "-"}, {calle ? calle : "-"} {numero ? numero : "-"}</p>
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 font-bold mb-2">Teléfono:</label>
                            <p className="p-2 border rounded bg-gray-100">{user?.telefono ? user?.telefono : "Teléfono no cargado"}</p>
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 font-bold mb-2">Email:</label>
                            <p className="p-2 border rounded bg-gray-100">{user?.email}</p>
                        </div>


                    </div>
                </div>
                <div className="flex items-center justify-center mt-5">
                    <button
                        className='bg-red-500 py-2 px-10 text-white rounded hover:bg-red-700'
                        onClick={() => { setOpenBox(1); console.log(openBox); getUser() }}>
                        Editar
                    </button>
                </div>
            </div>
            <div
                className="fixed bottom-0 py-2 border-t w-full z-30"
                style={{ background: "#EF4444" }}
            >
                <But_aside />
            </div>
            {openBox === 1 && (
                <div className="fixed inset-0 flex items-center w-600 justify-center bg-black bg-opacity-50">
                    <div ref={scrollRef} className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg relative" style={{ height: '70vh', overflow: "auto" }}>
                        <h2 className="text-2xl font-bold mb-4">
                            Datos del Profesional
                        </h2>
                        {errorMessage && (
                            <div className="mb-4 text-red-600">
                                {errorMessage}
                            </div>
                        )}
                        <div className="mb-4">
                            <label htmlFor="nombre" className="block">Nombre:</label>
                            <input
                                type="text"
                                id="nombre"
                                name="nombre"
                                placeholder="Ej: Juan"
                                pattern="^[a-zA-ZíÍáéóúÁÉÓÚ\u00f1\u00d1\s]{2,50}$" // Este patrón asegura que solo se acepten 25 caracteres
                                title="El nombre debe tener entre 2 y 50 caracteres, solo letras, espacios y tildes."
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
                                placeholder="Ej: Peréz"
                                maxLength={35}  // Limitar a 25 caracteres
                                pattern="^[a-zA-ZíÍáéóúÁÉÓÚ\u00f1\u00d1\s]{2,50}$" // Este patrón asegura que solo se acepten 25 caracteres
                                title="El apellido debe tener entre 2 y 50 caracteres, solo letras, espacios y tildes."
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

                                placeholder="Ej: dominio@email.com"
                                pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\$" // Este patrón asegura que solo se acepten correos válidos
                                maxLength={75}  // Limitar a 25 caracteres
                                value={profesionalDetails.email}
                                onChange={handleChange}
                                className="p-2 w-full border rounded"
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="imagen" className="block">Imagen:</label>
                            <input
                                type="file"
                                id="imagen"
                                name="imagen"
                                className="p-2 w-full border rounded"
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="telefono" className="block">Teléfono:</label>
                            <div className="flex">
                                <span className="p-2 bg-gray-200 rounded-l">+54</span>


                                <input
                                    type="text"
                                    id="telefono"
                                    name="telefono"
                                    placeholder="Ej: 1234567890"
                                    pattern="^\d{8,12}$" // Solo permite números, entre 8 y 15 dígitos
                                    title="El teléfono debe tener entre 8 y 12 números."
                                    maxLength={12} // Limitar la longitud a 15 caracteres
                                    value={profesionalDetails.telefono}
                                    onChange={(e) => {
                                        const value = e.target.value;

                                        // Filtra solo los números
                                        if (/^\d*$/.test(value)) {
                                            handleChange(e); // Actualiza el estado solo si es válido
                                        }
                                    }}
                                    className="p-2 w-full border rounded"
                                />
                            </div>

                        </div>
                        {((!nacionalidadName && !provinciaName && !localidadName && !calle && !numero && openBox === 1) && user?.direccionId) && <p className=" text-red-600">Cargando su ubicación...</p>}
                        {<div className="mb-4">
                            <label htmlFor="pais" className="block">País:</label>
                            <input
                                type="text"
                                id="pais"
                                name="pais"
                                pattern=" ^[a-zA-ZíÍáéóúÁÉÓÚ\u00f1\u00d1\s]{2,50}$" // Este patrón asegura que solo se acepten 25 caracteres
                                placeholder='Ej: Argentina'
                                maxLength={50}
                                value={String(nacionalidadName)}
                                onChange={(e) => setNacionalidadName(e.target.value)}
                                className="p-2 w-full border rounded"
                            />
                        </div>}
                        {<div className="mb-4">
                            <label htmlFor="provincia" className="block">Provincia:</label>
                            <input
                                type="text"
                                id="provincia"
                                name="provincia"
                                pattern=" ^[a-zA-ZíÍáéóúÁÉÓÚ\u00f1\u00d1\s]{2,50}$" // Este patrón asegura que solo se acepten 25 caracteres
                                placeholder='Ej: Entre Ríos'
                                maxLength={50}

                                value={String(provinciaName)}
                                onChange={(e) => setProvinciaName(e.target.value)}
                                className="p-2 w-full border rounded"
                            />
                        </div>}
                        {<div className="mb-4">
                            <label htmlFor="localidad" className="block">Localidad:</label>
                            <input
                                type="text"
                                id="localidad"
                                name="localidad"
                                pattern='^[a-zA-ZíÍáéóúÁÉÓÚ\u00f1\u00d1\s]{2,99}$' // Este patrón asegura que solo se acepten 25 caracteres
                                placeholder='Ej: Crespo'
                                maxLength={100}
                                value={String(localidadName)}
                                onChange={(e) => setLocalidadName(e.target.value)}
                                className="p-2 w-full border rounded"
                            />
                        </div>}
                        <div className="mb-4">
                            <label htmlFor="calle" className="block">Calle:</label>
                            <input
                                type="text"
                                id="calle"
                                name="calle"
                                pattern='^[a-zA-ZíÍáéóúÁÉÓÚ\u00f1\u00d1\s]{2,99}$' // Este patrón asegura que solo se acepten 25 caracteres
                                maxLength={99}
                                placeholder='Ej: Av San Martín'
                                value={String(calle)}
                                onChange={(e) => setcalle(e.target.value)}
                                className="p-2 w-full border rounded"
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="numero" className="block">Número:</label>
                            <input
                                type="text"
                                id="numero"
                                name="numero"
                                pattern='^\d{1,5}$' // Solo permite números, entre 1 y 5 dígitos
                                maxLength={5} // Limitar la longitud a 5 caracteres

                                value={numero || ''} // Aseguramos que el valor sea un string vacío si 'numero' es null o undefined
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, ''); // Reemplazamos cualquier caracter no numérico
                                    setNumero(Number(value)); // Establecemos el valor filtrado en el estado
                                }}
                                className="p-2 w-full border rounded"
                            />
                        </div>


                        <div>
                            <button
                                className="py-2  text-black font-bold rounded hover:underline"
                                onClick={() => setHabilitarCambioContraseña(!habilitarCambioContraseña)}
                            >
                                Cambiar contraseña
                            </button>
                            {habilitarCambioContraseña && <div className=' absolute bg-slate-100 rounded-md shadow-md px-2 left-1/2 top-1/2 tranform -translate-x-1/2 -translate-y-1/2'>
                                <button className='absolute top-2 right-2' onClick={() => setHabilitarCambioContraseña(false)}>X</button>
                                <PasswordComponent setCorrecto={setCorrecto} correcto={correcto} />
                            </div>}
                        </div>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => { handleSaveChanges(); console.log("openBox", openBox) }}
                                className="bg-red-700 py-2 px-5 text-white rounded hover:bg-red-800"
                            >
                                Guardar
                            </button>
                            <button
                                onClick={() => { setOpenBox(0); console.log(openBox) }}
                                className="bg-gray-700 py-2 px-5 text-white rounded hover:bg-gray-800"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}
export default (Cuenta);