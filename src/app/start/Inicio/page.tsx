"use client";
// #region Imports
import React, { useEffect, useState } from "react";
import Navigate from "../../../components/start/navigate/page";
import But_aside from "../../../components/but_aside/page";
import Image from "next/image";
import childStartImage from "../../../../public/Images/childStarImage.jpg";
import goalSectionStartImage from "../../../../public/Images/goalSectionStartImage.jpg";
import { getImages_procesoInscrip, get_rotatingImages } from "@/services/repoImage";
import Logo from "../../../../public/Images/LogoCasaJardin.png";
import Background from "../../../../public/Images/BackgroundSolicitudes.jpg";
import { mapearImagenes } from "@/helpers/repoImages";
import Carrusel from "./carrusel";


const RotatingImages: React.FC = () => {
  const [images, setImages] = useState<any[]>([]);
  const [downloadurls, setDownloadurls] = useState<any[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const rotationInterval = 3000; // Tiempo en milisegundos para rotación automática (3 segundos)

  // Fetch images on component mount
  useEffect(() => {
    fetchImages();
  }, []);

  useEffect(() => {
    // Configurar el temporizador para rotación automática
    const intervalId = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, rotationInterval);

    // Limpiar el temporizador al desmontar el componente
    return () => clearInterval(intervalId);
  }, [images]);

  const fetchImages = async () => {
    const result = await get_rotatingImages();
    if (result.images) {
      setImages(result.images);
      setDownloadurls(result.downloadurls);
    }
  };

  return (
    <div className="w-full h-96 flex items-center justify-center overflow-hidden">
      {downloadurls.length > 0 && (
        <div className="relative rounded-lg w-full lg:w-4/5 h-full">
          <Image
            src={downloadurls[currentImageIndex]}
            alt="Rotating Banner"
            layout="fill"
            objectFit="cover"
            quality={80}
            priority={true}
            className="z-0"
          />
        </div>
      )}
    </div>
  );
};
// Constante de inicio utilizando el Navigate y But_aside
const Inicio = () => {
  const [cursos, setCursos] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [downloadurls, setDownloadurls] = useState<any[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Método para obtener las imagenes
  const fetchImages = async () => {
    const result = await getImages_procesoInscrip();
    console.log(result.images, "LAS IMAGENESSSSS");
    console.log(result.downloadurls, "LOS DOWNLOADURLS");
    if (result.error) {
      setErrorMessage(result.error);
    } else {
      console.log(result);
      setImages(result.images);
      setDownloadurls(result.downloadurls);

      // Mapear las imágenes con los cursos
      const updatedCursos = mapearImagenes(cursos, { images: result.images, downloadurls: result.downloadurls });

      // Ordenar los cursos alfabéticamente por nombre
      updatedCursos.sort((a, b) => a.nombre.localeCompare(b.nombre));

      // Actualiza el estado de los cursos
      setCursos(updatedCursos);

      // Marcar las imágenes como cargadas
      setImagesLoaded(true);

      // Hacer un console.log de las imageUrl después de actualizar el estado
      updatedCursos.forEach((curso) => {
        if (curso.imageUrl) {
          console.log(`Curso: ${curso.nombre}, Image URL: ${curso.imageUrl}`);
        }
      });
    }
  }

  //region Return
  return (
    <main className="relative min-h-screen">
      {/* Fondo */}
      <div className="fixed inset-0 z-[-1] opacity-70 h-full w-full">
        <Image src={Background}
          alt="Background"
          layout="fill"
          objectFit="cover"
          quality={80}
          priority={true}
        />
      </div>
      {/* Navegación fija */}
      <div className="fixed top-0 w-full z-50">
        <Navigate />
      </div>

      {/* Banner de imágenes */}
      <div className="relative  z-30 mt-18  lg:mt-20"> {/* mt-16 para dar espacio al Navigate */}
        <RotatingImages />
      </div>

      {/* Contenido principal */}
      <div className="flex flex-col items-center justify-center mt-10 ">
        <section className="py-42  w-full lg:w-2/3 md:w-2/3 text-pretty font-sans text-lg leading-relaxed ">
          <div className="container mx-auto ">
            <div className="grid items-center w-full  gap-8 2xl:grid-cols-2 shadow-lg bg-slate-50 rounded-lg p-2">
              <div className="flex flex-col p-2 items-center text-center 2xl:items-start 2xl:text-left">
                <div
                  className="mt-2 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground">
                  Qué somos?<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    className="lucide lucide-arrow-down-right ml-2 size-4">
                    <path d="m7 7 10 10"></path>
                    <path d="M17 7v10H7"></path>
                  </svg>
                </div>
                <h1 className="my-2 mb-4 p-2 text-pretty text-4xl font-bold lg:text-6xl">Bienvenidos a Casa Jardin</h1>
                <p className="mb-8 max-w-xl text-zinc-600 lg:text-xl py-2 px-6">
                  ¡Bienvenidos a Casa Jardin, un espacio para Aprender, Crear y Crecer!
                  <br />
                  <br />
                  En nuestra academia, creemos que el aprendizaje no tiene límites de edad.
                  Por eso, hemos diseñado un lugar donde personas de todas las generaciones,
                  desde los más pequeños hasta adultos, pueden desarrollar nuevas habilidades,
                  descubrir sus talentos y explorar su creatividad.
                </p>
              </div>
              <div className="flex justify-center">
                <Image className="max-h-96 object-cover rounded-md" src={childStartImage} alt="childStart" width={500} height={400} />
              </div>
            </div>
          </div>
        </section>
        <section className="  mx-auto w-full lg:w-2/3 md:w-2/3  ">
          <div className=" text-pretty font-sans text-lg leading-relaxed mx-auto bg-blue-200 shadow-lg rounded-lg max-w-screen-2xl px-4 py-8 sm:px-6 lg:px-8 ">
            <div className="ml-5 grid grid-cols-1 gap-8 md:grid-cols-2 2xl:grid-cols-4 md:items-center md:gap-6">
              <div className="md:col-span-4 2xl:col-span-1 mb-8 md:mb-0 w-full">
                <div className="max-w-2xl mx-auto">
                  <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl md:text-3xl">
                    Compartiendo una misma meta
                  </h2>
                  <p className="mt-4 w-full text-gray-600 lg:text-lg">
                    Nuestro objetivo es ofrecer un entorno inclusivo y acogedor donde cada estudiante
                    se sienta inspirado para alcanzar su máximo potencial. Ya sea que busques explorar un
                    nuevo pasatiempo, mejorar tus habilidades o disfrutar de un espacio creativo, aquí
                    encontrarás una comunidad apasionada y comprometida contigo.
                  </p>
                </div>
              </div>
              <div className="md:col-span-2 xl:ml-40 xl:col-span-3 mt-8 md:mt-0">
                <Image className="lg:max-h-80 max-h-60 min-h-72 lg:ml-5 xl:ml-15 md:ml-0 sm:ml-0 rounded-md object-cover" src={goalSectionStartImage} alt="goalChild" width={500} height={500} />
              </div>
            </div>
          </div>
        </section>


        <div className=" lg:flex md:flex sm:flex-col justify-center items-center lg:justify-around p-2  rounded-lg shadow-lg w-full lg:w-2/3 md:w-2/3 h-full mt-10 bg-slate-50">
          <div className=" flex flex-col p-4">
            <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">Pasos a seguir para registrarse:</h1>
            <h2 className="mb-8 max-w-xl text-zinc-600 lg:text-xl">¡Únete a nosotros y forma parte de esta experiencia única!</h2>
          </div>
          <Carrusel />
        </div>

      </div>

      {/* Recordatorio colocado arriba */}
      <div className="w-full z-40  bg-yellow-100  text-yellow-700 p-4 text-center mt-4 shadow-md ">
        <p className="text-lg">
          Nota: Para aprovechar al máximo nuestra plataforma, recuerda{" "}
          <a className="font-semibold hover:underline hover:cursor-pointer" href="/start/login">iniciar sesión</a> o{" "}
          <a className="font-semibold hover:underline hover:cursor-pointer" href="/start/signup">registrarte</a> utilizando el botón "Ingresar" en la parte superior derecha.
        </p>
      </div>


      {/* Botón de navegación adicional */}
      <div
        className=" bottom-0 py-0.1 border-t w-full z-30 bg-sky-600 opacity-90"
      >
        <But_aside />
      </div>
    </main>
  );
};

export default Inicio;