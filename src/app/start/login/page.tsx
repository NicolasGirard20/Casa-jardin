"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import BackgroundLibrary from "../../../../public/Images/BookShell.jpg";
import Logo from "../../../../public/Images/LogoCasaJardin.png";
import { authenticateUser } from "../../../services/Alumno"; // Importa la función `login` desde el servicio
import { useRouter } from "next/navigation";
import ImageLogin from '../../../../public/Images/ImageLogin2.jpg';
import ImageLogin2 from '../../../../public/Images/BackgroundSolicitudes2.jpg';
import Loader from "@/components/Loaders/loadingSave/page";

function Login() {
    // Estados para gestionar los datos del formulario y errores
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const router = useRouter();
    const [frase, setFrase] = useState("");

    const [isSaving, setIsSaving] = useState(false);

    const [passwordVisible, setPasswordVisible] = useState(false);
    // Función para validar los datos del formulario
    const validate = () => {
        const newErrors: { email?: string; password?: string } = {};

        // Validación del email
        if (!email) {
            newErrors.email = "El email es requerido.";
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = "El email no es válido.";
        }

        // Validación de la contraseña
        if (!password) {
            newErrors.password = "La contraseña es requerida.";
        } else if (password.length < 6) {
            newErrors.password = "La contraseña debe tener al menos 6 caracteres.";
        }

        // Actualiza el estado de errores
        setErrors(newErrors);
        if(Object.keys(newErrors).length > 0) setIsSaving(false);
        // Retorna `true` si no hay errores, de lo contrario `false`
        return Object.keys(newErrors).length === 0;
    };

    useEffect(() => {
        const frases = [
            "¡Hola de nuevo! Estamos listos para ayudarte a alcanzar tus objetivos.",
            "Gracias por confiar en nosotros. Inicia sesión para comenzar.",
            "¡Bienvenido/a! Accedé a tu cuenta y continuá donde lo dejaste.",
            "¡Hola! ¿Estás listo para alcanzar tus objetivos?"
        ];
        const randomIndex = Math.floor(Math.random() * frases.length);
        setFrase(frases[randomIndex]);
    }, []);
    useEffect(() => {
        if (errors.email || errors.password) {
            const timer = setTimeout(() => {
                setErrors({ email: "", password: "" });
            }, 10000);

            return () => clearTimeout(timer); // Limpiar el timer si el componente se desmonta
        }
    }, [errors]);

    // Función para manejar el envío del formulario
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        // Valida los datos del formulario
        if (validate()) {
            // Llama a la función `login` para verificar email y contraseña

            const rolIdOrError = await authenticateUser(email, password);
            console.log("emailerror", rolIdOrError);
            if (typeof rolIdOrError != "string") {

                redirectToRolePage(rolIdOrError, router);
            } else {
                rolIdOrError == "" ? setErrors({password: "La contraseña es incorrecta"}) : setErrors({ email: "El email es incorrectos." });
                setIsSaving(false);
            }

        }
        
    };

    function redirectToRolePage(rolId: number | null, router: ReturnType<typeof useRouter>) {
        if (!rolId) {
            return; // No se pudo autenticar al usuario
        }
        // Redirige según el rol del usuario
        const routes: { [key: number]: string; default: string } = {
            1: "/Admin/Inicio",
            2: "/usuario/principal",
            3: "/profesional/principal",
            default: "/start/login",
        };

        router.replace(routes[rolId] || routes.default);
    }

    //region Return
    return (
        <section className="relative flex flex-col lg:flex-row lg:h-screen lg:items-center">
            <button
            className="bg-white text-center w-10 rounded-2xl top-5 left-5 absolute text-black text-xl font-semibold group z-10"
            type="button"
            onClick={() => window.location.href = "/start/Inicio"}
            >
            <div
                className="bg-blue-400 rounded-xl h-12 w-10 flex items-center justify-center absolute left-1 top-[4px] hover:bg-blue-600 z-10 duration-500"
            >
                <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 1024 1024"
                height="20px"
                width="20px"
                >
                <path
                    d="M224 480h640a32 32 0 1 1 0 64H224a32 32 0 0 1 0-64z"
                    fill="#000000"
                ></path>
                <path
                    d="m237.248 512 265.408 265.344a32 32 0 0 1-45.312 45.312l-288-288a32 32 0 0 1 0-45.312l288-288a32 32 0 1 1 45.312 45.312L237.248 512z"
                    fill="#000000"
                ></path>
                </svg>
            </div>
            </button>

            <div className="w-full px-6 py-12 sm:px-8 sm:py-16 lg:w-1/2 lg:px-12 lg:py-24">
            <div className="flex justify-center mb-6">
                <Image src={Logo} alt="Logo Casa Jardin" width={150} height={150} />
            </div>
            <div className="mx-auto max-w-lg text-center">
                <h1 className="text-2xl font-bold sm:text-3xl">{frase}</h1>
                <p className="mt-4 text-gray-500">
                Ingrese sus datos para acceder a su cuenta.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="mx-auto mt-8 max-w-md space-y-4">
                <div>
                <label htmlFor="email" className="sr-only">Email</label>
                <div className="relative">
                    <input
                    type="email"
                    id="email"
                    className={`w-full border rounded-lg ${errors.email ? "border-red-600" : "border-gray-200"} p-4 pe-12 text-sm shadow-md`}
                    placeholder="Ingrese su email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                </div>

                <div>
                <label htmlFor="password" className="sr-only">Contraseña</label>
                <div className="relative">
                    <input
                    type={passwordVisible ? "text" : "password"}
                    id="password"
                    className={`w-full border rounded-lg ${errors.password ? "border-red-600" : "border-gray-200"} p-4 pe-12 text-sm shadow-md`}
                    placeholder="Ingrese su contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    />
                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute inset-y-0 end-0 h-5 w-5 m-4 text-gray-400 cursor-pointer"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                    </svg>
                </div>
                </div>

                <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                    No tienes cuenta?
                    <a className="hover:text-gray-600 hover:underline" href="/start/signup"> Regístrate</a>
                </p>
                <button
                    type="submit"
                    className="inline-block rounded-lg bg-blue-500 hover:bg-blue-600 px-5 py-3 text-sm font-medium text-white"
                    disabled={isSaving}
                >
                    {isSaving ? <Loader /> : "Iniciar Sesión"}
                </button>
                </div>
            </form>
            </div>

            <div className="relative h-64 w-full md:h-64 lg:h-full lg:w-1/2 ">
                <Image
                    alt="login"
                    src={ImageLogin}
                    className="absolute inset-0 h-full right-0 w-full object-cover lg:object-fill mt-4 sm:mt-12  md:mt-2 lg:mt-0 transform sm:translate-y-1 -translate-y-2  md:-translate-y-0 lg:-translate-y-0 rounded-lg"
                />
            </div>
        </section>
    );
}

export default Login;
