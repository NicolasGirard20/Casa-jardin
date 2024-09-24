"use client";
// #region Imports
import React, { useEffect, useState } from "react";
import Navigate from "../../../components/Start/navigate/page"
import But_aside from "../../../components/but_aside/page";
import Image from "next/image";
import Background from "../../../../public/Images/Background.jpg";
import { getImages_talleresAdmin } from "@/services/repoImage";

const RotatingImages: React.FC = () => {
  const[currentImageIndex, setCurrentImageIndex] = useState(0);
  const [images, setImages] = useState<any[]>([]);
  
  // Fetch images on component mount
  useEffect(() => {
    getImages_talleresAdmin().then(response => {
      if (response.images) {
        setImages(response.images);
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
    <div className="relative w-80 h-70 ml-20 mt-10">
      {images.length > 0 && (
        <img src={images[currentImageIndex]} alt="Rotating Image" className="w-full h-auto" />
      )}
    </div>
  );
};






// Constante de inicio utlizando el Navigate y But_aside
const Inicio = () =>{
  return (
    <main className="relative min-h-screen w-screen">
            <Image src={Background} alt="Background" layout="fill" objectFit="cover" quality={80} priority={true}/>
    <div>
        <div className="fixed bg-blue-400  justify-between w-full p-4">
      <Navigate/>
      </div>
        <div className="fixed bottom-0 mt-20 bg-white w-full" style={{ opacity: 0.66 }}>
      <But_aside />
      </div>
      <div className="relative z-10 flex items-center h-40 ml-20">
          <h1 className="text-xl text-black mt-40">Bienvenidos a Casa Jardin</h1>
        </div> 
      <div>
        <RotatingImages/>
        </div>
    </div>
    </main>
  );
}

export default Inicio;