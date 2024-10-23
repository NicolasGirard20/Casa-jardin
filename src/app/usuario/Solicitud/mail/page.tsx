"use client"

import { useState, useEffect } from "react";
import { emailTest } from "@/helpers/email";
function EmailPage() {
  // Estados para gestionar los datos del formulario y errores
  const [email, setEmail] = useState("");

  const handleEmail = async () =>{
    console.log("hola")
    emailTest()
    console.log("enviado")

  }
  return (
    <>
        <h1> Enviar email de confirmacion</h1>
        <button className="bg-slate-500" onClick={handleEmail}> Enviar</button>
    </>
  );
}

export default EmailPage;