"use client";
import React, { useState, useEffect } from 'react';
import { FileText, Users, UserRound, Loader2 } from 'lucide-react';
import Navigate from '@/components/alumno/navigate/page';
import But_aside from '@/components/but_aside/page';
import { fetchUserData } from '@/helpers/cookies';

interface AlumnoDetails {
  id: number;
  nombre: string;
  apellido: string;
  dni: number;
  telefono: number;
  email: string;
  fechaNacimiento: string;
  direccionId?: number;
  rolId?: number;
}

function App() {
  const [edad, setEdad] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [alumnoDetails, setAlumnoDetails] = useState<AlumnoDetails | undefined>();

  useEffect(() => {
    const authorizeAndFetchData = async () => {
      try {
        setIsLoading(true);
        // Simulated data fetch - replace with actual API calls
        
        const user = await fetchUserData();
        setAlumnoDetails(user);
        // Calculate age from birth date
        const birthDate = new Date(user.fechaNacimiento);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        setEdad(age);
      } catch (error) {
        setError("Error al cargar los datos del usuario");
      } finally {
        setIsLoading(false);
      }
    };

    authorizeAndFetchData();
  }, []);

  const validateClick = () => {
    if (edad >= 18) {
      if (!alumnoDetails?.dni || !alumnoDetails?.telefono || !alumnoDetails?.direccionId) {
        return "Debe completar los datos personales antes de continuar";
      }
    } else {
      if (!alumnoDetails?.dni || !alumnoDetails?.direccionId) {
        return "Debe completar los datos personales antes de continuar";
      }
    }
    return null;
  };

  const handleRegistration = (type: 'minor' | 'adult') => {
    const validation = validateClick();
    if (validation) {
      setError(validation);
      return;
    }
    window.location.href = type === 'minor' 
      ? "/usuario/Solicitud/Menores"
      : "/usuario/Solicitud/Mayores";
  };

  const handleDownload = (type: 'minor' | 'adult') => {
    const fileName = type === 'minor' 
      ? "Planilla inscripción menores.pdf"
      : "Planilla inscripción mayores.pdf";
    const fileUrl = type === 'minor'
      ? '/inscripcion_pdf/cet INSCRIPCIONES 2023  uso de imagen y salidas cercasnas.pdf'
      : '/inscripcion_pdf/Planilla inscripción adultos.pdf';

    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <Navigate />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Elija el tipo de inscripción</h2>
          <p className="text-gray-600">Seleccione la opción que corresponda según su edad</p>
        </div>

        {/* Registration Options */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {isLoading ? (
            <div className="col-span-2 mb-62 flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              
            </div>
          ) : (
            <>
              {/* Minor Registration Card */}
              <div className={`bg-white rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl ${edad >= 18 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <div className="p-8">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Inscripción para Menores</h3>
                  <p className="text-gray-600 mb-6">Para participantes menores de 18 años. Incluye autorización de imagen y salidas cercanas.</p>
                  <button
                    onClick={() => handleRegistration('minor')}
                    disabled={edad >= 18}
                    className="w-full text-white bg-blue-600 py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Continuar Inscripción
                  </button>
                </div>
              </div>

              {/* Adult Registration Card */}
              <div className={`bg-white rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl ${edad < 18 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <div className="p-8">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                    <UserRound className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Inscripción para Adultos</h3>
                  <p className="text-gray-600 mb-6">Para participantes mayores de 18 años. Proceso simplificado de inscripción.</p>
                  <button
                    onClick={() => handleRegistration('adult')}
                    disabled={edad < 18}
                    className="w-full text-white bg-blue-600 py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Continuar Inscripción
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* PDF Downloads Section */}
        <div className="mt-16 bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">Formularios para Inscripción Presencial</h3>
          <div className="space-y-4">
            <button 
              onClick={() => handleDownload('minor')}
              className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <FileText className="w-6 h-6 text-red-500 mr-3" />
                <span className="text-gray-700">Formulario para Menores</span>
              </div>
              <span className="text-sm text-gray-500">Descargar PDF</span>
            </button>
            <button 
              onClick={() => handleDownload('adult')}
              className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <FileText className="w-6 h-6 text-red-500 mr-3" />
                <span className="text-gray-700">Formulario para Adultos</span>
              </div>
              <span className="text-sm text-gray-500">Descargar PDF</span>
            </button>
          </div>
        </div>
        
      </div>
        {/* Footer */}
        <But_aside />
      {/* Error Modal */}
      {error && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-red-600 mb-2">Error</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => setError('')}
              className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}


    </main>
  );
}

export default App;