"use client";
import Image from "next/image";
import Logo from "../../../../public/Images/LogoCasaJardin.png";
import { useState } from "react";

export default function Navigate() {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  const styles = {
    inactiveTextColor: "text-white",
    hoverTextColor: "hover:text-blue-900",
    underline: "border-b-2 border-transparent hover:border-white",
  };

  function NavLink({ href, children, onClick }: { href?: string, children: React.ReactNode, onClick?: () => void }) {
    return (
      <a
        className={`${styles.inactiveTextColor} px-4 py-2 font-medium ${styles.hoverTextColor} ${styles.underline} duration-300`}
        href={href}
        onClick={onClick}
      >
        {children}
      </a>
    );
  }

  return (
    <nav className="flex justify-between items-center w-full p-3 bg-sky-600">
      {/* Logo Section */}
      <div
        className="flex items-center cursor-pointer "
        onClick={() => (window.location.href = "/start/Inicio")}
      >
        <Image src={Logo} alt="Logo Casa Jardin" width={50} height={50} draggable="false" />
        <h1 className="ml-2 text-white text-lg sm:text-xl">Casa Jardín</h1>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden lg:flex ml-auto space-x-4 py-2  text-white">
        <NavLink href="/start/Inicio">Inicio</NavLink>
        <NavLink href="/start/Nosotros">Nosotros</NavLink>
        <NavLink href="/start/Talleres">Talleres</NavLink>
        <NavLink href="/start/login">Ingresar</NavLink>
      </div>

      {/* Mobile Menu Button */}
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

      {/* Mobile Navigation */}
      {menuOpen && (
        <div
          className="fixed  lg:hidden top-16 left-0 w-full bg-sky-600 text-white flex flex-col items-center space-y-4 py-4 max-h-[70vh] overflow-y-auto z-[9999] shadow-lg"
        >
          <NavLink href="/start/Inicio">Inicio</NavLink>
          <div className="border-t w-full"></div>
          <NavLink href="/start/Nosotros">Nosotros</NavLink>
          <div className="border-t w-full"></div>
          <NavLink href="/start/Talleres">Talleres</NavLink>
          <div className="border-t w-full"></div>
          <NavLink href="/start/signup">Ingresar</NavLink>
        </div>
      )}
    </nav>
  );
}