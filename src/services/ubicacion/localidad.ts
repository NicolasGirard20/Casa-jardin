"use server"

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export type Localidad = {
  id: number;
  nombre: string;
  provinciaId: number
}


// en esta funcion se obtienen los Localidades
// para poder mostrarlos en el formulario de registro
export async function getLocalidades() {
    return await prisma.nacionalidad.findMany({
      select: {
        id: true,
        nombre: true,
      },
    });
}
//añado una localidad
export async function addLocalidad(data: {
  nombre: string;
  provinciaId: number}) {

    const dataTrim = {
      nombre: data.nombre.trim(),
      provinciaId: data.provinciaId,
    }
    console.log("agrego localidad", dataTrim)
    const localidades = await getLocalidadByName(dataTrim.nombre);
    if(localidades) {
      console.log("LOCALIDAD EXISTENTE")
      return localidades;
    }
    console.log("LOCALIDAD NUEVA")
    const loc = await prisma.localidad.create({
      data: dataTrim
    });
    return loc;
}
export async function updateLocalidad(id:number, data: {
  nombre: string;
  provinciaId: number;
}) {
  const dataTrim = {
    nombre: data.nombre.trim(),
    provinciaId: data.provinciaId,
  }

  console.log("actualizo direccion")
  return await prisma.localidad.update({
    where: { id },
    data: dataTrim
  });
}

// en esta funcion se obtiene una localidad por id
export async function getLocalidadById(id: number) {
  return await prisma.localidad.findFirst({
    where: {
      id
    },
  });
}
export async function getLocalidadByName(LocalidadName: string) {
  return await prisma.localidad.findFirst({
    where: {
      nombre: {
        equals: LocalidadName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleUpperCase(),
        mode: 'insensitive', // This ensures case-insensitive comparison
      },
    },
  });
}
export async function getLocalidadesByProvinciaId(provinciaId: number) {
  return await prisma.localidad.findMany({
    where: {
    provinciaId: Number(provinciaId),
    },
  });
}



