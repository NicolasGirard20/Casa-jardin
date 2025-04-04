"use client";
import React, { useEffect, useState } from "react";
import Navigate from "../../../components/alumno/navigate/page";
import But_aside from "../../../components/but_aside/page";
import { autorizarUser, fetchUserData } from "@/helpers/cookies";
import withAuthUser from "../../../components/alumno/userAuth";
import { useRouter } from "next/navigation";
import { ChevronRight, Clipboard, Book, CalendarDays, UserCircle, BookOpen } from "lucide-react";
import Background from "../../../../public/Images/BackgroundSolicitudes.jpg";
import { DashboardCard } from "@/components/varios/DashboardCard";

const Principal: React.FC = () => {
  const [userName, setUserName] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const authorizeAndFetchData = async () => {
      await autorizarUser(router);
      const user = await fetchUserData();
      if (user) {
        setUserName(`${user.nombre} ${user.apellido}`);
      }
    };

    authorizeAndFetchData();
  }, [router]);

  const handleNavigation = (route: string) => {
    const basePath = "/usuario";
    router.push(`${basePath}${route}`);
  };
  return (
    <main
      className="flex flex-col min-h-screen bg-cover bg-center"
      style={{
        backgroundImage: `url(${Background.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Navegación */}
      <Navigate />

      {/* Contenido principal */}
      <div className="flex flex-col min-h-[88vh] flex-grow bg-white/50 p-6">
        {/* Mensaje de bienvenida */}
        <div className="mt-16 text-center mb-6">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold">
            Bienvenido de regreso, {userName}
          </h1>
        </div>
         <div className="px-[20%] grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          <DashboardCard
            title="Mi Cuenta"
            description="Accede a la información de tu cuenta."
            icon={UserCircle}
            onClick={() => handleNavigation("/Cuenta")}
            gradient="bg-gradient-to-br from-violet-500 to-purple-600"
          />
          <DashboardCard
            title="Mis Cursos"
            description="Consulta los cursos en los que estás inscrito."
            icon={BookOpen}
            onClick={() => handleNavigation("/Cursos")}
            gradient="bg-gradient-to-br from-green-500 to-lime-600"
          />
          <DashboardCard
            title="Calendario"
            description="Revisa las fechas importantes y actividades."
            icon={CalendarDays}
            onClick={() => handleNavigation("/Cronograma")}
            gradient="bg-gradient-to-br from-yellow-500 to-amber-600"
          />
          <DashboardCard
            title="Solicitud de Inscripción"
            description="Realiza nuevas solicitudes de inscripción."
            icon={Clipboard}
            onClick={() => handleNavigation("/Solicitud/Inscripcion")}
            gradient="bg-gradient-to-br from-blue-500 to-sky-600"
          />
         </div>
      </div>

      {/* Botón fijo en la parte inferior */}
      <But_aside />
    </main>
  )
}  
export default withAuthUser(Principal);
