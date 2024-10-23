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


const Nosotros = () =>{
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
        <div className="relative z-10 flex flex-col items-start h-40 ml-60">
            <h1 className="text-xl text-black mt-40">Misión:</h1>
            <h2 className="text-xl text-black mt-2  max-w-lg">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
              Cras purus mauris, congue in elit eu, hendrerit interdum mi. 
              Praesent lectus nibh, feugiat blandit justo fringilla, luctus semper odio.
            </h2>
            <h1 className="text-xl text-black mt-10">Visión:</h1>
            <h2 className="text-xl text-black mt-2  max-w-lg">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
              Cras purus mauris, congue in elit eu, hendrerit interdum mi. 
              Praesent lectus nibh, feugiat blandit justo fringilla, luctus semper odio.
            </h2>
            <div className="relative z-10 flex flex-col items-start h-40 mt-10">
              <h1 className="text-xl text-black mt-10">Valores:</h1>
              <h2 className="text-xl text-black mt-2  max-w-lg">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                Cras purus mauris, congue in elit eu, hendrerit interdum mi. 
                Praesent lectus nibh, feugiat blandit justo fringilla, luctus semper odio.
              </h2>
            </div>
        </div>
        <div className="flex justify-center items-center ml-80 relative z-10">
            <RotatingImages/>
            </div>
        </div>
        </main>
    );
}

export default Nosotros;