"use client"
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from "next/image";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirige automáticamente a la página /start/Inicio después de 3 segundos
    router.push('/start/Inicio');
    const timer = setTimeout(() => {
      router.push('/start/Inicio');
    }, 3000);

    // Limpia el temporizador si el componente se desmonta
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-4xl font-bold mb-4">Bienvenido a la App</h1>
        <Image src="/logo.png" alt="Logo" width={200} height={200} className="mb-4" />
        <p className="text-lg">Redirigiendo a la página de inicio...</p>
      </div>
    </main>
  );
}