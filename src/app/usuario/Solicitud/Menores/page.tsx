"use client"
//front end
import React, { useState, useEffect } from 'react';
import SeleccionTaller from './componentes/seleccionTaller';
import But_aside from "../../../../components/but_aside/page";
import Navigate from '../../../../components/alumno/navigate/page';
import CondicionSalud from './componentes/condicionSalud';
import AutorizacionImg from './componentes/autorizacionImagen';
import AutorizacionSalidas from './componentes/autorizacionSalidas';
import Reglamentacion from './componentes/reglamentacion';
import EmailPage from '../email/EmailPage';
import { useRouter } from 'next/navigation';

//server
import { autorizarUser, fetchUserData } from '@/helpers/cookies';
import { createSolicitud } from '@/services/Solicitud/Solicitud';
import { getDireccionCompleta } from '@/services/ubicacion/direccion';
import { createSolicitudMenores } from '@/services/Solicitud/SolicitudMenor';
import { createCursoSolicitud } from '@/services/curso_solicitud';
import { getResponsableByAlumnoId } from '@/services/responsable';
import { calcularEdad } from '@/helpers/fechas';
import { validateApellido, validateDireccion, validateDni, validateEmail, validateNombre, validatePhoneNumber } from '@/helpers/validaciones';
import Loader from '@/components/Loaders/loader/loader';
import { Stepper } from '@/components/alumno/stepper';
import DatosAlumno from './componentes/datosAlumno';
import { ArrowLeft, ArrowRight } from 'lucide-react';

//region useState
const Menores: React.FC = () => {
    // Estado para almacenar la pantalla actual
    const [selectedScreen, setSelectedScreen] = useState<number>(0);
    // Estado para almacenar los cursos seleccionados
    const [selectedCursosId, setSelectedCursosId] = useState<number[]>([]);


    //datos completos del menor
    const [datosMenor, setDatosMenor] = useState({
        nombre: "",
        apellido: "",
        fechaNacimiento: new Date().toISOString().split('T')[0],
        correoElectronico: "",
        dni: 0,
        pais: "",
        provincia: "",
        localidad: "",
        calle: "",
        numero: 0,
    });

    //datos completos del mayor
    const [datosMayor, setDatosMayor] = useState({
        nombre: "",
        apellido: "",
        telefono: 0,
        correoElectronico: "",
        dni: 0,
        pais: "",
        provincia: "",
        localidad: "",
        calle: "",
        numero: 0,
    });

    //datos de salud y permisos
    const [datosSalud, setDatosSalud] = useState({
        enfermedad: "",
        alergia: "",
        tratamiento: "",
        terapia: "",
        consultasEspecialistas: "",
        motivoInscripcion: ""
    });
    const [datosAutorizacionImage, setDatosAutorizacionImage] = useState({
        firma: "",
        observaciones: "",
    });
    const [datosAutorizacionSalidas, setDatosAutorizacionSalidas] = useState({
        firma: "",
        observaciones: "",
    });
    const [datosReglamentacion, setDatosReglamentacion] = useState({
        firma: "",
    });


    const [error, setError] = useState<string>('');
    const [verificarEmail, setVerificarEmail] = useState<boolean>(false);
    const [correcto, setCorrecto] = useState(false);
    const [user, setUser] = useState<any>();


    const [steps, setStep] = useState({
        stepsItems: ["Talleres", "Datos del Alumno", "Condición de salud", "Uso de Imagen", "Salidas", "Reglamentación"],
        currentStep: 1
    })

    //datos menor: nombre, apellido, edad, fecha de nacimiento, correo electronico, dni,pais, localidad,calle
    //datos mayor: nombre, apellido, telefono, correo electronico, dni, pais, localidad, calle
    //datos salud: enfermedad ?, alergia?, tratamiento o medicacion?, terapia?, consultas a especialistas (neurologo, cardiologo, fisioterapeutas, etc.)
    //datos autorizacionImage: firmo el mayor a cargo?, observaciones? puede ser nulo
    //datos autorizacionSalidas: firmo el mayor a cargo?, observaciones? puede ser nulo
    //datos reglamentacion: firmo?
    // Asegúrate de que tu archivo TypeScript esté correctamente referenciado en tu HTML
    //traer los datos del alumno logeado

    const router = useRouter();
    // Para cambiar al usuario de página si no está logeado

    //region useEffect
    useEffect(() => {
        if (!user) {
            const authorizeAndFetchData = async () => {
                // Primero verifico que el user esté logeado

                // Una vez autorizado obtengo los datos del user y seteo el email
                const user = await fetchUserData();
                const edad = calcularEdad(user.fechaNacimiento);
                if (edad > 17) {
                    window.location.href = "/usuario/Solicitud/Inscripcion"
                }
            };
            authorizeAndFetchData();
        };
    }, [user]);
    useEffect(() => {
        if (!user) {
            const authorizeAndFetchData = async () => {
                // Primero verifico que el user esté logeado
                await autorizarUser(router);
                // Una vez autorizado obtengo los datos del user y seteo el email

                const user = await fetchUserData();


                const responsable = await getResponsableByAlumnoId(user?.id);
                if (user) {
                    setUser(user);
                    let direccion, localidad, provincia, pais;
                    if (user.direccionId) {
                        direccion = await getDireccionCompleta(user.direccionId);
                        console.log("DIRECCION::::", direccion)
                        localidad = direccion?.localidad;
                        provincia = localidad?.provincia;
                        pais = provincia?.nacionalidad;
                    }

                    //cargo los datos del menor obtenidos del usuario
                    setDatosMenor({
                        ...datosMenor,
                        nombre: user.nombre,
                        apellido: user.apellido,
                        fechaNacimiento: new Date(user.fechaNacimiento).toISOString().split('T')[0],
                        correoElectronico: user.email,
                        dni: Number(user.dni),
                        pais: pais?.nombre || '',
                        provincia: provincia?.nombre || '',
                        localidad: localidad?.nombre || '',
                        calle: direccion?.calle || '',
                        numero: Number(direccion?.numero),
                    });

                    if (typeof (responsable) !== "string" && responsable) {

                        //datos del responsable
                        setDatosMayor({
                            ...datosMayor,
                            nombre: responsable.nombre,
                            apellido: responsable.apellido,
                            telefono: Number(responsable.telefono),
                            correoElectronico: responsable.email,
                            dni: Number(responsable.dni),
                            pais: pais?.nombre || '',
                            provincia: provincia?.nombre || '',
                            localidad: localidad?.nombre || '',
                            calle: direccion?.calle || '',
                            numero: Number(direccion?.numero),
                        });
                    }

                }
            };

            authorizeAndFetchData();
        }
    }, [router]);

    useEffect(() => {
        if (correcto) {
            console.log("0.CARGANDO SOLICITUD")
            cargarSolicitud();
        }
    }, [correcto])


    //region validate 
    async function validatealumnoDetails() {
        const { nombre, apellido, dni, pais, provincia, localidad, calle, numero } = datosMenor || {};
        const { nombre: nombreM, apellido: apellidoM, telefono: telefonoM, correoElectronico: correoElelctronicoM, dni: dniM,
            pais: paisM, provincia: provinciaM, localidad: localidadM, calle: calleM, numero: numeroM } = datosMayor || {};

        //validar que el nombre sea de al menos 2 caracteres y no contenga números
        let resultValidate;
        if (selectedScreen === 0 && selectedCursosId.length === 0) return "Debe seleccionar al menos un taller";

        /*         if (selectedScreen === 1) {
                    resultValidate = validateNombre(nombre);
                    if (resultValidate) return resultValidate;
        
                    resultValidate = validateApellido(apellido);
                    if (resultValidate) return resultValidate;
        
                    resultValidate = validateDni(String(dni));
                    if (resultValidate) return resultValidate;
                    console.log(JSON.stringify(datosMayor))
                    resultValidate = validateDireccion(pais, provincia, localidad, String(calle), Number(numero));
                    if (resultValidate) return resultValidate
                }
        
                if (selectedScreen === 2) {
                    resultValidate = validateNombre(nombreM);
                    if (resultValidate) return resultValidate;
        
                    resultValidate = validateApellido(apellidoM);
                    if (resultValidate) return resultValidate;
        
                    resultValidate = validateEmail(correoElelctronicoM);
                    if (resultValidate) return resultValidate;
        
                    resultValidate = validateDni(String(dni));
                    if (resultValidate) return resultValidate;
        
                    if (!telefonoM) {
                        return "El teléfono no puede estar vacío";
                    }
                    resultValidate = validatePhoneNumber(String(telefonoM));
                    if (resultValidate) return resultValidate;
                    resultValidate = validateDireccion(paisM, provinciaM, localidadM, String(calleM), Number(numeroM));
                    if (resultValidate) return resultValidate
        
                    console.log(JSON.stringify(datosMayor))
                } */
        return "";
    }

    async function continuar() {

        if (selectedScreen === 0 && selectedCursosId.length === 0) return setError("Debe seleccionar al menos un taller");
        const err = await validatealumnoDetails();
        if (err != "") return setError(String(err));
        setSelectedScreen(selectedScreen + 1)
        setStep({ ...steps, currentStep: steps.currentStep + 1 });
    }
    //carga de datos post confirmación
    async function cargarSolicitud() {
        if (datosReglamentacion.firma.length < 1 && selectedScreen === 3) return setError("Debe firmar la reglamentación");
        //crear solicitud
        const solicitud = await createSolicitud()

        //console.log("ALUMNO::::", alumno)
        //crear ubicaciones del mayor/responsable
        //crear responsable del menor
        // console.log("datosMayor", datosMayor)
        const alumno = user

        //console.log("RESPONSABLE::::", responsable)

        //si alumno es un string es un error
        if (typeof alumno === "string") return setError(alumno)

        //crear solicitud menor
        await createSolicitudMenores({
            solicitudId: solicitud.id,
            alumnoId: Number(user?.id),
            enfermedad: datosSalud.enfermedad,
            alergia: datosSalud.alergia,
            medicacion: datosSalud.tratamiento,
            terapia: datosSalud.terapia,
            especialista: datosSalud.consultasEspecialistas,
            motivoAsistencia: datosSalud.motivoInscripcion,
            firmaUsoImagenes: datosAutorizacionImage.firma.length > 0 ? `${user?.nombre} ${user?.apellido}` : "",
            observacionesUsoImagenes: datosAutorizacionImage.observaciones,
            firmaSalidas: datosAutorizacionSalidas.firma.length > 0 ? `${user?.nombre} ${user?.apellido}` : "",
            observacionesSalidas: datosAutorizacionSalidas.observaciones,
            firmaReglamento: datosReglamentacion.firma
        })


        //console.log("SOLIMenor::::", soliMenor)
        //        console.log("X:::::",x)
        //crear curso solicitud y alumno_curso
        for (let i = 0; i < selectedCursosId.length; i++) {
            await createCursoSolicitud({
                "cursoId": selectedCursosId[i],
                "solicitudId": solicitud.id,
            })
        }
        /* setCorrecto(false)
        setVerifi(false) */
        window.location.href = "/usuario/principal"

    }
    //region return
    return (

        <main className="flex flex-col min-h-screen">
            <Navigate />
            <div className='p-4  mt-5'>
                <h3 className='p-2 shadow-md w-60'>Inscripción a talleres - Menores</h3>
            </div>
            <div className="max-w-full mx-auto px-4 md:px-8 mb-5">
                <div className="w-full md:max-w-2xl mx-auto px-4 md:px-0 mb-5">
                    <Stepper steps={steps.stepsItems} currentStep={selectedScreen + 1} className='' />
                </div>
            </div>
            <div id='miDiv' style={{ height: "auto" }}>
                {selectedScreen === 0 && (
                    (user) ? (
                        <SeleccionTaller
                            edad={calcularEdad(user.fechaNacimiento)}
                            setSelectedCursosId={setSelectedCursosId}
                            selectedCursosId={selectedCursosId}
                            alumnoId={user.id}
                        />
                    ) :
                        <div className=' w-full justify-center items-center align-middle flex'>
                            <Loader />
                        </div>

                )}
                {selectedScreen === 1 && (
                    <DatosAlumno
                        datosMenor={datosMenor}
                        datosMayor={datosMayor}
                    />
                )}
                {selectedScreen === 2 && (
                    <CondicionSalud
                        setDatosSalud={setDatosSalud}
                    />
                )}
                {selectedScreen === 3 && (
                    <AutorizacionImg
                        setDatosAutorizacionImage={setDatosAutorizacionImage}
                    />
                )}
                {selectedScreen === 4 && (
                    <AutorizacionSalidas
                        setDatosAutorizacionSalidas={setDatosAutorizacionSalidas}
                    />
                )}
                {selectedScreen === 5 && (
                    <Reglamentacion
                        setDatosReglamentacion={setDatosReglamentacion}
                    />
                )}
                {selectedScreen === 0 && user && (
                    <div className='p-5 w-full'>
                        <div className='flex justify-center gap-8 md:gap-16'>
                            <button
                                className='group flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl'
                                onClick={() => {
                                    selectedScreen - 1 < 0
                                        ? window.location.href = "/usuario/Solicitud/Inscripcion"
                                        : (setSelectedScreen(selectedScreen - 1), setStep({ ...steps, currentStep: steps.currentStep - 1 }));
                                }}
                            >
                                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                                Volver
                            </button>
                            <button
                                className='group flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl'
                                onClick={() => { continuar(); }}
                            >
                                Continuar
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </button>
                        </div>
                    </div>
                )}
                {(selectedScreen < 5 && selectedScreen !== 0) && (
                    <div className='p-5 w-full'>
                        <div className='flex justify-center gap-8 md:gap-16'>
                            <button
                                className='group flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl'
                                onClick={() => {
                                    selectedScreen - 1 < 0
                                        ? window.location.href = "/usuario/Solicitud/Inscripcion"
                                        : (setSelectedScreen(selectedScreen - 1), setStep({ ...steps, currentStep: steps.currentStep - 1 }));
                                }}
                            >
                                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                                Volver
                            </button>
                            <button
                                className='group flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl'
                                onClick={() => { continuar(); }}
                            >
                                Continuar
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </button>
                        </div>
                    </div>
                )}

                {selectedScreen === 5 && (
                    <div className='p-5 w-full'>
                        <div className='flex justify-center gap-8 md:gap-16'>
                            <button
                                className='group flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl'
                                onClick={() => {
                                    setSelectedScreen(selectedScreen - 1);
                                    setStep({ ...steps, currentStep: steps.currentStep - 1 })
                                }}
                            >
                                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                                Volver
                            </button>
                            <button
                                className='group flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl'
                                onClick={() => {
                                    if (datosReglamentacion.firma.length < 1) {
                                        return setError("Debe firmar la reglamentación");
                                    }
                                    setVerificarEmail(true);
                                }}
                            >
                                Enviar
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </button>
                        </div>
                    </div>
                )}

            </div>
            {verificarEmail && (
                <div className="fixed inset-0 flex items-center justify-center bg-slate-100/80">
                    <div className="bg-slate-100 rounded-md shadow-md p-4">
                        <EmailPage email={user.email} setCorrecto={setCorrecto} correcto={correcto} setVerificarEmail={setVerificarEmail} />
                    </div>
                </div>
            )}
            {error != '' && <div className="fixed inset-0 flex items-center justify-center bg-black/50">
                <div className="bg-white border p-4 rounded-md shadow-md w-96">
                    <h2 className="text-lg font-bold text-red-600 mb-2">Error</h2>
                    <p className="text-sm text-red-700 mb-4">{error}</p>
                    <div className="flex justify-end space-x-2">
                        <button
                            className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                            onClick={() => setError('')}
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>}

            <footer className="bg-sky-600 mt-auto border-t w-full">
                <But_aside />
            </footer>
        </main>
    )
}
export default Menores;