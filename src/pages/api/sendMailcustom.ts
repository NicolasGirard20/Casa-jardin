import nodemailer from "nodemailer";
import path from "path";
import { NextApiRequest, NextApiResponse } from "next";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { receptor, titulo, texto} = req.body;

  console.log("titulo", titulo)
  console.log("texto", texto)

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
    subject: titulo,
    text: texto,
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



  res.status(200).json({ status: "OK" });
};