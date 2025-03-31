"use client";
import Image from 'next/image';
import Logo from '../../../../public/Images/LogoCasaJardin.png';
import { useState, useEffect } from "react";
import { createAlumno, emailExists } from "../../../services/Alumno";
import { validateApellido, validateEmail, validateNombre, validatePasswordComplexity } from '@/helpers/validaciones';
import Loader from '@/components/Loaders/loadingSave/page';
import Consentimiento from './Consentimiento';
import { XCircle } from "lucide-react";

import SignupEmail from '@/components/start/SignupEmail';
/*emailPage props: {email: string;
  setCorrecto: React.Dispatch<React.SetStateAction<boolean>>;
  correcto: boolean;
  setVerificarEmail: React.Dispatch<React.SetStateAction<boolean>>;}*/

function Signup() {
    // Se crean los estados para los campos del formulario de registro
    // y se inicializan con un string vacio
    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [fechaNacimiento, setFechaNacimiento] = useState<Date>();
    const Hoy = new Date();
    const edadMinima = new Date(Hoy.getFullYear() - 3, Hoy.getMonth(), Hoy.getDate());
    const edadMaxima = new Date(Hoy.getFullYear() - 100, Hoy.getMonth(), Hoy.getDate());

    const [alertaFinal, setAlertaFinal] = useState<boolean>(false);
    const [errors, setErrors] = useState<{ nombre?: string; apellido?: string; email?: string; password?: string; fechaNacimiento?: Date | undefined }>({});
    const [isSaving, setIsSaving] = useState(false);
    const [showEmailVerification, setShowEmailVerification] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);

    // en para los errores de registro se muestra un mensaje de error por 5 segundos
    // 
    useEffect(() => {
        if (errors.email) {
            const timer = setTimeout(() => {
                setErrors({ email: "" }); // Limpiar los errores después de 5 segundos
            }, 10000);

            return () => clearTimeout(timer); // Limpiar el timer si el componente se desmonta
        }
        if (errors.nombre) {
            const timer = setTimeout(() => {
                setErrors({ nombre: "" }); // Limpiar los errores después de 5 segundos
            }, 10000);

            return () => clearTimeout(timer); // Limpiar el timer si el componente se desmonta
        }
        if (errors.apellido) {
            const timer = setTimeout(() => {
                setErrors({ apellido: "" }); // Limpiar los errores después de 5 segundos
            }, 10000);

            return () => clearTimeout(timer); // Limpiar el timer si el componente se desmonta
        }
        if (errors.password) {
            const timer = setTimeout(() => {
                setErrors({ password: "" }); // Limpiar los errores después de 5 segundos
            }, 10000);

            return () => clearTimeout(timer); // Limpiar el timer si el componente se desmonta
        }
        if (errors.fechaNacimiento) {
            const timer = setTimeout(() => {
                setErrors({ fechaNacimiento: undefined }); // Limpiar los errores después de 5 segundos
            }, 10000);

            return () => clearTimeout(timer); // Limpiar el timer si el componente se desmonta
        }

    }, [errors]);
    // en esta funsion se valida el formulario de registro 
    // para que los datos sean correctos
    //region validateForm
    const validateForm = async () => {
        const newErrors: { nombre?: string; apellido?: string; email?: string; password?: string; fechaNacimiento?: Date | undefined; } = {};

        const estado = await emailExists(email)
        if (estado) {
            newErrors.email = ("El email ya está registrado.");
        }

        let validateInput;
        if (!nombre.trim()) {
            newErrors.nombre = ("El nombre es requerido");
        }

        validateInput = validateNombre(nombre);
        if (typeof (validateInput) === "string") newErrors.nombre = (validateInput);

        validateInput = validateApellido(apellido);
        if (validateInput) newErrors.apellido = (validateInput);

        validateInput = validateEmail(email);
        if (validateInput) newErrors.email = (validateInput);

        /*         if (validateInput) errors.push(validateInput); */

        validateInput = validatePasswordComplexity(password);
        if (validateInput) newErrors.password = (validateInput);
        // fecha de nacimiento


        if (password !== confirmPassword) newErrors.password = ("Las contraseñas no coinciden");
        // Actualiza el estado de errores
        setErrors(newErrors);
        return newErrors;


    };
    // en esta funsion se envian los datos del formulario de registro
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsSaving(true);



        const validationErrors = await validateForm();
        if (Object.keys(validationErrors).length > 0) {
            /* setErrors(validationErrors); */
            setIsSaving(false);
            return;
        }

        //setErrors([]);
        setShowEmailVerification(true);
    };


    useEffect(() => {
        const createUser = async () => {
            if (isEmailVerified) {
                try {
                    const trimmedData = {
                        nombre: nombre.trim(),
                        apellido: apellido.trim(),
                        email: email.trim(),
                        password: password.trim(),
                        fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : undefined,
                    };
                    const response = await createAlumno(trimmedData);
                    if (typeof response === "string") {
                        setErrors({ email: response });
                    } else {
                        window.location.href = "/start/login";
                    }
                } catch (err) {
                    setErrors({ email: "Error al registrar el usuario" });
                }
                setIsSaving(false);
            }
        };

        createUser();
    }, [isEmailVerified]);

    // se muestra el formulario de registro
    //region return
    return (
        /* From Uiverse.io by themrsami */
        <main className='bg-sky-600'>
            <button
                className="bg-white text-center w-10 rounded-2xl top-20 md:left-20 lg:left-20 absolute text-black text-xl font-semibold group"
                type="button"
                onClick={() => window.location.href = "/start/Inicio"}
            >
                <div
                    className="bg-slate-300 rounded-xl h-12 w-10 flex items-center justify-center absolute left-1 top-[4px] hover:bg-slate-400 z-10 duration-500"
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
            <div className="relative  py-3 sm:max-w-xl sm:mx-auto top-20" >
                <div
                    className="relative px-4 py-10 bg-white mx-8 md:mx-0 shadow-2xl rounded-3xl sm:p-10"
                >

                    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                        <h1 className="text-2xl font-bold sm:text-3xl">
                            Registrate a Casa Jardín
                        </h1>
                        <div className="flex justify-center mb-6">
                            <Image src={Logo || "/placeholder.svg"} alt="Logo Casa Jardin" width={150} height={150} />
                        </div>
                        {/*                         {errors.length > 0 && (
                            <div className="mb-4 text-red-600 mx-16">
                                {errors.map((error, index) => (
                                    <p key={index}>{error}</p>
                                ))}
                            </div>
                        )} */}
                        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className='mb-7'>
                                <label
                                    className="font-semibold text-sm text-gray-600 pb-1 block"
                                    htmlFor="nombre"

                                >
                                    Nombre
                                </label>
                                <input
                                    className={` rounded-lg px-3  py-2 mt-1 ${errors.nombre ? "border-red-600":"border-gray-200"}  text-sm w-full  border`}
                                    type="text"
                                    id="nombre"
                                    pattern='[A-Za-zÀ-ÿ ]+'

                                    placeholder='Ej: Juan'
                                    maxLength={40}
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}

                                />
                                {errors && <p className="absolute max-w-56 text-red-500 text-sm mt-1">{errors.nombre}</p>}
                            </div>
                            <div className='mb-7'>
                                <label
                                    className="font-semibold text-sm text-gray-600 pb-1 block"
                                    htmlFor="apellido"
                                >
                                    Apellido
                                </label>
                                <input
                                    className={` rounded-lg px-3 py-2 mt-1 ${errors.apellido ? "border-red-600":"border-gray-200"}  text-sm w-full border `}
                                    type="text"
                                    id="apellido"

                                    pattern='[A-Za-zÀ-ÿ ]+'
                                    placeholder='Ej: Pérez'
                                    maxLength={40}

                                    value={apellido}
                                    onChange={(e) => setApellido(e.target.value)}

                                />
                                {errors && <p className="absolute max-w-56 text-red-500 text-sm mt-1">{errors.apellido}</p>}
                            </div>
                            <div className='mb-7'>
                                <label
                                    className="font-semibold text-sm text-gray-600 pb-1 block"
                                    htmlFor="email"
                                >
                                    Email
                                </label>
                                <input
                                    className={` rounded-lg px-3 py-2 mt-1 ${errors.email ? "border-red-600":"border-gray-200"}  text-sm w-full border `}
                                    type="email"
                                    id="email"
                                    placeholder='Ej: dominio@email.com'
                                    maxLength={70}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}

                                />
                                {errors && <p className="absolute max-w-56 text-red-500 text-sm mt-1">{errors.email}</p>}
                            </div>
                            <div className='mb-7'>
                                <label
                                    className="font-semibold text-sm text-gray-600 pb-1 block"
                                    htmlFor="password"
                                >
                                    Contraseña
                                </label>
                                <input
                                    className={` rounded-lg px-3 py-2 mt-1 ${errors.password ? "border-red-600":"border-gray-200"}  text-sm w-full border`}
                                    type="password"
                                    id="password"
                                    placeholder='Ingrese su contraseña'
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}

                                />
                                {errors && <p className="absolute max-w-56 text-red-500 text-sm mt-1 ">{errors.password}</p>}
                            </div>
                            <div className='mb-7'>
                                <label
                                    className="font-semibold text-sm text-gray-600 pb-1 block"
                                    htmlFor="Confirmpassword"
                                >
                                    Confirmar contraseña
                                </label>
                                <input
                                    className={` rounded-lg px-3 py-2 mt-1  text-sm w-full ${errors.password ? "border-red-600":"border-gray-200"} border `}
                                    type="password"
                                    id="Confirmpassword"
                                    placeholder='Confirme su contraseña'
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}

                                />
                                {errors && <p className="absolute max-w-56 text-red-500 text-sm mt-1">{errors.password}</p>}
                            </div>
                            <div className='mb-7'>
                                <label
                                    className="font-semibold text-sm text-gray-600 pb-1 block"
                                    htmlFor="fechaNac"
                                >
                                    Fecha de nacimiento
                                </label>
                                <input
                                    className={` rounded-lg px-3 py-2 mt-1 text-sm w-full ${errors.fechaNacimiento ? "border-red-600":"border-gray-200"} border  `}
                                    type="date"
                                    id="fechaNac"
                                    value={!fechaNacimiento ? "" : !isNaN(fechaNacimiento.getTime()) ? fechaNacimiento.toISOString().split('T')[0] : ""}
                                    min={new Date(new Date().setFullYear(new Date().getFullYear() - 100)).toISOString().split('T')[0]} // Set min to 100 years ago
                                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 3)).toISOString().split('T')[0]} // Set max to 3 years ago
                                    onChange={(e) => setFechaNacimiento(new Date(e.target.value))}
                                />
                                {errors && <p className="absolute max-w-56 text-red-500 text-sm mt-1">{errors.fechaNacimiento ? errors.fechaNacimiento.toString() : ""}</p>}
                            </div>
                            
                        </div>

                        <Consentimiento />

                        <div className="mb-5">

                            <button
                                className="py-2 px-4 bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 focus:ring-offset-blue-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg"
                                type="submit"
                                disabled={isSaving}
                            >
                                {isSaving ? <div className=' w-full flex justify-center'><Loader /></div> : "Registrarse"}
                            </button>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                            <span className="w-1/5 border-b dark:border-gray-600 md:w-1/4"></span>
                            <span className='text-xs text-gray-500 '>Tienes una cuenta creada?</span>
                            <a
                                className="text-xs text-gray-500 hover:text-gray-600  dark:text-gray-400 hover:underline"
                                href="/start/login"
                            >
                                Inicie Sesión
                            </a>
                            <span className="w-1/5 border-b dark:border-gray-600 md:w-1/4"></span>
                        </div>
                    </form>
                    {showEmailVerification && (
                        <SignupEmail
                            email={email}
                            setCorrecto={setIsEmailVerified}
                            correcto={isEmailVerified}
                            setVerificarEmail={setShowEmailVerification}
                            setSaving={setIsSaving}
                        />
                    )}
                </div>
            </div>
        </main>


    );
}

export default Signup;

