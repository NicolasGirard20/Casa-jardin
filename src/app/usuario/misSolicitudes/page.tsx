"use client";
import React, { useEffect, useState } from "react";
import Navigate from "../../../components/alumno/navigate/page";
import But_aside from "../../../components/but_aside/page";
import { useRouter } from "next/navigation";
import { autorizarUser, fetchUserData } from "@/helpers/cookies";
import Background from "../../../../public/Images/BackgroundSolicitudes.jpg";
import { getSolicitudesCompletasByAlumno } from "@/services/Solicitud/Solicitud";
import Loader from "@/components/Loaders/loader/loader";
import { SolicitudData, createColumns } from "@/components/alumno/solicitudes/column";
import { DataTable } from "@/components/alumno/solicitudes/data-table";
import SolicitudMayoresCard from "@/components/Admin/solicitudes/SolicitudMayoresCard";
import SolicitudMenoresCard from "@/components/Admin/solicitudes/SolicitudMenoresCard";
import { XCircle, ArrowLeft } from "lucide-react";
import FeedbackCard from "@/components/alumno/solicitudes/feedBackCard";
import Image from "next/image";

const misSolicitudes: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [selectedSolicitudId, setSelectedSolicitudId] = useState<number>(0);
  const [columnData, setColumnData] = useState<SolicitudData[]>([]);
  const [loading, setLoading] = useState(true);
  const [mayor, setMayor] = useState<boolean>(false);
  const [leida, setLeida] = useState<boolean>(false);

  useEffect(() => {
    const authorizeAndFetchData = async () => {
      await autorizarUser(router);
      const usuario = await fetchUserData();
      const solicitudes = await getSolicitudesCompletasByAlumno(usuario.id);
      setUser(usuario);
      setSolicitudes(solicitudes);

      const data = solicitudes.map((solicitud: any) => {
        let estado = "No Leída";
      
        if (solicitud.leida) {
          //si todos los cursos de la soli fueron aceptados
          const allAccepted = solicitud.cursoSolicitud.every((curso: any) => curso.estado);
          //si todos los cursos de la soli fueron rechazados
          const allRejected = solicitud.cursoSolicitud.every((curso: any) => !curso.estado);
          //si algun curso de la soli fue aceptado
          const partiallyAccepted = solicitud.cursoSolicitud.some((curso: any) => curso.estado);
      
          if (allAccepted) {
            estado = "Aceptada";
          } else if (allRejected) {
            estado = "Rechazada";
          } else if (partiallyAccepted) {
            estado = "Parcialmente Aprobada";
          }
        }
        return {
          codigo: solicitud.id,
          estado: estado,
        };
      });
      console.log(data);
      setColumnData(data);
      if (!usuario) return;
      setLoading(false);
    };

    authorizeAndFetchData();
  }, [router]);

  const onViewDetails = (solicitudId: number) => {
    const soli = solicitudes.find((solicitud) => solicitud.id === solicitudId);
    setMayor(!!soli.solicitudMayores);
    setLeida(!!soli.leida);
    setSelectedSolicitudId(solicitudId);
  }

  const columns = createColumns(onViewDetails);

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col bg-cover bg-center" /* style={{ backgroundImage: `url(${Background.src})` }} */>
        <Navigate />
        <div className="flex-grow flex min-h-[88vh] items-center justify-center bg-white/50">
          <div className="flex flex-col items-center gap-4 ">
            <Loader />
            <h1 className="text-gray-700">Cargando solicitudes...</h1>
          </div>
        </div>
        <But_aside />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-cover bg-center" /* style={{ backgroundImage: `url(${Background.src})` }} */>
      <Navigate />
 {/*            <Image
              src={Background}
              alt="Background"
              layout="fill"
              objectFit="cover"
              quality={80}
              priority={true}
            /> */}
      <div className="flex-grow flex bg-gray-50 p-4">
        <div className="container mx-auto flex flex-col">
          <h1 className="text-2xl font-semibold text-gray-800 mb-6 mt-14 text-center">
            Tus Solicitudes
          </h1>

          <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lista de solicitudes - visible when no selection on mobile, always visible on desktop */}
            <div className={`bg-white rounded-lg shadow-lg p-4 h-[calc(100vh-240px)] overflow-hidden flex flex-col ${selectedSolicitudId !== 0 ? 'hidden lg:flex' : 'flex'}`}>
              <h2 className="text-lg font-medium text-gray-700 mb-4">Lista de Solicitudes</h2>
              {solicitudes.length > 0 ? (
                <div className="flex-grow overflow-auto">
                  <DataTable columns={columns} data={columnData} />
                </div>
              ) : (
                <div className="flex-grow flex items-center justify-center">
                  <p className="text-gray-500">No hay solicitudes disponibles</p>
                </div>
              )}
            </div>

            {/* Panel de detalles - visible when selected on mobile, always visible on desktop */}
            <div className={`bg-white rounded-lg shadow-lg p-4 h-[calc(100vh-240px)] overflow-hidden ${selectedSolicitudId === 0 ? 'hidden lg:flex lg:items-center lg:justify-center' : 'flex'}`}>
              {selectedSolicitudId ? (
                <div className="h-full flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setSelectedSolicitudId(0)}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors lg:hidden"
                      >
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                      </button>
                      <h2 className="text-lg font-medium text-gray-700">Detalles de la Solicitud</h2>
                    </div>
                    <button 
                      onClick={() => setSelectedSolicitudId(0)}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors hidden lg:block"
                    >
                      <XCircle className="w-6 h-6 text-gray-600 hover:text-red-500" />
                    </button>
                  </div>
                  
                  <div className="flex-grow overflow-auto">
                    {leida && (
                      <div className="mb-6 border-b pb-4">
                        <FeedbackCard 
                          cursoSolicitud={solicitudes.find((s) => s.id === selectedSolicitudId).cursoSolicitud}
                        />
                      </div>
                    )}
                    
                    {mayor ? (
                      <SolicitudMayoresCard 
                        data={{
                          id: selectedSolicitudId,
                          cursoSolicitud: solicitudes.find((s) => s.id === selectedSolicitudId).cursoSolicitud,
                          solicitudMayores: solicitudes.find((s) => s.id === selectedSolicitudId).solicitudMayores
                        }}
                      />
                    ) : (
                      <SolicitudMenoresCard 
                        data={{
                          id: selectedSolicitudId,
                          cursoSolicitud: solicitudes.find((s) => s.id === selectedSolicitudId).cursoSolicitud,
                          solicitudMenores: solicitudes.find((s) => s.id === selectedSolicitudId).solicitudMenores
                        }}
                      />
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Selecciona una solicitud para ver sus detalles</p>
              )}
            </div>
          </div>
        </div>
      </div>

   <But_aside />
    </main>
  );
};

export default misSolicitudes;