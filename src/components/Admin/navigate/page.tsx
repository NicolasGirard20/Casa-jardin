"use client";
import Image from "next/image";
import Logo from "../../../../public/Images/LogoCasaJardin.png";
import { useState } from "react";

export default function Navigate() {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  const logout = async () => {
    try {
      const response = await fetch('/api/deleteCookie', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        window.location.href = "/start/login";
      } else {
        console.error('Error al cerrar sesión:', await response.json());
      }
    } catch (error) {
      console.error('Error en la solicitud de cierre de sesión:', error);
    }
  };

  const styles = {
    inactiveTextColor: "text-white",
    hoverTextColor: "hover:text-gray-800",
    underline: "border-b-2 border-transparent hover:border-white",
  };

  function NavLink({ href, children, onClick }: { href?: string; children: React.ReactNode; onClick?: () => void }) {
    return (
      <a
        className={`${styles.inactiveTextColor} cursor-pointer px-4 py-2 font-medium ${styles.hoverTextColor} ${styles.underline} duration-300`}
        href={href}
        onClick={onClick}
      >
        {children}
      </a>
    );
  }

  return (
    <nav className="flex justify-between items-center w-full p-3 bg-red-500">
      <div className="flex items-center cursor-pointer" onClick={() => window.location.href = "/Admin/Inicio"}>
        <Image src={Logo} alt="Logo Casa Jardin" width={50} height={50} draggable="false" />
        <h1 className="text-white">Casa Jardín</h1>
      </div>
      <div className="hidden lg:flex ml-auto space-x-2 py-2 text-white">
        <NavLink href="/Admin/cursos">Talleres</NavLink>
        <NavLink href="/Admin/aulaSelector">Cronogramas</NavLink>
        <NavLink href="/Admin/Solicitudes">Solicitudes</NavLink>
        <NavLink href="/Admin/profesionales">Profesionales</NavLink>
        <NavLink href="/Admin/alumnos">Alumnos</NavLink>
        <NavLink onClick={logout}>Salir</NavLink>
      </div>
      <div className="lg:hidden flex items-center">
        <button onClick={() => setMenuOpen(!menuOpen)} className="text-white focus:outline-none">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}
            ></path>
          </svg>
        </button>
      </div>
      {menuOpen && (
        <div
          className="lg:hidden absolute top-16 left-0 w-full bg-red-500 text-white flex flex-col items-center space-y-4 py-4 max-h-screen overflow-y-auto z-50 shadow-lg"
        >
          <div className="border-t w-full"></div>
          <NavLink href="/Admin/cursos">Talleres</NavLink>
          <div className="border-t w-full"></div>
          <NavLink href="/Admin/aulaSelector">Cronogramas</NavLink>
          <div className="border-t w-full"></div>
          <NavLink href="/Admin/Solicitudes">Solicitudes</NavLink>
          <div className="border-t w-full"></div>
          <NavLink href="/Admin/profesionales">Profesionales</NavLink>
          <div className="border-t w-full"></div>
          <NavLink href="/Admin/alumnos">Alumnos</NavLink>
          <div className="border-t w-full"></div>
          <NavLink onClick={logout}>Salir</NavLink>
        </div>
      )}
    </nav>
  );
}
