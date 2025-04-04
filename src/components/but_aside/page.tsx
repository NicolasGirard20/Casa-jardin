"use client";
import Logo from "../../../public/Images/LogoCasaJardin.png";
import Image from "next/image";


import { CameraIcon, Instagram, Mail, MapPin, Phone } from "lucide-react";

export default function But_aside() {

  const handleWhatsAppClick = () => {
    const phoneNumber = '3435008302'; // Número de teléfono de Casa Jardín
    const message = encodeURIComponent('¡Hola! Estoy interesado en tu producto.');
    const url = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(url, '_blank'); // Abre en una nueva pestaña
  };
  const handleInstagramClick = () => {
    const user = "cet.casajardin"; // Usuario de Instagram
    const url = `https://www.instagram.com/${user}`;
    window.open(url, '_blank'); // Abre en una nueva pestaña
  }

  return (
    <footer className="bg-gradient-to-r from-sky-700 to-sky-900 text-white py-8 px-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Logo and Text Section */}
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <Image src={Logo} alt="Logo Casa Jardín" className="w-16 h-16 text-emerald-700" />
          <div>
            <h2 className="text-xl font-semibold">
              Centro Educativo y Terapéutico
            </h2>
            <h3 className="text-lg text-emerald-200">"Casa Jardín"</h3>
          </div>
        </div>

        {/* Contact Buttons */}
        <div className="flex flex-wrap justify-center gap-6" >
          <button onClick={handleWhatsAppClick} className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors duration-200">
            <Phone className="w-5 h-5" /> WhatsApp
          </button>
            <button onClick={handleInstagramClick} className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors duration-200">
            <Instagram className="w-5 h-5"/>
            Instagram
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors duration-200" onClick={() => {
                try {
                  window.open(
                    "https://www.google.com/maps?q=Padre+Becher+991,+Crespo",
                    "_blank"
                  );
                } catch (error) {
                  console.error("Error al abrir Google Maps:", error);


                }
              }} >
              <MapPin className="w-5 h-5" /> Ubicación
          </button>
{/*           <ContactButton
            icon={<MapPin className="w-5 h-5" />}
            label="Ubicación"
            href="https://maps.google.com"
          /> */}
{/*           <ContactButton
            icon={<Mail className="w-5 h-5" />}
            label="Correo"
            href="mailto:contact@example.com"
          /> */}
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="mt-8 pt-4 border-t border-emerald-600/30 text-center text-sm text-emerald-200">
        <p>© {new Date().getFullYear()} Casa Jardín. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}

