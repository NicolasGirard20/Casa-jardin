"use client"
//region imports
import Image from "next/image";
import { useEffect, useState } from "react";
import Navigate from "@/components/Admin/navigate/page";
import withAuth from "@/components/Admin/adminAuth";
import { SolicitudMayor } from "@/services/Solicitud/SolicitudMayor";
import { deleteSolicitud, Solicitud, } from "@/services/Solicitud/Solicitud";
import { SolicitudMenores } from "@/services/Solicitud/SolicitudMenor";
import Background from "../../../../public/Images/BackgroundSolicitudes.jpg";
import Loader from "@/components/Loaders/loader/loader";


//nuevas llamadas
import { getSolicitudesCompletas } from "@/services/Solicitud/Solicitud";


//front
import { Smile, Baby, XCircle, AlertTriangle, Loader2 } from "lucide-react";
import { DashboardCard } from "@/components/varios/DashboardCard";
import SolicitudMayoresCard from "@/components/Admin/solicitudes/SolicitudMayoresCard";
import SolicitudMenoresCard from "@/components/Admin/solicitudes/SolicitudMenoresCard";
import { SolicitudEmailForm } from "@/components/Admin/solicitudes/solicitudEmailForm";
import FeedbackCard from "@/components/alumno/solicitudes/feedBackCard";

// para la tabla
import { SolicitudData, createColumns } from "@/components/Admin/solicitudes/column";
import { DataTable } from "@/components/Admin/solicitudes/data-table";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";


//region useState
const solicitudPage: React.FC = () => {
    // Estado para almacenar las solicitudes de mayores
    const [solicitudesMayores, setSolicitudesMayores] = useState<SolicitudMayor[]>([]);
    // Estado para almacenar las solicitud de menores
    const [solicitudesMenores, setSolicitudesMenores] = useState<SolicitudMenores[]>([]);
    // Estado para almacenar las solicitudes todas
    const [solicitudes, setSolicitudes] = useState<any[]>([]);
    // Estado para habilitar solicitudes de mayores
    const [habilitarMayores, setHabilitarMayores] = useState<boolean>(false);
    // Estado para habilitar solicitudes de menores
    const [habilitarMenores, setHabilitarMenores] = useState<boolean>(false);

    const [firmaUsoImagenes, setFirmaUsoImagenes] = useState<string>("");
    const [observacionesUsoImagenes, setObservacionesUsoImagenes] = useState<string>("");
    const [firmaReglamento, setFirmaReglamento] = useState<string>("");


    const [alumnosMayores, setAlumnosMayores] = useState<any[]>()
    const [alumnosMenores, setAlumnosMenores] = useState<any[]>()
    const [responsables, setResponsables] = useState<any[]>()
    const [loading, setLoading] = useState<boolean>(true);

    //para las solicitudes no leidas
    const [soliMayoresNoLeidas, setSoliMayoresNoLeidas] = useState<number>(0);
    const [soliMenoresNoLeidas, setSoliMenoresNoLeidas] = useState<number>(0);

    //para las solicitudes filtradas
    const [mayoresColData, setMayoresColData] = useState<SolicitudData[]>([]);
    const [menoresColData, setMenoresColData] = useState<SolicitudData[]>([])

    //para almacenar los cursos que trae la llamada
    const [cursos, setCursos] = useState<any[]>([]);

    //para cuando se selecciona una solicitud
    const [mayor, setMayor] = useState<boolean>(false);
    const [leida, setLeida] = useState<boolean>(false);
    const [solicitudIdSelected, setSolicitudIdSelected] = useState<number>(0);
    const [alumnoSelected, setAlumnoSelected] = useState<any>(null);
    const [responsableSelected, setResponsableSelected] = useState<any>();
    const [cursosSelected, setCursosSelected] = useState<any[]>([]);
    const [showSelect, setShowSelect] = useState(false);
    const [solicitudSelectedData, setSolitudSelectedData] = useState<any>(null);

    //para el ultimo componente, que abre el modal para accept o reject
    const [manejarSolitud, setManejarSolicitud] = useState<boolean>(false);
    const [aceptar, setAceptar] = useState<boolean>(false);

    //para el modal de confirmacion de eliminacion
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [solicitudToDelete, setSolicitudToDelete] = useState<number | null>(null);


    //region useEffect
    useEffect(() => {
        const fetchDataIfNeeded = async () => {
            setLoading(true);
            if (solicitudes.length === 0) {
                await fetchData();
            }

            setLoading(false);
        };
        fetchDataIfNeeded();
    }, []);

    useEffect(() => {
        if (solicitudes) {
            contarSolicitudesNoLeidas();
        }
    }, [solicitudesMayores, solicitudesMenores]);

    // Bloquear desplazamiento cuando los modales están activos
    useEffect(() => {
        if (habilitarMayores || habilitarMenores) {
            document.body.classList.add("overflow-hidden");
        } else {
            document.body.classList.remove("overflow-hidden");
        }
        return () => {
            document.body.classList.remove("overflow-hidden");
        };
    }, [habilitarMayores, habilitarMenores]);

    //region funciones
    const fetchData = async () => {
        //hago la llamada a la base de datos
        const data = await getSolicitudesCompletas();
        console.log("DATA", data);
        //despues de obtener los datos, guardo los useStates correspondientes
        const soli: any = [];
        const soliMayores: any = [];
        const soliMenores: any = [];
        const alumnosMay: any = [];
        const alumnosMen: any = [];
        const responsables: any = [];
        const curs: any = [];
        const solicitudAlumnoMapping: { [key: number]: any } = {};

        data.forEach((solicitud) => {
            soli.push({
                //esto se utiliza para las columnas de la tabla
                id: solicitud.id,
                leida: solicitud.leida,
                cursoSolicitud: solicitud.cursoSolicitud,
            });

            //esto ya es para para los datos de las solicitudes 
            if (solicitud.solicitudMayores) {
                soliMayores.push(solicitud.solicitudMayores);
                alumnosMay.push(solicitud.solicitudMayores.alumno);
                solicitudAlumnoMapping[solicitud.solicitudMayores.alumno.id] = solicitud.solicitudMayores.alumno;
            }

            if (solicitud.solicitudMenores) {
                soliMenores.push(solicitud.solicitudMenores);
                alumnosMen.push(solicitud.solicitudMenores.alumno);
                if (solicitud.solicitudMenores.alumno.responsable) {
                    responsables.push(solicitud.solicitudMenores.alumno.responsable);
                }
                solicitudAlumnoMapping[solicitud.solicitudMenores.alumno.id] = solicitud.solicitudMenores.alumno;
            }
            curs.push(solicitud.cursoSolicitud);
        });

        console.log("1 SOLICITUDES", soli);
        console.log("2 SOLICITUDES MAYORES", soliMayores);
        console.log("3 SOLICITUDES MENORES", soliMenores);
        console.log("4 ALUMNOS MAYORES", alumnosMay);
        console.log("5 ALUMNOS MENORES", alumnosMen);
        console.log("6 RESPONSABLES", responsables);
        console.log("7 CURSOS", curs);


        setSolicitudes(soli);
        setSolicitudesMayores(soliMayores);
        setSolicitudesMenores(soliMenores);
        setAlumnosMayores(alumnosMay);
        setAlumnosMenores(alumnosMen);
        setResponsables(responsables);
        setCursos(curs)

        const mayoresData = soliMayores.map((solicitud: any) => {
            const s = soli.find((s: any) => s.id === solicitud.solicitudId);
            let estado = "No Leída";
            console.log("S", s);
            if (s?.leida) {
                const allAccepted = s.cursoSolicitud.every((curso: any) => curso.estado);
                const allRejected = s.cursoSolicitud.every((curso: any) => !curso.estado);
                const partiallyAccepted = s.cursoSolicitud.some((curso: any) => curso.estado);

                if (allAccepted) {
                    estado = "Aceptada";
                } else if (allRejected) {
                    estado = "Rechazada";
                } else if (partiallyAccepted) {
                    estado = "Parcialmente Aprobada";
                }
            }

            return {
                codigo: solicitud.solicitudId,
                alumno: solicitud.alumno ? solicitud.alumno.nombre + " " + solicitud.alumno.apellido : "Error: datos no disponibles",
                email: solicitud.alumno ? solicitud.alumno.email : "Error: datos no disponibles",
                estado: estado,
            };
        });

        console.log("MAYORES DATA", mayoresData);
        setMayoresColData(mayoresData);

        const menoresData = soliMenores.map((solicitud: any) => {
            const s = soli.find((s: any) => s.id === solicitud.solicitudId);
            let estado = "No Leída";


            if (s?.leida) {
                const allAccepted = s.cursoSolicitud.every((curso: any) => curso.estado);
                const allRejected = s.cursoSolicitud.every((curso: any) => !curso.estado);
                const partiallyAccepted = s.cursoSolicitud.some((curso: any) => curso.estado);

                if (allAccepted) {
                    estado = "Aceptada";
                } else if (allRejected) {
                    estado = "Rechazada";
                } else if (partiallyAccepted) {
                    estado = "Parcialmente Aprobada";
                }
            }
            return {
                codigo: solicitud.solicitudId,
                alumno: solicitud.alumno ? solicitud.alumno.nombre + " " + solicitud.alumno.apellido : "Error: datos no disponibles",
                email: solicitud.alumno ? solicitud.alumno.email : "Error: datos no disponibles",
                estado: estado,
            };
        });

        console.log("MENORES DATA", menoresData);
        setMenoresColData(menoresData);
    }

    const contarSolicitudesNoLeidas = () => {
        const solicitudesNoLeidas = solicitudes.filter((solicitud) => !solicitud.leida);
        const soliMayoresNoLeid = solicitudesNoLeidas.filter((solicitud) => solicitudesMayores.some((data) => data.solicitudId === solicitud.id));
        setSoliMayoresNoLeidas(soliMayoresNoLeid.length);
        console.log("soli mayores no leidas: ", soliMayoresNoLeid);
        const soliMenoresNoLeid = solicitudesNoLeidas.filter((solicitud) => solicitudesMenores.some((data) => data.solicitudId === solicitud.id));
        setSoliMenoresNoLeidas(soliMenoresNoLeid.length);
        console.log("soli menores no leidas: ", soliMenoresNoLeid);
    }

    const handleEliminarSolicitud = async (solicitudId: number) => {
        setSolicitudToDelete(solicitudId)
        setDeleteConfirmOpen(true);
    }

    //para que el usuario tenga que confirmar la eliminacion de una soli
    const confirmDelete = async () => {
        if (solicitudToDelete) {
            await deleteSolicitud(solicitudToDelete);
            setDeleteConfirmOpen(false);
            setSolicitudToDelete(null);
            setSolicitudIdSelected(0);
            fetchData();
        }
    }

    //creo las columnas para la tabla (las columnas de acciones)
    const handleVerDetalles = (solicitudId: number) => {
        setSolicitudIdSelected(solicitudId);
        //para tener la data de la solicitud
        const sol = solicitudesMayores.find((solicitud) => solicitud.solicitudId === solicitudId) || solicitudesMenores.find((solicitud) => solicitud.solicitudId === solicitudId);
        if (!sol) return;
        console.log("SOL", sol);
        //para tener la data del alumno
        console.log("ALUMNOSMAYORES", alumnosMayores)

        const al = alumnosMayores?.find((alumno) => alumno.id === sol.alumnoId) || alumnosMenores?.find((alumno) => alumno.id === sol.alumnoId);
        console.log("AL", al);
        if (al) {
            setAlumnoSelected(al);
        }
        //fijar los cursos
        console.log("CURSOS", cursos);
        console.log("soli id", solicitudId);
        const flatCrusos = cursos.flat();
        const curs = flatCrusos.filter((curso) => curso.solicitudId === solicitudId);

        //cambiar estado leida si es necesario
        const s = solicitudes.find((solicitud) => solicitud.id === solicitudId);
        if (s) {
            setLeida(s.leida);
        }

        console.log("CURS", curs);
        setCursosSelected(curs);
        setFirmaUsoImagenes(sol.firmaUsoImagenes ? "Uso permitido" : "Uso denegado");
        setObservacionesUsoImagenes(sol.observacionesUsoImagenes ? sol.observacionesUsoImagenes : "No hay observaciones");
        setFirmaReglamento(sol.firmaReglamento ? "Firmado" : "No firmado");
        setSolitudSelectedData(sol);
        setShowSelect(true);
    };


    const columns = createColumns(handleVerDetalles, handleEliminarSolicitud);

    //region return
    return (
        <main className=" relative   min-h-screen ">
            {/* Navegación */}
            <div className="fixed top-0 left-0 right-0 flex justify-between w-full z-20">
                <Navigate />
            </div>
            <div className="fixed inset-0 z-[-1] opacity-75 h-full w-full">
                <Image src={Background}
                    alt="Background"
                    layout="fill"
                    objectFit="cover"
                    quality={80}
                    priority={true}
                />
            </div>
            {/* Contenido principal */}
            {!habilitarMayores && !habilitarMenores && (
                <div className="flex flex-col items-center justify-center min-h-screen p-4">
                    <div className="w-full max-w-4xl  rounded-lg ">
                        <h1 className="text-4xl font-bold text-center text-slate-800 dark:text-white mb-8">
                            Panel de Solicitudes
                        </h1>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <DashboardCard
                                title="Solicitudes Mayores"
                                description={soliMayoresNoLeidas > 0 ? `${soliMayoresNoLeidas} solicitudes pendientes` : "No hay solicitudes pendientes"}
                                icon={Smile}
                                onClick={() => { setHabilitarMayores(!habilitarMayores); setMayor(true) }}
                                gradient="bg-gradient-to-r from-emerald-500 to-teal-600"
                            />
                            <DashboardCard
                                title="Solicitudes Menores"
                                description={soliMenoresNoLeidas > 0 ? `${soliMenoresNoLeidas} solicitudes pendientes` : "No hay solicitudes pendientes"}
                                icon={Baby}
                                onClick={() => { setHabilitarMenores(!habilitarMenores); setMayor(false) }}
                                gradient="bg-gradient-to-r from-purple-500 to-pink-600"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Modal for Mayores */}
            {habilitarMayores && (
                <div className="fixed pt-32 inset-0  bg-black/50 backdrop-blur-sm flex  items-center  justify-center p-4 z-10">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-6xl max-h-[85vh] overflow-y-auto ">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                            <h2 className="text-2xl font-semibold text-slate-800 dark:text-white">
                                Historial de Solicitudes Mayores
                            </h2>
                            <button
                                onClick={() => setHabilitarMayores(false)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                            >
                                <XCircle className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-slate-600 dark:text-slate-400" />
                                    <p className="mt-4 text-slate-600 dark:text-slate-400">Cargando solicitudes...</p>
                                </div>
                            ) : (
                                <div className="container mx-auto py-3 overflow-x-auto">
                                    <DataTable columns={columns} data={mayoresColData} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal for Menores */}
            {habilitarMenores && (
                <div className="fixed inset-0 pt-32 bg-black/50 backdrop-blur-sm flex items-center  justify-center p-4 ">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-6xl max-h-[85vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                            <h2 className="text-2xl font-semibold text-slate-800 dark:text-white">
                                Historial de Solicitudes Menores
                            </h2>
                            <button
                                onClick={() => setHabilitarMenores(false)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                            >
                                <XCircle className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-slate-600 dark:text-slate-400" />
                                    <p className="mt-4 text-slate-600 dark:text-slate-400">Cargando solicitudes...</p>
                                </div>
                            ) : (
                                <div className="container mx-auto py-10 overflow-x-auto">
                                    <DataTable columns={columns} data={menoresColData} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showSelect && (
                <div className="fixed bg-black/50 backdrop-blur-sm inset-0 flex items-center justify-center p-4 z-30">
                    <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                        <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b">
                            <h1 className="text-2xl font-semibold text-gray-900">Detalles de la solicitud</h1>
                            <button
                                className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
                                onClick={() => setShowSelect(false)}
                            >
                                <XCircle className="w-6 h-6 text-gray-500 hover:text-red-600" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
                            {leida && (
                                <div className="mb-6 border-b-2 border-slate-200">
                                    <FeedbackCard
                                        cursoSolicitud={solicitudes.find(
                                            (solicitud: any) => solicitud.id === solicitudIdSelected
                                        )?.cursoSolicitud}
                                    />
                                </div>
                            )}

                            <div className="bg-gray-50 rounded-lg p-6">
                                {mayor ? (
                                    <SolicitudMayoresCard
                                        data={{
                                            id: solicitudIdSelected,
                                            cursoSolicitud: solicitudes.find((solicitud: any) => solicitud.id === solicitudIdSelected)?.cursoSolicitud,
                                            solicitudMayores: solicitudSelectedData,
                                        }}
                                    />
                                ) : (
                                    <SolicitudMenoresCard
                                        data={{
                                            id: solicitudIdSelected,
                                            cursoSolicitud: solicitudes.find((solicitud: any) => solicitud.id === solicitudIdSelected)?.cursoSolicitud,
                                            solicitudMenores: solicitudSelectedData,
                                        }}
                                    />
                                )}
                            </div>

                            {!leida && (
                                <div className="mt-6 flex justify-center gap-4">
                                    <Button
                                        className="bg-sky-600 hover:bg-sky-700 px-6"
                                        onClick={() => { setManejarSolicitud(true); setAceptar(true) }}
                                    >
                                        Aceptar
                                    </Button>
                                    <Button
                                        className="bg-red-600 hover:bg-red-700 px-6"
                                        onClick={() => { setManejarSolicitud(true); setAceptar(false) }}
                                    >
                                        Rechazar
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* alerta al borrar */}
            <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            Confirmar eliminación
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            ¿Está seguro que desea eliminar esta solicitud? Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* modal para enviar el email */}
            {manejarSolitud && (
                aceptar ? (
                    <SolicitudEmailForm
                        soliAlumno={{ solicitudId: solicitudIdSelected, alumno: alumnoSelected }}
                        cursos={cursosSelected}
                        aceptar={true}
                        onSubmit={() => fetchData()}
                        onClose={() => { setManejarSolicitud(false); setShowSelect(false) }}
                    />
                ) : (
                    <SolicitudEmailForm
                        soliAlumno={{ solicitudId: solicitudIdSelected, alumno: alumnoSelected }}
                        aceptar={false}
                        onSubmit={() => fetchData()}
                        onClose={() => { setManejarSolicitud(false); setShowSelect(false) }}
                    />
                )
            )}
        </main>
    );
};

export default withAuth(solicitudPage);
