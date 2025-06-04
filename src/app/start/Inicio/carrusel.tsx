// Objetivo: Crear el carrusel de la página de inicio
"use client"

import { mapearImagenes } from "@/helpers/repoImages";
import { getImages_procesoInscrip } from "@/services/repoImage";
import Image from "next/image";
import { useEffect, useState } from "react";

// Constante de inicio utilizando el Navigate y But_aside
const Carrusel = () => {
    const [cursos, setCursos] = useState<any[]>([]);
    const [images, setImages] = useState<any[]>([]);
    const [downloadurls, setDownloadurls] = useState<any[]>([]);
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Fetch images on component mount
    useEffect(() => {
        if (images.length === 0 && downloadurls.length === 0) fetchImages();
    }, []);
    // Método para obtener las imagenes
    const fetchImages = async () => {
        const result = await getImages_procesoInscrip();
    
        if (result.error) {
            setErrorMessage(result.error);
        } else {
            console.log(result);
            setImages(result.images);
            setDownloadurls(result.downloadurls);
        }
    };
    return (
        <div id="indicators-carousel" className={`relative rounded-lg sm:w-full md:w-full lg:w-1/2 `}>
            {/* Carousel wrapper */}
            <div className="relative h-56 overflow-hidden rounded-lg md:h-[30vh] bg-white">
                {images.map((image, index) => (
                    <div
                        key={index}
                        className={`${index === currentImageIndex ? "block" : "hidden"
                            } duration-700 ease-in-out`}
                        data-carousel-item={index === currentImageIndex ? "active" : ""}
                    >
                        <Image
                            src={downloadurls[index]}
                            className={`rounded-lg w-full h-full object-cover ${currentImageIndex === 0 ? "translate-y-10" : ""}`}
                            alt={`Slide ${index}`}
                            layout="fill"
                        />
                    </div>
                ))}
            </div>
            {/* Slider indicators */}
            <div className="absolute bottom-5  flex -translate-x-1/2 space-x-3 left-1/2">
                {images.map((_, index) => (
                    <button
                        key={index}
                        type="button"
                        className="w-3 h-3 rounded-full bg-slate-500 hover:bg-slate-700"
                        aria-current={index === currentImageIndex ? "true" : "false"}
                        aria-label={`Slide ${index}`}
                        data-carousel-slide-to={index}
                        onClick={() => setCurrentImageIndex(index)}
                    ></button>
                ))}
            </div>
            {/* Slider controls */}
            <div className="absolute top-0 left-0 z-30 flex items-center justify-center h-full px-2">
                <button
                    type="button"
                    className=" cursor-pointer group focus:outline-none"
                    data-carousel-prev
                    onClick={() => {
                        if (currentImageIndex > 0) setCurrentImageIndex(currentImageIndex - 1);
                        console.log(currentImageIndex);
                    }}
                >
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none">
                        <svg
                            className="w-4 h-4 text-white dark:text-gray-800 rtl:rotate-180"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 6 10"
                        >
                            <path
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M5 1 1 5l4 4"
                            />
                        </svg>
                        <span className="sr-only">Previous</span>
                    </span>
                </button>
            </div>

            <div className="absolute top-0  z-30 flex items-center justify-center h-full px-2">
                <button
                    type="button"
                    className="h-10 px-4 cursor-pointer group focus:outline-none"
                    data-carousel-next
                    onClick={() => {
                        if (currentImageIndex < images.length - 1) setCurrentImageIndex(currentImageIndex + 1);
                        console.log(currentImageIndex);
                    }}
                >
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none">
                        <svg
                            className="w-4 h-4 text-white dark:text-gray-800 rtl:rotate-180"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 6 10"
                        >
                            <path
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="m1 9 4-4-4-4"
                            />
                        </svg>
                        <span className="sr-only">Next</span>
                    </span>
                </button>
            </div>

        </div>
    );
};

export default Carrusel;
