"use client"
import React, {useState, useEffect } from 'react';
import Background from "../../../../public/Images/BackgroundSolicitudes.jpg";
import But_aside from "../../../components/but_aside/page";
import Navigate from "../../../components/alumno/navigate/page";
import withAuthUser from "../../../components/alumno/userAuth";
import { useRouter } from 'next/navigation';
import { autorizarUser, fetchUserData } from '@/helpers/cookies';
import Loader from '@/components/Loaders/loader/loader';
//helper de direccion
import { getDireccionSimple } from '@/helpers/direccion';
//helper para calcular edad
import { calcularEdad } from '@/helpers/fechas';
//para formulario de alumno
import AlumnoForm from '@/components/formularios/alumnoForm';
//para formulario del responable
import ResponsableForm from '@/components/formularios/responsableForm';
import { getResponsableByAlumnoId } from '@/services/responsable';
import { AlertCircle, CheckCircle, Smile, User2 } from 'lucide-react';

type Usuario = {
    id: number;
    direccion?: Direccion;
    nombre: string;
    apellido: string;
    dni: number | null;
    telefono: string | null;
    email: string;
    direccionId: number;
    fechaNacimiento: string;
    rolId: number;
};

type Direccion = {
    pais: "Argentina"
    provincia: string;
    localidad: string;
    calle: string;
    numero: number;
}

type Responsable = {
    id: number;
    alumnoId: number;
    nombre: string;
    apellido: string;
    dni: number;
    telefono: string;
    email: string;
    direccionId: number | null
    direccion?: Direccion;
}

const Cuenta: React.FC = () => {
    //region UseStates
    
    // Estado para almacenar los datos del usuario, inicialmente nulo
    const [user, setUser] = useState<Usuario>();

    //para saber si es mayor de edad, si es menor debe cargar responsable
    const [mayoriaEdad, setMayoriaEdad] = useState<boolean>(false);

    //estados de carga
    const [loading, setLoading] = useState<boolean>(false);
    const [editarUser, setEditarUser] = useState<boolean>(false); //para abrir el formulario de user
    const [cambiosUser, setCambiosUser] = useState<boolean>(false); //si hay cambios, para despues volver a fetchearlo
    const [editarResponsable, setEditarResponsable] = useState<boolean>(false);  //para abrir el formulario de responsable
    const [cambiosResponsable, setCambiosResponsable] = useState<boolean>(false); //si hay cambios, para despues volver a fetchearlo
    
    //para cargar el responsable
    const [responsable, setResponsable] = useState<Responsable | null>(null);
    //endregion

    const router = useRouter();
    
    //region UseEffects
    // Para cambiar al usuario de página si no está logeado
    useEffect(() => {
        setLoading(true);
        authorizeAndFetchData();
    }, []);

    // Función para obtener los datos del usuario
    const authorizeAndFetchData = async () => {
        // Primero verifico que el user esté logeado
        await autorizarUser(router);
        // Una vez autorizado obtengo los datos del user y seteo el email
        const user = await fetchUserData();
        //console.log("user", user);
        setUser(user)
        if (!user) return;
        console.log("flag user", user);
        const edad = calcularEdad(user.fechaNacimiento);
        console.log("flag edad", edad);
        if (edad >= 18) setMayoriaEdad(true);
        //si es menor traigo los datos de su responsable
        else {
            console.log("menor de edad");
            setMayoriaEdad(false);
            const r = await getResponsableByAlumnoId(user.id);
            console.log("responsable", responsable);
            if (r && r.direccionId) {
              const direccion = await getDireccionSimple(r.direccionId);
              setResponsable({
                  ...r,
                  direccion: {
                      pais: "Argentina",
                      provincia: direccion?.provincia || "",
                      localidad: direccion?.localidad || "",
                      calle: direccion?.calle || "",
                      numero: direccion?.numero || 0,
                  },
              });
          } else {
              setResponsable(r);
          }
        }
        //cargar direccion en user
        if(user.direccionId){
            const direccion = await getDireccionSimple(user.direccionId);
            setUser({...user, direccion: {...direccion, pais: "Argentina"}});
        }
        console.log("---------> edad", edad)
        console.log("mayoria edad:", mayoriaEdad);
        setLoading(false);
    };

    // Para actualizar los datos del usuario y del responsable si hubieron cambios
    useEffect(() => {
        //si hay cambios en el usuario
        if(cambiosUser) onUserUpdate();
    }, [cambiosUser]);

    useEffect(() => {
        //si hay cambios en el responsable
        if(cambiosResponsable) onResponsableUpdate();
    }, [cambiosResponsable]);
    //endregion

    //region Funciones
    const onUserUpdate = async () => {
        setLoading(true);
        if(!user) return
        const u = await fetchUserData();
        setUser(u);
        if(u.direccionId){
            const direccion = await getDireccionSimple(u.direccionId);
            setUser({...u, direccion: direccion});
        }
        setCambiosUser(false);
        setLoading(false);
    }

    const onResponsableUpdate = async () => {
        setLoading(true);
        if(!user) return 
        const r = await getResponsableByAlumnoId(user.id);
            console.log("responsable", responsable);
            if(!r) return
            if(r.direccionId){
                const direccion = await getDireccionSimple(r.direccionId);
                setResponsable({
                  ...r,
                  direccion: {
                      pais: "Argentina",
                      provincia: direccion?.provincia || "",
                      localidad: direccion?.localidad || "",
                      calle: direccion?.calle || "",
                      numero: direccion?.numero || 0,
                  },
              });
            }
            else{setResponsable(r);}

        //
        setCambiosResponsable(false);
        setLoading(false);
    }
    //endregion

// Helpers para obtener los campos vacíos y mostrarlos en la alerta
const getEmptyUserFields = (user: Usuario, mayoriaEdad: boolean) => {
  const emptyFields = []
  if (!user?.nombre) emptyFields.push("Nombre")
  if (!user?.apellido) emptyFields.push("Apellido")
  if (!user?.email) emptyFields.push("Email")
  if (!user?.fechaNacimiento) emptyFields.push("Fecha de Nacimiento")
  if (!user?.dni) emptyFields.push("DNI")
  if (mayoriaEdad && !user?.telefono) emptyFields.push("Teléfono")
  if (
    !user?.direccion?.pais ||
    !user?.direccion?.provincia ||
    !user?.direccion?.localidad ||
    !user?.direccion?.calle ||
    !user?.direccion?.numero
  )
    emptyFields.push("Dirección completa")
  return emptyFields
}

const getEmptyResponsableFields = (responsable: Responsable | undefined | null) => {
  const emptyFields = []
  if(mayoriaEdad) return []
  if(!responsable) return ["No hay responsable cargado"]
  if (!responsable?.nombre) emptyFields.push("Nombre del Responsable")
  if (!responsable?.apellido) emptyFields.push("Apellido del Responsable")
  if (!responsable?.dni) emptyFields.push("DNI del Responsable")
  if (!responsable?.email) emptyFields.push("Email del Responsable")
  if (!responsable?.telefono) emptyFields.push("Teléfono del Responsable")
  if (
    !responsable?.direccion?.pais ||
    !responsable?.direccion?.provincia ||
    !responsable?.direccion?.localidad ||
    !responsable?.direccion?.calle ||
    !responsable?.direccion?.numero
  )
    emptyFields.push("Dirección completa del Responsable")
  return emptyFields
}

//forma de mostrar los campos vacios
const userEmptyFields = user ? getEmptyUserFields(user, mayoriaEdad) : []
const responsableEmptyFields = getEmptyResponsableFields(responsable)
//esta es la lista que se usa dentro del return
const allEmptyFields = [...userEmptyFields, ...responsableEmptyFields]

//region Return
  return (
    <div className="flex flex-col min-h-screen">
      <main
        className="flex-grow min-h-[98vh] relative bg-gray-50 overflow-auto bg-cover bg-center"
        /* style={{ backgroundImage: `url(${Background.src})` }} */
      >
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-sky-50 to-gray-100" />
        <div className="fixed justify-between w-full z-10">
          <Navigate />
        </div>

        {/* Datos */}
        <div className="pt-24 px-4 pb-40 max-w-7xl mx-auto">
          <h1 className="text-3xl mt-5 font-bold text-gray-900 text-center mb-8">Datos del Estudiante</h1>

          {/* Alertas */}
          {(allEmptyFields.length > 0 && !loading) && (
            <div className="mb-8 px-6 py-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2 text-amber-800">
                <AlertCircle className="w-5 h-5 mt-0.5" />
                <div>
                  <p className="font-medium">Debes completar  los siguentes datos para poder inscribirte a un taller:</p>
                  <ul className="list-disc list-inside mt-2">
                    {allEmptyFields.map((field, index) => (
                      <li key={index} className="text-sm">
                        {field}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
          {(allEmptyFields.length === 0 && !loading) && (
            <div className="mb-8 px-6 py-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-2 text-green-800">
                <CheckCircle className="w-5 h-5 mt-0.5" />
                <div>
                  <p className="font-medium">Ya puedes inscribirte en los talleres!</p>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <Loader />
              <p className="text-gray-600 font-medium">Cargando datos del estudiante...</p>
            </div>
          ) : (
            <div className={`grid gap-8 ${mayoriaEdad ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
              {/* Datos del alumno */}
              <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden h-fit">
                <div className="px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-white flex items-center">
                    <Smile className="w-6 h-6 inline-block mr-2" />
                    Información Personal
                  </h2>
                  <button
                    onClick={() => setEditarUser(true)}
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-1 focus:ring-offset-green-600"
                  >
                    Editar Mis Datos
                  </button>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-500">Nombre</label>
                        <p className="text-gray-900 ">{user?.nombre ? user.nombre : "-"}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-500">Apellido</label>
                        <p className="text-gray-900">{user?.apellido ? user.apellido : "-"}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-500">Email</label>
                        <p className="text-gray-900  ">{user?.email ? user.email : "-"}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-500">Fecha de Nacimiento</label>
                        <p className="text-gray-900">{user?.fechaNacimiento?.split('T')[0] ? user.fechaNacimiento.split('T')[0] : "-"}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-500">DNI</label>
                        <p className="text-gray-900">{user?.dni ? user.dni : "-"}</p>
                      </div>
                      {mayoriaEdad && (
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-500">Teléfono</label>
                          <p className="text-gray-900">{user?.telefono ? user.telefono : "-"}</p>
                        </div>
                      )}
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-500">Dirección</label>
                        <p className="text-gray-900">
                          {user?.direccion?.pais ? `${user.direccion.pais}, ` : "-"}
                          {user?.direccion?.provincia ? `${user.direccion.provincia}, ` : "-"}
                          {user?.direccion?.localidad ? `${user.direccion.localidad}, ` : "-"}
                          {user?.direccion?.calle ? `${user.direccion.calle}, ` : "-"}
                          {user?.direccion?.numero || "-"}
                        </p>
                      </div>
                </div>
              </div>

              {/* Datos del responsable */}
              {!mayoriaEdad && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-fit">
                  <div className="px-6 py-4 bg-gradient-to-r from-yellow-600 to-yellow-700 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-white flex items-center">
                      <User2 className="w-6 h-6 inline-block mr-2" />
                      Información del Responsable
                    </h2>
                    <button
                      onClick={() => setEditarResponsable(true)}
                      className="inline-flex items-center px-4 py-2 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-1 focus:ring-offset-yellow-600"
                    >
                      Editar Responsable
                    </button>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-500">Nombre</label>
                        <p className="text-gray-900">{responsable?.nombre ? responsable.nombre : "-"}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-500">Apellido</label>
                        <p className="text-gray-900">{responsable?.apellido ? responsable.apellido : "-"}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-500">DNI</label>
                        <p className="text-gray-900">{responsable?.dni ? responsable.dni : "-"}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-500">Email</label>
                        <p className="text-gray-900">{responsable?.email ? responsable.email : "-"}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-500">Teléfono</label>
                        <p className="text-gray-900">{responsable?.telefono ? responsable.telefono : "-"}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-500">Dirección</label>
                        <p className="text-gray-900">
                          {responsable?.direccion?.pais ? `${responsable.direccion.pais}, ` : "-"}
                          {responsable?.direccion?.provincia ? `${responsable.direccion.provincia}, ` : "-"}
                          {responsable?.direccion?.localidad ? `${responsable.direccion.localidad}, ` : "-"}
                          {responsable?.direccion?.calle ? `${responsable.direccion.calle}, ` : "-"}
                          {responsable?.direccion?.numero || "-"}
                        </p>
                      </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Formularios */}
        {editarUser && user && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6">
              <h3 className="text-xl font-semibold mb-4">Editar Información</h3>
              <AlumnoForm alumno={user} setEditar={setEditarUser} setChanged={setCambiosUser} mayor={mayoriaEdad} />
            </div>
          </div>
        )}

        {editarResponsable && !mayoriaEdad && user && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6">
              <h3 className="text-xl font-semibold mb-4"> {responsable ? "Editar Responsable" : "Cargar Responsable"}</h3>
              <ResponsableForm
                responsable={responsable}
                setEditar={setEditarResponsable}
                setChanged={setCambiosResponsable}
                alumnoId={user.id}
              />
            </div>
          </div>
        )}
      </main>

      <But_aside />
    </div>
  )
}
export default withAuthUser(Cuenta);
//endregion