'use server'
import { hashPassword } from "@/helpers/hashPassword";
import { Curso, PrismaClient, Profesional_Curso } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { getUserFromCookie } from "@/helpers/jwt";
import { emailExists,  verifyusuario } from "./Alumno";

const prisma = new PrismaClient();

export type Profesional = {
  id: number;
  nombre: string;
  apellido: string;
  especialidad: string;
  email: string;
  telefono: string;
  password: string;
  rolId: number;
  imagen: string | null;
}
export async function getProfesionales() {
  return await prisma.profesional.findMany();
}

export async function getProfesionalesNoPassword() {
  return await prisma.profesional.findMany({
    select: {
      id: true,
      nombre: true,
      apellido: true,
      especialidad: true,
      email: true,
      telefono: true,
      imagen: true,
    }
  });
}

export async function getProfesionalById(id: number) {
  return await prisma.profesional.findUnique({
    where: {
      id,
    },
  });
}

export async function createProfesional(data: {
  nombre: string;
  apellido: string;
  especialidad: string;
  email: string;
  telefono: string;
  password: string;
  imagen: string | null;
}) {

  const profTrim = {
    nombre: data.nombre.trim(),
    apellido: data.apellido.trim(),
    especialidad: data.especialidad.trim(),
    email: data.email.trim(),
    telefono: data.telefono.trim(),
    password: data.password.trim(),
    imagen: data.imagen,
  }
  // Verificar si el email ya existe
  const existingProfesional = emailExists(data.email?.trim(),);

  if (!existingProfesional) {
    return ('El email ya está en uso');
  }
  console.log("contraseña sin cambiar", data.password.trim());
  // Encriptar la contraseña
  const hashedPassword = await hashPassword(data.password.trim());
  const newProfesional = {
    ...profTrim,
    password: hashedPassword,
    rolId: 3,
  }
  console.log("contraseña cambiada", hashedPassword);
  return await prisma.profesional.create({
    data: newProfesional
  });
}

export async function updateProfesional(id: number, Data: {
  nombre?: string;
  apellido?: string;
  especialidad?: string;
  email?: string;
  telefono?: string;
  password?: string;
  imagen?: string | null;
}) {
  const profesional = await prisma.profesional.findUnique({
    where: {
      id,
    },
  });
  if (!profesional) {
    return "Profesional no encontrado";
  }
  const existingProfesional = await verifyusuario(id, String(Data.email).trim(), String(profesional.email).trim());
  if (!existingProfesional) {
    return "El email ya está en uso";
  }
  let profesionalData: any = {};
  // Si se envía la contraseña, se actualiza
  if (Data.password) {
    Data.password = await hashPassword(Data.password.trim());
    profesionalData = {
      id: id,
      nombre: Data.nombre?.trim(),
      apellido: Data.apellido?.trim(),
      telefono: Data.telefono?.trim(),
      password: Data.password?.trim(),
      imagen: Data.imagen,
    }
  }
  // Si no se envía la contraseña, no se actualiza
  if(!Data.password){
    // Actualizar el alumno
    profesionalData = {
    id: id,
    nombre: Data.nombre?.trim(),
    apellido: Data.apellido?.trim(),
    telefono: Data.telefono?.trim(),
    email: Data.email?.trim(),
    imagen: Data.imagen,
    }
  }
  return await prisma.profesional.update({
    where: {
      id,
    },
    data: profesionalData,
  });
}

export async function deleteProfesional(id: number) {
  await prisma.profesional_Curso.deleteMany({
    where: {
      profesionalId: id,
    },
  });
  return await prisma.profesional.delete({
    where: {
      id,
    },
  });

}

//para la cookie
export async function getProfesionalByEmail(email: string) {
  return await prisma.profesional.findUnique({
    where: {
      email: email.trim(),
    },
  });
}

// 
// obtener el profesor logeado
export async function getProfesionalByCookie() {
  const user = await getUserFromCookie();
  if (user && user.email) {
    const email: any = user.email;
    const profesional = await prisma.profesional.findUnique({
      where: {
        email: email
      }
    });
    return profesional;
  } else {
    return null;
  }

}

export async function updateProfesionalImage(id: number, image?: string | null) {
  if (!image || image === "" || image === null || image === undefined) {
    return "No se ha proporcionado una imagen";
  }
  return await prisma.profesional.update({
    where: {
      id,
    },
    data: {
      imagen: image,
},
  });
}