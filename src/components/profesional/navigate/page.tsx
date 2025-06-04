"use client";
import Image from "next/image";
import Logo from "../../../../public/Images/LogoCasaJardin.png";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Navigate() {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const router = useRouter();

  const logout = async () => {
    try {
      const response = await fetch('/api/deleteCookie', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        router.push("/start/login");
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

  function NavLink({ href, children, onClick, className }: { href?: string, children: React.ReactNode, onClick?: () => void, className?: string }) {
    return (
      <a
        className={`${styles.inactiveTextColor} px-4 py-2 font-medium ${styles.hoverTextColor} ${styles.underline} duration-300 ${className} cursor-default`}
        href={href}
        onClick={onClick}
      >
        {children}
      </a>
    );
  }

  return (
    <nav className="flex justify-between items-center w-full p-3 bg-sky-600">
      <div className="flex items-center cursor-pointer" onClick={() => window.location.href = "/profesional/principal"}>
        <Image src={Logo} alt="Logo Casa Jardin" width={50} height={50} draggable="false" />
        <h1 className="ml-2 text-white">Casa Jardín</h1>
      </div>
      <div className="hidden md:flex ml-auto space-x-4 py-2 text-white">

        <NavLink href="/profesional/cronogramap/listar">Calendario</NavLink>
        <NavLink href="/profesional/Cuenta">Mi Perfil</NavLink>
        <NavLink onClick={logout}>Salir</NavLink>
      </div>
      <div className="md:hidden flex items-center">
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
          className="md:hidden fixed top-16 left-0 w-full bg-sky-600 text-white flex flex-col items-center space-y-4 py-4 max-h-[70vh] overflow-y-auto z-50 shadow-lg"
        >
          <div className="border-t w-full"></div>
          <NavLink href="/profesional/Cuenta">Mi Perfil</NavLink>
          <div className="border-t w-full"></div>
          <NavLink href="/profesional/cronogramap/listar">Calendario</NavLink>
          <div className="border-t w-full"></div>
          <NavLink onClick={logout}>Salir</NavLink>
        </div>
      )}
    </nav>
  );
}