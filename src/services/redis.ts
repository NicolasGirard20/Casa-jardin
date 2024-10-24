"use server";
// Redis es una base de datos en memoria que se utiliza para almacenar datos en caché
// Sirve para guardar temporalmente los códigos de confirmación para las solicitudes.

import { createClient } from 'redis';

const client = createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_URL,
        port: 19586
    }
});

client.on('error', (err) => {
  console.error('Error al conectar con Redis:', err);
});

client.on('connect', () => {
  console.log('Conexión exitosa con Redis');
});

// El código es válido por 5 minutos (300 segundos)
const duracion = 300;

async function initializeRedis() {
    if (!client.isOpen) {
      await client.connect();
    }
  }

  /* async function finalizeRedis() {
    if (client.isOpen) {
      await client.disconnect();
    }
  } */

export async function guardarCodigoConfirmacion(email: string, codigo: string) {
    await initializeRedis();
    const key = `confirmacion:${email}`;
  try {
    await client.setEx(key, duracion, codigo);
    console.log(`Código de confirmación guardado para ${email} con expiración de ${duracion} segundos.`);
  } catch (err) {
    console.error('Error al guardar el código de confirmación en Redis:', err);
  }
}

export async function obtenerCodigoConfirmacion(email: string): Promise<string | null> {
    await initializeRedis();
    const key = `confirmacion:${email}`;
  try {
    const codigo = await client.get(key);
    return codigo;
  } catch (err) {
    console.error('Error al obtener el código de confirmación en Redis:', err);
    return null;
  }
  
}