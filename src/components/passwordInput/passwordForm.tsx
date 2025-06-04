import { CheckCircle, Circle } from "lucide-react";
import { useState } from "react";

interface PasswordInputProps {
    password: string;
    setPassword: React.Dispatch<React.SetStateAction<string>>;
    errors: { password?: string };
    placeholderPassw: string
}

export default function PasswordForm(passwordProps: PasswordInputProps) {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [infoPassword, setinfoPassword] = useState(false);
    const { password, errors, setPassword, placeholderPassw } = passwordProps;

    const requisitos = [
        {
            label: 'Debe incluir al menos una letra mayúscula.',
            test: (pwd: string) => /[A-Z]/.test(pwd),
        },
        {
            label: 'Debe incluir al menos una letra minúscula.',
            test: (pwd: string) => /[a-z]/.test(pwd),
        },
        {
            label: 'Debe incluir al menos un número.',
            test: (pwd: string) => /[0-9]/.test(pwd),
        },
        {
            label: 'Debe tener al menos 8 caracteres.',
            test: (pwd: string) => pwd.length >= 8,
        },
    ];
    return (
        <div className="relative">
            <label
                className="font-semibold text-sm text-gray-600 pb-1 block"
                htmlFor="email"
            >
                Contraseña
            </label>
            <input
                type={passwordVisible ? "text" : "password"}
                id="password"
                onFocus={() => setinfoPassword(true)}
                onBlur={() => setinfoPassword(false)}
                className={` rounded-lg px-3 py-2 mt-1 ${errors?.password ? "border-red-600" : "border-gray-200"}  text-sm w-full border `}
                placeholder= {placeholderPassw}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
             <p className="absolute max-w-56 text-red-500 text-sm mt-1">{errors.password}</p>
                        {(infoPassword && !requisitos.every(req => req.test(password))) && (
                <ul className=" bg-white p-2  rounded-md border z-30 absolute text-sm text-gray-700 space-y-1">
                    {requisitos.map((req, index) => {
                        const cumple = req.test(password);
                        return (
                            <li key={index} className="flex items-center gap-2">
                                {cumple ? (
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                ) : (
                                    <Circle className="w-4 h-4 text-gray-400" />
                                )}
                                <span className={cumple ? 'text-green-600' : ''}>{req.label}</span>
                            </li>
                        );
                    })}
                </ul>
            )}

            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="absolute inset-y-5 end-0 h-5 w-5 m-4 text-gray-400 cursor-pointer"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                onClick={() => { setPasswordVisible(!passwordVisible); console.log(passwordVisible); }}
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
    )
}