"use client"
import React, { useEffect, useState } from 'react';
import Navigate from "../../../components/profesional//navigate/page";
import Background from "../../../../public/Images/BackgroundSolicitudes.jpg"
import { useRouter } from 'next/navigation';
import { autorizarUser, fetchUserData } from '@/helpers/cookies';
import { DashboardCard } from '@/components/varios/DashboardCard';
import { Calendar, UserCircle } from 'lucide-react';

type Usuario = {
    id: number;
    nombre: string;
    apellido: string;
    telefono: number;
    email: string;
    direccionId: number;
    rolId: number;
};

const principal: React.FC = () => {

    const [usuario, setUsuario] = useState<Usuario>();
    const router = useRouter();
    // Para cambiar al usuario de página si no está logeado
    // Para cambiar al usuario de página si no está logeado
    useEffect(() => {
      const verificarAutenticacion = async () => {
        try {
       
          await autorizarUser(router); // Verifica si el usuario está autorizado
          const user = await fetchUserData(); // Obtén los datos del usuario
  
            if (!user) {
            router.push("/start/login"); // Redirige al login si no hay usuario
            return;
          }
          setUsuario(user);
        } catch (error) {
          console.error("Error al verificar autenticación:", error);
          router.push("/login"); // Redirige al login si ocurre un error
        } 
      };
  
      verificarAutenticacion();
    }, [router]);
    
    const handleNavigation = (route: string) => {
      const basePath = "/profesional";
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
          <Navigate />
          <div className="flex flex-col flex-grow bg-white/50 p-6">
            <div className="mt-16 text-center mb-6">
              <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold">
                Bienvenido de regreso, {usuario?.nombre} {usuario?.apellido}! 👋
              </h1>
    
              {/* Contenedor de talleres */}
             
            </div>
                <div className="px-[15%] grid h-1/3 gap-8 lg:grid-cols-2">
                <DashboardCard
                  title='Mi Cuenta'
                  description='Accede a la información de tu cuenta.'
                  icon={UserCircle}
                  onClick={() => handleNavigation('/Cuenta')}
                  gradient='bg-gradient-to-br from-green-500 to-lime-600'
                  className="min-h-[200px] text-xl" // Aumenta el tamaño
                />
                <DashboardCard
                  title='Calendario'
                  description='Consulta el calendario semanal.'
                  icon={Calendar}
                  onClick={() => handleNavigation('/cronogramap/listar')}
                  gradient='bg-gradient-to-br from-violet-500 to-purple-600'
                  className="min-h-[200px] text-xl" // Aumenta el tamaño
                />
                </div>   
          </div>
        </main>
      );
    };
    
    export default principal;
