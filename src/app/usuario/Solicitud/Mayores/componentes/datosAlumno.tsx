"use client"
import { NotebookText, User } from 'lucide-react';
import React, { useState } from 'react';


interface Datos {
    setDatosAlumno: React.Dispatch<React.SetStateAction<{
        nombre: string;
        apellido: string;
        telefono: number;
        correoElectronico: string;
        dni: number;
        pais: string;
        provincia: string;
        localidad: string;
        calle: string;
        numero: number;
        fechaNacimiento: string;
    }>>;
    datosAlumno: {
        nombre: string;
        apellido: string;
        telefono: number;
        correoElectronico: string;
        dni: number;
        pais: string;
        provincia: string;
        localidad: string;
        calle: string;
        numero: number;
        fechaNacimiento: string;
    };
    setError: React.Dispatch<React.SetStateAction<string>>;
}

const DatosAlumno: React.FC<Datos> = ({ setDatosAlumno, datosAlumno, setError }) => {
    const alumno = datosAlumno;
    const direccionAlumnoStr = `${datosAlumno.calle || ''} ${datosAlumno.numero || ''}, ${datosAlumno.localidad || 'Unknown'}, ${datosAlumno.provincia || 'Unknown'}, ${datosAlumno.pais || 'Unknown'}`;	


  
  
   
  
    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
          <div className="text-center mt-4">
            <h2 className="text-red-500 font-medium">
              Si faltan datos, deberás completarlos <a href="/usuario/Cuenta" className="text-sky-600 underline hover:text-sky-950">aquí.</a>
            </h2>
          </div>
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-blue-600 p-4 text-white">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <NotebookText className="w-5 h-5" />
                Tu Información
              </h2>
            </div>
      
            <div className="p-4 sm:p-6 flex flex-col md:grid md:grid-cols-2 gap-6 bg-sky-50">
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                  <User className="w-5 h-5 text-sky-700" />
                  Datos Personales
                </h3>
      
                <div className="mt-2 space-y-2">
                  <p className="font-medium"><span className="font-semibold">Nombre:</span> {alumno.nombre} {alumno.apellido}</p>
                  <p className="font-medium"><span className="font-semibold">DNI:</span> {alumno.dni}</p>
                  <p className="font-medium"><span className="font-semibold">Email:</span> {alumno.correoElectronico}</p>
                  <p className="font-medium"><span className="font-semibold">Fecha de Nacimiento:</span> {new Date(alumno.fechaNacimiento).toLocaleDateString()}</p>
                  <p className="font-medium"><span className="font-semibold">Dirección:</span> {direccionAlumnoStr}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
  };
export default DatosAlumno;