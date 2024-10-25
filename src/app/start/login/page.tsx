"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import BackgroundLibrary from "../../../../public/Images/BookShell.jpg";
import Logo from "../../../../public/Images/LogoCasaJardin.png";
import { login } from "../../../services/Alumno"; // Importa la función `login` desde el servicio
import {useRouter} from "next/navigation";

function Login() {
  // Estados para gestionar los datos del formulario y errores
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const router = useRouter();

  // Función para validar los datos del formulario
  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    // Validación del email
    if (email.length === 0) {
      newErrors.email = "El email es requerido.";
  } else if (errors.email) {
      newErrors.email = "El email no es válido.";
    }
    if (!email.includes('@'))  newErrors.email = "El email debe ser válido";

    // Validación de la contraseña
    if (!password) {
      newErrors.password = "La contraseña es requerida.";
    } else if (password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres.";
    }

    // Actualiza el estado de errores
    setErrors(newErrors);

    // Retorna `true` si no hay errores, de lo contrario `false`
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (errors != null ) {
        setInterval(() => {
            setErrors({email: "", password: ""});
        }, 10000);
    }

}, [errors]);
  // Función para manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
/*     const alumno = await login(email, password);
    console.log("EL ALUMNOOOOOOO",alumno); */
    // Valida los datos del formulario
    if (validate()) {
        // Llama a la función `login` para verificar email y contraseña
        const alumno = await login(email, password);
      
        if (alumno) {
          console.log("Inicio de sesión exitoso", alumno);
          // por ahora redirige al inicio
          router.push("/usuario/principal");
        }else{
          setErrors({ email: "Email o contraseña incorrectos." });
        }
    }
  };


  //region Return
  return (
    <div
      className="relative min-h-screen flex items-center justify-center"
      style={{
        backgroundImage: `url(${BackgroundLibrary.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Capa de fondo con opacidad */}
      <div className="absolute inset-0 bg-white bg-opacity-70 z-0" />

      {/* Contenedor principal del formulario de inicio de sesión */}
      <div
    style={{
      backgroundColor: 'rgba(28, 171, 235, 1)', // Fondo con opacidad aplicada
      position: 'relative',
      zIndex: 2,
      display: 'flex',
      flexDirection: 'column',
      padding: '50px 100px',
      height: '828px',
      borderRadius: '50px', // Bordes redondeados
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Sombra para dar profundidad
    }}
  >
        {/* Logo de la aplicación */}
        <Image src={Logo} alt="Logo Casa Jardin" width={150} height={150} className="mx-16" />

        {/* Título del formulario */}
        <h2 className="text text-2xl font-semibold my-4 mx-16">Inicia Sesión</h2>

        {/* Formulario de inicio de sesión */}
        <form onSubmit={handleSubmit} className="w-full">
          <div className="mb-4">
            <label className="text font-medium" htmlFor="email">
              Email
            </label>
            <input
              type="text"
              id="email"
              className="w-full p-2 rounded-md"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1 mx-16">{errors.email}</p>}
          </div>

          <div className="mb-4">
            <label className="text font-medium" htmlFor="password">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              className="w-full p-2 rounded-md"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && <p className="text-red-500 text-sm mt-1 mx-16">{errors.password}</p>}
          </div>

          {/* Botón de inicio de sesión */}
          <button
            type="submit"
            className="w-full p-3 bg-red-500 text rounded-md font-medium hover:bg-red-600 transition duration-300"
            onClick={() => console.log(errors.email, errors.password)}
          >
            Iniciar Sesión
          </button>
        </form>

        {/* Enlace para registrarse */}
        <div className="p-5 flex items-center justify-center">
          <span className="text font-medium">¿No tienes cuenta?</span>
          <a href="/start/signup" className="font-bold text-lg text-black ml-2">
            Regístrate
          </a>
        </div>
      </div>
    </div>
  );
}

export default Login;
