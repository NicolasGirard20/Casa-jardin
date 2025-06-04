"use client"
import React, { useState, useEffect, use } from 'react';
import But_aside from "../../../../components/but_aside/page";
import Navigate from '../../../../components/alumno/navigate/page';
import AutorizacionImg from './componentes/autorizacionImagen';
import Reglamentacion from './componentes/reglamentacion';
import SeleccionTaller from './componentes/seleccionTaller';
import DatosAlumno from './componentes/datosAlumno';
import EmailPage from '../email/EmailPage';
import { addDireccion, getDireccionById, getDireccionCompleta } from '@/services/ubicacion/direccion';
import { createSolicitudMayor } from '@/services/Solicitud/SolicitudMayor';
import { createSolicitud } from '@/services/Solicitud/Solicitud';
import { useRouter } from 'next/navigation';
import { autorizarUser, fetchUserData } from '@/helpers/cookies';
import { getCursosByIdAlumno } from '@/services/alumno_curso';
import { createCursoSolicitud } from '@/services/curso_solicitud';
import { calcularEdad } from '@/helpers/fechas';
import { validateApellido, validateDireccion, validateDni, validateEmail, validateNombre, validatePhoneNumber } from '@/helpers/validaciones';
import Loader from '@/components/Loaders/loader/loader';
import { Stepper } from '@/components/alumno/stepper';
import { ArrowLeft, ArrowRight } from 'lucide-react';

//region UseState
const Mayores: React.FC = () => {

  // Estado para almacenar la pantalla actual
  const [selectedScreen, setSelectedScreen] = useState<number>(0);
  // Estado para almacenar los cursos seleccionados
  const [selectedCursosId, setSelectedCursosId] = useState<number[]>([]);

  const [datosAlumno, setDatosAlumno] = useState({
    nombre: "",
    apellido: "",
    telefono: 0,
    fechaNacimiento: new Date().toISOString().split('T')[0],
    correoElectronico: "",
    dni: 0,
    pais: "",
    provincia: "",
    localidad: "",
    calle: "",
    numero: 0,
  });

  const [datosAutorizacionImage, setDatosAutorizacionImage] = useState({
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
    stepsItems: ["Talleres", "Datos alumno", "Uso de Imagen", "Reglamentación"],
    currentStep: 1
  })

  //region useEffect
  useEffect(() => {
    if (!user) {
      const authorizeAndFetchData = async () => {
        // Primero verifico que el user esté logeado

        // Una vez autorizado obtengo los datos del user y seteo el email

        const user = await fetchUserData();
        const edad = calcularEdad(user.fechaNacimiento);
        if (edad < 18) {
          window.location.href = "/usuario/Solicitud/Inscripcion"
        }
      };
      authorizeAndFetchData();
    };
  }, [user]);
  const router = useRouter();
  // Para cambiar al usuario de página si no está logeado
  useEffect(() => {
    if (!user) {
      const authorizeAndFetchData = async () => {
        // Primero verifico que el user esté logeado
        //console.log("router", router);
        await autorizarUser(router);
        // Una vez autorizado obtengo los datos del user y seteo el email
        const user = await fetchUserData();
        console.log("user", user);
        if (user) {
          setUser(user);
        }
      };

      authorizeAndFetchData();
    }
  }, [router]);

  useEffect(() => {
    if (correcto) {
      console.log("0.CARGANDO SOLICITUD")
      cargarSolicitud();
      //setVerificarEmail(false);

    }
  }, [correcto])

  useEffect(() => {
    if (user) {
      const cargarAlumno = async () => {
        /* const direccion = await getDireccionById(Number(user.direccionId))
        const localidad = await getLocalidadById(Number(direccion?.localidadId))
        const provincia = await getProvinciasById(Number(localidad?.provinciaId))
        const pais = await getPaisById(Number(provincia?.nacionalidadId))
*/
        let direccion, localidad, provincia, pais;
        if (user.direccionId) {
          direccion = await getDireccionCompleta(user.direccionId);
          
          localidad = direccion?.localidad;
          provincia = localidad?.provincia;
          pais = provincia?.nacionalidad;
        }
        console.log("direccion", direccion?.localidad.nombre)
        setDatosAlumno({
          nombre: user.nombre,
          apellido: user.apellido,
          telefono: user.telefono,
          correoElectronico: user.email,
          fechaNacimiento: new Date(user.fechaNacimiento).toISOString().split('T')[0],
          dni: user.dni,
          pais: pais?.nombre || "",
          provincia: provincia?.nombre || "",
          localidad: (localidad?.nombre) || "",
          calle: direccion?.calle || "",
          numero: direccion?.numero || 0,
        })
      }
      cargarAlumno()
    }
  }, [user])


  //region validate 
  async function validatealumnoDetails() {
    const { nombre, apellido, telefono, dni, correoElectronico,
      pais, provincia, localidad, calle, numero } = datosAlumno || {};

    //validar que el nombre sea de al menos 2 caracteres y no contenga números
    let resultValidate;
    if (selectedScreen === 0 && selectedCursosId.length === 0) return "Debe seleccionar al menos un taller";

    /*         if (selectedScreen === 1) {
                resultValidate = validateNombre(nombre);
                if (resultValidate) return resultValidate;
    
                resultValidate = validateApellido(apellido);
                if (resultValidate) return resultValidate;
    
                resultValidate = validateEmail(correoElectronico);
                if (resultValidate) return resultValidate;
    
                resultValidate = validateDni(String(dni));
                if (resultValidate) return resultValidate;
    
                if (!telefono) {
                    return "El teléfono no puede estar vacío";
                }
                resultValidate = validatePhoneNumber(String(telefono));
                if (resultValidate) return resultValidate;
    
                resultValidate = validateDireccion(pais, provincia, localidad, String(calle), Number(numero));
                if (resultValidate) return resultValidate
            } */

    return "";
  }

  async function continuar() {

    if (selectedScreen === 0 && selectedCursosId.length === 0) return setError("Debe seleccionar al menos un taller");
    const err = await validatealumnoDetails();
    if (err != "") return setError(String(err));
    setSelectedScreen(selectedScreen + 1)
    setStep({ ...steps, currentStep: steps.currentStep + 1 });
    //console.log("selectedScreen::::", selectedScreen)
  }


  async function cargarSolicitud() {
    // console.log("CARGANDO SOLICITUD")
    //crear solicitud
    const solicitud = await createSolicitud()


    //crear solicitud mayor
    await createSolicitudMayor({
      alumnoId: Number(user?.id),
      solicitudId: solicitud.id,
      firmaUsoImagenes: datosAutorizacionImage.firma.length > 0 ? `${user?.nombre} ${user?.apellido}` : "",
      observacionesUsoImagenes: datosAutorizacionImage.observaciones,
      firmaReglamento: `${user?.nombre} ${user?.apellido}`,
    });

    // console.log("SoliciMayor:::::", x)
    //crear curso solicitud y alumno_curso
    for (let i = 0; i < selectedCursosId.length; i++) {
      await createCursoSolicitud({
        "cursoId": selectedCursosId[i],
        "solicitudId": solicitud.id,
      })
      /*             console.log("X:::::", x)
                  console.log("Y:::::", y) */
    }
    /* setCorrecto(false)
    setVerifi(false) */
    window.location.href = "/usuario/principal"
  }
  //region return
  return (
    <main className="flex flex-col min-h-screen">
      <Navigate />
      <div className='p-4 mt-5'>
        <h3 className='p-2 shadow-md w-60'>Inscripción a talleres - Mayores</h3>
      </div>
            <div className="max-w-full mx-auto px-4 md:px-8 mb-5">
                <div className="w-full md:max-w-2xl mx-auto px-4 md:px-0 mb-5">
                    <Stepper steps={steps.stepsItems} currentStep={selectedScreen + 1} className='' />
                </div>
            </div>
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-4">
          {selectedScreen === 0 && (
            (user) ? (
              <SeleccionTaller
                edad={calcularEdad(user.fechaNacimiento)}
                setSelectedCursosId={setSelectedCursosId}
                selectedCursosId={selectedCursosId}
                alumnoId={user.id}
              />
            ) : (
              <div className='w-full justify-center items-center align-middle flex'>
                <Loader />
              </div>
            )
          )}

          {selectedScreen === 1 && (
            <DatosAlumno
              setDatosAlumno={setDatosAlumno}
              datosAlumno={datosAlumno}
              setError={setError}
            />
          )}

          {selectedScreen === 2 && (
            <AutorizacionImg
              setDatosAutorizacionImage={setDatosAutorizacionImage}
            />
          )}

          {selectedScreen === 3 && (
            <Reglamentacion
              setDatosReglamentacion={setDatosReglamentacion}
            />
          )}
        </div>

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

        {(selectedScreen < 3 && selectedScreen !== 0) && (
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

        {selectedScreen === 3 && (
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
  );
}
export default Mayores;