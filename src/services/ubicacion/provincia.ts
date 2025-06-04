"use server"

import { PrismaClient } from "@prisma/client";
import axios from "axios";
import { getRolById } from "../rol";

const prisma = new PrismaClient();
export type Provincia = {
  id: number;
  nombre: string;
  nacionalidadId: number;
}



export async function getProvinciasById(ProvinciasId: number) {
  return await prisma.provincia.findUnique({
    where: {
      id: Number(ProvinciasId),
    },
  });
}
export async function getProvinciasByName(ProvinciasName: string, nacionalidadId: number) {
  return await prisma.provincia.findFirst({
    where: {
      nombre: {
        equals: ProvinciasName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleUpperCase(),
        mode: 'insensitive',
      },
      nacionalidadId: Number(nacionalidadId),
    },
  });
}

export async function addProvincias(data: {
  nombre: string;
  nacionalidadId: number;
}) {
  const dataTrim = {
    nombre: data.nombre.trim(),
    nacionalidadId: data.nacionalidadId,
  }
  const provinciaExistente = await getProvinciasByName(dataTrim.nombre, dataTrim.nacionalidadId);
  if(provinciaExistente){
    console.log("PROVINCIA EXISTENTE")
    return provinciaExistente;
  }
  console.log("PROVINCIA NUEVA")
  const prov = await prisma.provincia.create({
    data: dataTrim
  });
  return prov;
}

export async function updateProvinciaById(id:number, data: {
  nombre: string;
  nacionalidadId: number;
}) {
  const dataTrim = {
    id: id,
    nombre: data.nombre.trim(),
    nacionalidadId: data.nacionalidadId,
  }
  console.log("actualizo direccion")
  return await prisma.provincia.update({
    where: { id },
    data: dataTrim
  });  
}

