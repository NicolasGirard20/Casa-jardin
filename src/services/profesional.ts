'use server'
import { hashPassword } from "@/helpers/hashPassword";
import { Curso, PrismaClient, Profesional_Curso } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { getUserFromCookie } from "@/helpers/jwt";
import { emailExists, verifyusuario } from "./Alumno";

const prisma = new PrismaClient();

export type Profesional = {
  id: number;
  nombre: string;
  apellido: string;
  especialidad: string;
  email: string;
  telefono: string;
  password: string;
  direccionId: number;
  rolId: number;
  imagen: string | null;
}
export async function getProfesionales() {
  return await prisma.profesional.findMany();
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
  direccionId: number;
  imagen: string | null;
}) {

  // Verificar si el email ya existe
  const existingProfesional = await emailExists(data.email);

  if (existingProfesional) {
    return ('El email ya está en uso');
  }

  // Encriptar la contraseña
  const hashedPassword = await hashPassword(data.password);
  const newProfesional = {
    ...data,
    password: hashedPassword,
    rolId: 3,
  }
 
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
  direccionId?: number;
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
  const existingProfesional = await verifyusuario(id, String(Data.email), String(profesional.email));
  if (!existingProfesional) {
    return "El email ya está en uso";
  }
  let profesionalData: any = {};
  // Si se envía la contraseña, se actualiza
  if (Data.password) {
    Data.password = await hashPassword(Data.password);
    profesionalData = {
      id: id,
      nombre: Data.nombre,
      apellido: Data.apellido,
      telefono: Data.telefono,
      direccionId: Data.direccionId,
      email: Data.email,
      password: Data.password,
      imagen: Data.imagen,
    }
  }
  // Si no se envía la contraseña, no se actualiza
  if(!Data.password){
    // Actualizar el alumno
    profesionalData = {
    id: id,
    nombre: Data.nombre,
    apellido: Data.apellido,
    telefono: Data.telefono,
    direccionId: Data.direccionId,
    email: Data.email,
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
      email: email,
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