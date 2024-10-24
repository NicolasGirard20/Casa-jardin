"use client";
// #region Imports
import React, { useEffect, useState } from "react";
import Navigate from "../../../components/start/navigate/page"
import But_aside from "../../../components/but_aside/page";
import Image from "next/image";
import Background from "../../../../public/Images/Background.jpeg";
import { getImagesUser } from "@/services/repoImage";
import { relative } from "path";

const RotatingImages: React.FC = () => {
  const[currentImageIndex, setCurrentImageIndex] = useState(0);
  const [images, setImages] = useState<any[]>([]);
  
  // Fetch images on component mount
  useEffect(() => {
    getImagesUser().then(response => {
      if (response.downloadurls) {
        setImages(response.downloadurls);
      }
    });
  }, []);
  
  //Cambiar imagenes cada 3 segundos
  useEffect(() => {
    if (images.length > 0) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [images]);

  return (
    <div className="relative w-80 h-70 ml-80 mt-10 rounded-lg overflow-hidden">
      {images.length > 0 && (
        <img src={images[currentImageIndex]} alt="Rotating Image" className="w-full h-auto" />
      )}
    </div>
  );
};


const Nosotros = () => {
  return (
      <main className="relative min-h-screen w-screen overflow-hidden">
          {/* Fondo */}
          <div className="fixed inset-0">
              <Image 
                  src={Background} 
                  alt="Background" 
                  layout="fill" 
                  objectFit="cover" 
                  quality={80} 
                  priority={true} 
                  className="z-0"
              />
          </div>

          {/* Encabezado fijo */}
          <div className="fixed top-0 left-0 right-0 bg-blue-400 flex justify-between w-full p-1 z-50">
              <Navigate />
          </div>

          {/* Contenido principal, ocupando todo el centro de la pantalla */}
          <div className="fixed top-20 bottom-20 left-0 right-0 z-10 flex flex-col justify-center items-start px-8 space-y-8">
              <h1 className="text-xl text-black">Misión:</h1>
              <h2 className="text-xl text-black max-w-lg">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                  Cras purus mauris, congue in elit eu, hendrerit interdum mi. 
                  Praesent lectus nibh, feugiat blandit justo fringilla, luctus semper odio.
              </h2>

              <h1 className="text-xl text-black">Visión:</h1>
              <h2 className="text-xl text-black max-w-lg">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                  Cras purus mauris, congue in elit eu, hendrerit interdum mi. 
                  Praesent lectus nibh, feugiat blandit justo fringilla, luctus semper odio.
              </h2>

              <h1 className="text-xl text-black">Valores:</h1>
              <h2 className="text-xl text-black max-w-lg">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                  Cras purus mauris, congue in elit eu, hendrerit interdum mi. 
                  Praesent lectus nibh, feugiat blandit justo fringilla, luctus semper odio.
              </h2>
          </div>

          {/* Contenedor de imágenes en rotación */}
          <div className="fixed  top-20 bottom-40 right-8 z-10">
              <RotatingImages />
          </div>

          {/* Pie de página fijo */}
          <div className="fixed bottom-0 left-0 right-0 bg-white p-1 z-40 opacity-75">
              <But_aside />
          </div>
      </main>
  );
}

export default Nosotros;


