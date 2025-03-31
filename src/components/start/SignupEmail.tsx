import { useState } from "react";
import { signupEmail } from "@/helpers/sendmail";
import { obtenerCodigoConfirmacion } from "@/services/redis";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Datos {
  email: string;
  setCorrecto: React.Dispatch<React.SetStateAction<boolean>>;
  correcto: boolean;
  setVerificarEmail: React.Dispatch<React.SetStateAction<boolean>>;
  setSaving: React.Dispatch<React.SetStateAction<boolean>>;
}

const SignupEmail: React.FC<Datos> = ({ email, setCorrecto, correcto, setVerificarEmail, setSaving }) => {
  const [codigo, setCodigo] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const { toast } = useToast();

  const handleEmail = async () => {
    if (email === "") return;
    
    setIsSending(true);
    try {
      const response = await signupEmail(email);
      if (response.ok) {
        setEmailSent(true);
        toast({
          title: "Código enviado",
          description: "Revisa tu bandeja de entrada",
          duration: 3000,
        });
      } else {
        toast({
          title: "Error",
          description: "No se pudo enviar el código",
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al enviar el código",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleVerificarCodigo = async () => {
    if (!codigo) {
      setErrorMessage("Por favor ingresa el código");
      return;
    }

    setIsVerifying(true);
    setErrorMessage("");
    
    try {
      const codigoGuardado = await obtenerCodigoConfirmacion(email);
      if (codigoGuardado === codigo) {
        setCorrecto(true);
        setShowSuccess(true);
        toast({
          title: "¡Verificación exitosa!",
          description: "El código ingresado es correcto",
          duration: 3000,
        });
      } else {
        setCorrecto(false);
        setErrorMessage("Código incorrecto. Por favor verifica e intenta nuevamente");
      }
    } catch (error) {
      setErrorMessage("Ocurrió un error al verificar el código");
    } finally {
      setIsVerifying(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50/80">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
              <CardTitle className="text-center">¡Código Verificado!</CardTitle>
              <p className="text-center text-gray-600">
                Por favor, espere unos segundos mientras procesamos su solicitud...
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
          onClick={() =>{ setVerificarEmail(false); setSaving(false); }} 
          className="absolute top-0 right-0 text-slate-600 hover:text-red-600" 
          variant="ghost"
          size="icon"
        > 
          <XCircle className="h-8 w-8" />
        </Button>
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <Mail className="h-6 w-6" />
              Verificación de Email
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                Se enviará un código de verificación a:
              </p>
              <p className="font-medium text-lg">{email}</p>
              <p className="text-sm text-gray-500">
                El código será válido por 5 minutos
              </p>
            </div>

            <div className="space-y-4">
              <Button
                className="w-full"
                onClick={handleEmail}
                disabled={isSending || emailSent}
              >
                {isSending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : emailSent ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Código Enviado
                  </>
                ) : (
                  "Enviar Código"
                )}
              </Button>

              {emailSent && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="relative">
                      <Input
                        type="text"
                        value={codigo}
                        onChange={(e) => {
                          setCodigo(e.target.value);
                          setErrorMessage("");
                        }}
                        placeholder="Ingrese el código recibido"
                        className={`pr-10 ${errorMessage ? 'border-red-500' : ''}`}
                        maxLength={6}
                      />
                      {correcto && <CheckCircle2 className="absolute right-3 top-2.5 h-5 w-5 text-green-500" />}
                      {correcto === false && <XCircle className="absolute right-3 top-2.5 h-5 w-5 text-red-500" />}
                    </div>
                    {errorMessage && (
                      <p className="text-sm text-red-500 mt-1">{errorMessage}</p>
                    )}
                  </div>

                  <Button 
                    className="w-full"
                    onClick={handleVerificarCodigo}
                    disabled={isVerifying || !codigo}
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verificando...
                      </>
                    ) : (
                      "Verificar Código"
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignupEmail;