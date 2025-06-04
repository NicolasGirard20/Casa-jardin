import { useEffect, useState } from "react";
import { signupEmail } from "@/helpers/sendmail";
import { obtenerCodigoConfirmacion } from "@/services/redis";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, CheckCircle2, XCircle, Loader2, KeyRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { changePassword } from "@/services/Alumno";
import PasswordInput from "../passwordInput/passwordForm";

interface Datos {
  email: string;
  setVerificarEmail: React.Dispatch<React.SetStateAction<boolean>>;
  setSaving: React.Dispatch<React.SetStateAction<boolean>>;
}

const Paswordcomponent: React.FC<Datos> = ({ email, setVerificarEmail, setSaving }) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<{ passw?: string, newPassw?: string }>({});
  const [password, setPassword] = useState<string>("");
  const [newPasword, setNewPassword] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    if (errorMessage.passw) {
      const timer = setTimeout(() => {
        setErrorMessage({ passw: "" }); // Limpiar los errores después de 5 segundos
      }, 10000);

      return () => clearTimeout(timer); // Limpiar el timer si el componente se desmonta
    }
    if (errorMessage.newPassw) {
      const timer = setTimeout(() => {
        setErrorMessage({ newPassw: "" }); // Limpiar los errores después de 5 segundos
      }, 10000);

      return () => clearTimeout(timer); // Limpiar el timer si el componente se desmonta
    }
  }, [errorMessage]);

  const changePassw = async () => {
    setIsVerifying(true);
    if (password === "" || newPasword === "") return setErrorMessage({ passw: "Debe completar todos los campos", newPassw: "Debe completar todos los campos" });
    const passw = await changePassword(password, newPasword, email)
    console.log("changepassss", passw)
    if (typeof passw === "string") {
      setVerificarEmail(true)
      setIsVerifying(false)
      if (passw == "Contraseña incorrecta.") return setErrorMessage({ passw: passw })
      return setErrorMessage({ newPassw: passw })
    }
    
    
    setShowSuccess(true);
    setIsVerifying(false)
    const timer = setTimeout(() => {
      window.location.href = "/start/login"
    }, 5000);

    return () => clearTimeout(timer); // Limpiar el timer si el componente se desmonta

  }
  if (showSuccess) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50/80">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
              <CardTitle className="text-center">¡Cambio de contraseña exitoso!</CardTitle>
              <p className="text-center text-gray-600">
                Será redirigido automáticamente al inicio de sesión.
              </p>
              <div className="mt-4">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-50/80">
      <div className="relative h-auto">
        <Button
          onClick={() => { setVerificarEmail(false); setSaving(false); setErrorMessage({}); setPasswordVisible(false); }}
          className="absolute top-0 right-0 text-slate-600 hover:text-red-600"
          variant="ghost"
          size="icon"
        >
          <XCircle className="h-8 w-8" />
        </Button>
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <KeyRound className="h-6 w-6" />
              Cambio de contraseña
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    type= {passwordVisible ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrorMessage({});
                    }}
                    placeholder="Ingrese su contraseña"
                    className={`pr-10 ${errorMessage.passw ?  'border-red-500' : ''} `}
                    maxLength={40}
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute right-0 top-0 transform -translate-y-1 h-5 w-5 m-4 text-gray-400 cursor-pointer"
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
                  {errorMessage && (
                    <p className="text-sm text-red-500 mt-1">{errorMessage.passw}</p>
                  )}

                </div>
                <div className="relative">
                 <PasswordInput errors={{ password: errorMessage?.newPassw }} setPassword={setNewPassword} password={newPasword} placeholderPassw={"Ingrese su nueva contraseña"}/>
                </div>

              </div>

              <Button
                className="w-full"
                onClick={changePassw}
                disabled={isVerifying || !password || !newPasword}
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cambiando...
                  </>
                ) : (
                  "Cambiar contraseña"
                )}
              </Button>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Paswordcomponent;