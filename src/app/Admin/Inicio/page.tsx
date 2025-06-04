"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navigate from "../../../components/Admin/navigate/page"; // Ajusta la ruta según tu estructura de carpetas
import Image from "next/image";
import Background from "../../../../public/Images/BackgroundSolicitudes.jpg"; // Ajusta la ruta según tu estructura de carpetas
import withAuth from "../../../components/Admin/adminAuth";
import { getCantCursosActivos, getCursos } from "@/services/cursos";
import { getSolicitudes } from "@/services/Solicitud/Solicitud";
import { getCantAlumnosInscriptos } from "@/services/alumno_curso";
import { getCantProfesionalesActivos } from "@/services/profesional_curso";
//para front
import { DashboardCard } from "@/components/varios/DashboardCard";
import { ZoomIn, Blocks, Laptop, ListEnd, ChevronRight, Clipboard, Book, GraduationCap, Users, Brush, CheckSquare, Calendar, Apple, PanelBottomOpen } from 'lucide-react';
import PasswordComponent from "@/components/Password/page";
import { autorizarUser, fetchUserData } from "@/helpers/cookies";

const Inicio: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false); // Estado de carga
  const [cantTalleres, setCantTalleres] = useState(0); // Estado de cantidad de talleres
  const [cantSolicitudes, setCantSolicitudes] = useState(0); // Estado de cantidad de solicitudes
  const [cantAlumnos, setCantAlumnos] = useState(0); // Estado de cantidad de alumnos
  const [cantProfesores, setCantProfesores] = useState(0); // Estado de cantidad de profesores
  const [showForm, setShowForm] = useState(false); // Estado para mostrar/ocultar el formulario flotante
  const [opneChangePass, setOpenChangePass] = useState(false); // Estado para mostrar/ocultar el formulario de cambio de contraseña
  const [admin, setAdmin] = useState<any>(null); // Estado para almacenar los datos del administrador
  const [isSaving, setIsSaving] = useState(false); // Estado para indicar si se está guardando

  useEffect(() => {
    // Lógica para obtener la cantidad de talleres, solicitudes, alumnos y profesores
    if (!loading) getCantidades();

  }, []);
  const getCantidades = async () => {
    // Lógica para obtener la cantidad de talleres, solicitudes, alumnos y profesores
    const talleresActivos = await getCantCursosActivos();
    setCantTalleres(talleresActivos);
    let solicitudes = await getSolicitudes();
    solicitudes = solicitudes.filter((solicitud) => solicitud.leida === false);
    setCantSolicitudes(solicitudes.length);
    /*     const alumnos = await getAlumnos()
        setCantAlumnos(alumnos.length); */
    const alumnos = await getCantAlumnosInscriptos();
    setCantAlumnos(alumnos);
    const profesores = await getCantProfesionalesActivos();
    setCantProfesores(profesores);
    //console.log(talleres, solicitudes, alumnos, profesores);
    setLoading(true);
  }
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
    setAdmin(user)
  }

  const handleNavigation = (route: string) => {
    const basePath = "/Admin";
    router.push(`${basePath}${route}`);
  };

  return (
    <main className="relative min-h-screen w-full">
      <Navigate />
      <div className="fixed inset-0 z-[-1]">
        <Image src={Background} alt="Background" layout="fill" objectFit="cover" quality={80} priority={true} />
      </div>
      <section
        className=" justify-center items-center flex py-20 "
      >
        <div className="container relative px-4 ">
          <h2 className="mb-8 xl:w-1/2 text-center text-balance text-2xl font-semibold lg:text-4xl">
            ¡Bienvenido de nuevo! Estamos listos para seguir construyendo juntos.
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <DashboardCard
              title="Talleres"
              description={`${cantTalleres} talleres activos`}
              icon={GraduationCap}
              onClick={() => handleNavigation('/cursos')}
              gradient="bg-gradient-to-br from-sky-700 to-sky-500"
            />
            <DashboardCard
              title="Alumnos"
              description={`${cantAlumnos} alumnos inscriptos`}
              icon={Users}
              onClick={() => handleNavigation('/alumnos')}
              gradient="bg-gradient-to-br from-purple-500 to-pink-600"
            />
            <DashboardCard
              title="Profesionales"
              description={`${cantProfesores} profesionales registrados`}
              icon={Apple}
              onClick={() => handleNavigation('/profesionales')}
              gradient="bg-gradient-to-br from-yellow-500 to-orange-600"
            />
            <DashboardCard
              title="Solicitudes"
              description={`${cantSolicitudes} solicitudes pendientes`}
              icon={CheckSquare}
              onClick={() => handleNavigation('/Solicitudes')}
              gradient="bg-gradient-to-br from-red-500 to-rose-600"
            />
            <DashboardCard
              title="Cronograma"
              description="Revisa el cronograma de talleres"
              icon={Calendar}
              onClick={() => handleNavigation('/aulaSelector')}
              gradient="bg-gradient-to-br from-blue-500 to-cyan-600"
            />

          </div>
          {/* Botón flotante */}
          <button
            onClick={() => setShowForm(!showForm)}
            className="fixed bottom-6 right-6 z-50 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700"
          >
            <PanelBottomOpen className="w-6 h-6" />
          </button>

          {/* Formulario flotante */}
          {(
            <div
              className={`fixed bottom-0 right-0 w-1/2 max-w-md bg-white border-t rounded-t-xl py-4 px-6 shadow-lg z-40
              transition-transform duration-300 ease-in-out
              ${showForm ? "translate-y-0" : "translate-y-full"}
              `}
              style={{ transform: showForm ? "translateY(0)" : "translateY(100%)" }}
            >
              <h3 className="text-lg font-bold mb-2 w-full text-center ">Datos del administrador</h3>

              <div className="space-y-3 mb-10">
                <label className="block text-md font-medium text-gray-500">Correo: {admin?.email }</label>
                <button onClick={() => setOpenChangePass(true)} className="underline text-sm">Desea cambiar su contraseña?</button>
              </div>
            </div>
          )}
          {opneChangePass && (
            <PasswordComponent
              email={String(admin.email)}
              setVerificarEmail={setOpenChangePass}
              setSaving={setIsSaving}
            />
          )}

        </div>
      </section>
    </main>
  );
};

export default withAuth(Inicio); 