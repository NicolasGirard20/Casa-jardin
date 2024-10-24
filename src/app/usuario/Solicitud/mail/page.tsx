"use client"

import { useState, useEffect } from "react";
import { emailTest } from "@/helpers/email";
import { obtenerCodigoConfirmacion} from "@/services/redis";
function EmailPage() {
  // Estados para gestionar los datos del formulario y errores
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [correcto, setCorrecto] = useState(false);

  const handleEmail = async () =>{
    if(email === "") return
    emailTest(email)
  }

  const handleVerificarCodigo = async () =>{
    const codigoGuardado = await obtenerCodigoConfirmacion(email)
    if(codigoGuardado === codigo){
      setCorrecto(true)
      console.log("Codigo correcto")
    }else{
      setCorrecto(false)
      console.log("Codigo incorrecto")
  }
}
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem' }}>
       <h1>Escriba mail para recibir el código: </h1>
       <input 
        type="text" 
        onChange={(e) => setEmail(e.target.value)} 
        className="p-2 border rounded" 
        placeholder="Ingrese su correo"
      />
      <button className="bg-slate-500 p-2 rounded" onClick={handleEmail}>Enviar Código</button>
      <h1>Verificar código:</h1>
      <input 
        type="text" 
        onChange={(e) => setCodigo(e.target.value)} 
        className="p-2 border rounded" 
        placeholder="Ingrese el código"
      />
      <button className="bg-slate-500 p-2 rounded" onClick={handleVerificarCodigo}>Verificar</button>
      {correcto ? (
        <h1 style={{ color: 'green' }}>Código correcto!</h1>
      ) : (
        <h1 style={{ color: 'red' }}></h1>
      )}
    </div>
  );
}

export default EmailPage;