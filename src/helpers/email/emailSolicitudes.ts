"use server";
import path from "path";
import nodemailer from "nodemailer";
import { guardarCodigoConfirmacion} from "@/services/redis";


// Configuración del servicio de correo
const googleTransporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_ADDRESS, // por ahora es mi correo, despues hay que cambiarlo
    pass: process.env.EMAIL_APP_PASSWORD,
  },
   tls: {
    rejectUnauthorized: false, // Útil si hay problemas con el certificado.
  },
  connectionTimeout: 60000, // Tiempo de espera para la conexión inicial (15 segundos)
  socketTimeout: 60000, // Tiempo de espera para la transmisión de datos (15 segundos)
});


// Genera la ruta absoluta desde el directorio raíz del proyecto
const logoPath = path.join(process.cwd(), 'public', 'Images', 'LogoCasaJardin.png');

// Función para enviar un correo electrónico con el código de confirmación
export async function emailRechazo(receptor: string, title: string, body: string): Promise<void> {
  console.log("email rechazo");
  googleTransporter
    .sendMail({
      from: process.env.EMAIL_ADDRESS,
      to: receptor,
      subject: title,
      text: body,
    })
    .then((): void => {
      console.log("email sent");
    })
    .catch((error: Error): void => {
      console.error("error sending email", error);
    });
}

export async function emailAceptar(receptor: string, title: string, body: string): Promise<void> {
  console.log("email aceptar");
  googleTransporter
    .sendMail({
      from: process.env.EMAIL_ADDRESS,
      to: receptor,
      subject: title,
      text: body,
    })
    .then((): void => {

      console.log("email sent");
    })
    .catch((error: Error): void => {
      console.error("error sending email", error);
    });
}