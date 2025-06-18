import nodemailer from "nodemailer";
import path from "path";
import { guardarCodigoConfirmacion } from "@/services/redis";
import { NextApiRequest, NextApiResponse } from "next";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { receptor } = req.body;

  // Generate a 6-digit confirmation code
  const randomCode = Math.floor(100000 + Math.random() * 900000);

  // Path to the logo image
  const logoPath = path.join(process.cwd(), 'public', 'Images', 'LogoCasaJardin.png');

  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_ADDRESS,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 60000,
    socketTimeout: 60000,
  });

  //verificar connection
  await new Promise((resolve, reject) => {
    // Verify connection configuration
    transporter.verify(function (error, success) {
      if (error) {
        console.log(error);
        reject(error);
      } else {
        console.log("Server is ready to take our messages");
        resolve(success);
      }
    });
  });

  const mailData = {
    from: process.env.EMAIL_ADDRESS,
    to: receptor,
    subject: "Código de confirmación - Casa Jardín",
    text: "Código de confirmación",
    html: `
      <body>
        <div style="font-family: Arial, sans-serif; text-align: center; background-color: black; padding: 2%;">
          <h1 style="color: white;">Casa Jardín</h1>
          <div style="font-family: Arial, sans-serif; text-align: center; background-color: rgb(255, 255, 255); padding-bottom: 5px; margin-left: 10%; margin-right: 10%;">
            <h1 style="color: #333;">Código de confirmación</h1>
            <img src="cid:logoimage" alt="logo"></img>
            <p>Tu código es: <strong style="font-size: 18px; color: brown;">${randomCode}</strong></p>
            <p>Por favor, ingrésalo en la página para poder crear su cuenta.</p>
          </div>
        </div>
      </body>
    `,
    attachments: [
      {
        filename: "LogoCasaJardin.png",
        path: logoPath,
        cid: "logoimage",
      },
    ],
  };

  //enviar email
  await new Promise((resolve, reject) => {
    // Send mail
    transporter.sendMail(mailData, (err, info) => {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        console.log(info);
        resolve(info);
      }
    });
  });

  // Save the confirmation code in Redis
  await guardarCodigoConfirmacion(receptor, randomCode.toString());

  res.status(200).json({ status: "OK" });
};