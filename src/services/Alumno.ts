"use server"

import { PrismaClient } from "@prisma/client";
import { hashPassword, verifyPassword } from "../helpers/hashPassword";

import { encrypt, getUserFromCookie } from "@/helpers/jwt";
import { cookies } from "next/headers";
import { getalumnos_cursoByIdAlumno } from "./alumno_curso";
import { validatePasswordComplexity } from "@/helpers/validaciones";
const prisma = new PrismaClient();

// Definir el tipo Alumno
export type Alumno = {
  id: number;
  nombre: string;
  apellido: string;
  dni: number;
  telefono: string;
  email: string;
  password: string;
  direccionId?: number;
  rolId: number;
  fechaNacimiento?: Date;
  mayoriaEdad?: boolean
};


// Crear Alumnos
export async function createAlumno(data: {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  telefono?: string;
  direccionId?: number;
  fechaNacimiento?: Date;
  mayoriaEdad?: boolean

}) {
  const alumnoTrim = {
    nombre: data.nombre.trim(),
    apellido: data.apellido.trim(),
    email: data.email.trim(),
    password: data.password.trim(),
    telefono: data.telefono?.trim(),
    direccionId: data.direccionId,
    fechaNacimiento: data.fechaNacimiento,
    mayoriaEdad: data.mayoriaEdad
  }
  // Verificar si el email ya existe en la base de datos
  const existingAlumno = await emailExists(data.email.trim());

  if (existingAlumno) {
    // El email ya existe
    return "El email ya está registrado";
  }

  // Encriptar la contraseña
  const hashedPassword = await hashPassword(data.password.trim());

  // Crear el objeto de datos del alumno
  const alumnoData = {
    ...alumnoTrim,
    password: hashedPassword,
    rolId: 2
  };

  // Guardar el alumno
  const alum = await prisma.alumno.create({
    data: alumnoData,
  });
  return alum
}
export async function createAlumnoAdmin(data: {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  telefono?: string;
  direccionId?: number;
  dni: number;
  fechaNacimiento: Date;
  mayoriaEdad?: boolean;
}) {
  const alumnoTrim = {
    nombre: data.nombre.trim(),
    apellido: data.apellido.trim(),
    email: data.email.trim(),
    password: data.password.trim(),
    telefono: data?.telefono?.trim(),
    direccionId: data?.direccionId,
    dni: Number(data.dni),
    fechaNacimiento: data.fechaNacimiento,
    mayoriaEdad: data?.mayoriaEdad,
    rolId: 2
  }
  // Verificar si el email ya existe en la base de datos
  const existingAlumno = await emailExists(data.email.trim());
  // Convertir fechaNacimiento a Date si está presente
  data.fechaNacimiento = new Date(data.fechaNacimiento);
  if (existingAlumno) {
    return "El email ya está registrado";
  }
  // Encriptar la contraseña
  const hashedPassword = await hashPassword(data.password.trim());
  data.password = hashedPassword;

  //  console.log("fecha:", data.fechaNacimiento)
  console.log("CREANDO ALUMNO COMO ADMIN")
  // Guardar el alumno
  const alum = await prisma.alumno.create({
    data: alumnoTrim,
  });
  return alum
}




// valida los datos del alumno para iniciar sesión
export async function authenticateUser(email: string, password: string): Promise<string | number> {
  const tables = ['alumno', 'administrador', 'profesional'] as const;
  type Table = typeof tables[number];

  // Realiza búsquedas en paralelo para cada tabla y espera el primer resultado exitoso
  const userResults = await Promise.all(
    tables.map((table) => (prisma[table as Table] as any).findUnique({ where: { email } }))
  );
  /* console.log("server userResults", userResults) */
  if (userResults.every((user) => user === null)) {
    return "El usuario no se encuentra registrado"; // Si no se encuentra el usuario, retorna null
  }
  // Busca el primer usuario que no sea null y verifique la contraseña
  for (const user of userResults) {
    if (user && await verifyPassword(password, user.password)) {
      // Crear sesión y establecer la cookie
      // La sesión expira en 30 minutos
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 dia jaja
      const session = await encrypt({ email: user.email, rolId: user.rolId, expires });
      cookies().set("user", session, { expires, httpOnly: true });

      return user.rolId; // Retorna el rol del usuario autenticado
    }
  }

  return ""; // Devuelve null si no se encuentra usuario válido en ninguna tabla
}


// Modificar Alumno
// Modificar Alumno
export async function updateAlumno(id: number, data: {
  nombre: string;
  apellido: string;
  dni?: number | null;
  telefono?: string | null;
  email: string;
  direccionId?: number;
  fechaNacimiento?: Date;
  mayoriaEdad?: Boolean;
  password?: string;

}) {
  const alumnoTrim = {
    nombre: data.nombre.trim(),
    apellido: data.apellido.trim(),
    dni: data.dni,
    telefono: data.telefono,
    email: data.email.trim(),
    direccionId: data.direccionId,
    fechaNacimiento: data.fechaNacimiento,
    mayoriaEdad: data.mayoriaEdad,
    password: data.password?.trim(),
  }
  // Verificar si el alumno existe
  const alumno = await prisma.alumno.findUnique({ where: { id } });
  if (!alumno) {
    return ("El alumno no existe.");
  }
  // Verificar si el email ya existe en la base de datos
  const existingAlumno = await verifyusuario(id, data.email.trim(), alumno.email.trim());
  if (!existingAlumno) {
    return ("El email ya está registrado");
  }

  if (data.fechaNacimiento) data.fechaNacimiento = new Date(data.fechaNacimiento);


  //console.log("Actualizando alumno password", data.password);
  // Crear objeto de datos del alumno
  let alumnoData: any = {};
  //si se envía la contraseña, se actualiza
  if (alumnoTrim.password) {
    alumnoTrim.password = await hashPassword(alumnoTrim.password);
    alumnoData = {
      id: id,
      nombre: alumnoTrim.nombre,
      apellido: alumnoTrim.apellido,
      dni: alumnoTrim.dni,
      telefono: alumnoTrim.telefono,
      direccionId: alumnoTrim.direccionId,
      email: alumnoTrim.email,
      fechaNacimiento: alumnoTrim.fechaNacimiento,
      password: alumnoTrim.password,
    }
  }
  // Si no se envía la contraseña, no se actualiza
  if (!alumnoTrim.password) {
    // Actualizar el alumno
    alumnoData = {
      id: id,
      nombre: alumnoTrim.nombre,
      apellido: alumnoTrim.apellido,
      dni: alumnoTrim.dni,
      telefono: alumnoTrim.telefono,
      direccionId: alumnoTrim.direccionId,
      email: alumnoTrim.email,
      fechaNacimiento: alumnoTrim.fechaNacimiento,
    }
  }
  console.log("Actualizando alumno", alumnoData);
  return await prisma.alumno.update({
    where: { id },
    data: alumnoData,
  });
}
//cambiar contraseña
export async function changePassword(password: string, newPassword: string, email: string) {
  console.log(password, newPassword, email);
  const alumno = await prisma.alumno.findUnique({ where: { email: email.trim() } });
  if (!alumno) {
    const admin = await prisma.administrador.findUnique({ where: { email: email.trim() } });
    if (!admin) return "El usuario no se encuentra registrado";
    if (!await verifyPassword(password, admin.password)) {
      return "Contraseña incorrecta.";
    }
    // verificar si la contraseña cumple con los requisitos
    const verify = validatePasswordComplexity(newPassword.trim())

    if (typeof verify === "string") { return verify };

    const hashedPassword = await hashPassword(newPassword.trim());
    console.log("Se guardó correctamente la contraseña");
    return await prisma.administrador.update({
      where: { id: admin.id },
      data: { password: hashedPassword },
    });
  }
  if (!await verifyPassword(password, alumno.password)) {
    return "Contraseña incorrecta.";
  }
  // verificar si la contraseña cumple con los requisitos
  const verify = validatePasswordComplexity(newPassword.trim())

  if (typeof verify === "string") { return verify };

  const hashedPassword = await hashPassword(newPassword.trim());
  console.log("Se guardó correctamente la contraseña");
  return await prisma.alumno.update({
    where: { id: alumno.id },
    data: { password: hashedPassword },
  });
}
// Obtener Alumno por ID
export async function getAlumnoById(id: number) {
  return await prisma.alumno.findUnique({
    where: { id },
  });
}
// Obtener Alumno por cookie (sesión)
export async function getAlumnoByCookie() {
  const user = await getUserFromCookie();
  if (user && user.email) {
    const email: any = user.email;
    const alumno = await prisma.alumno.findUnique({
      where: {
        email: email.trim()
      }
    });
    return alumno;
  } else {
    return null;
  }

}

// Obtener Alumnos
export async function getAlumnos() {
  return await prisma.alumno.findMany();
}


export async function deleteAlumno(id: number) {
  console.log("Eliminando alumno", id);
  try {
    const foundAlumno = await prisma.alumno_Curso.deleteMany({
      where: { alumnoId: id }
    })
    if (!foundAlumno) {
      return 'No se encontró el alumno'
    }
    const x = await prisma.alumno.delete({
      where: { id },
    });
    console.log("Alumno eliminado", x);
    return x
  }
  catch (err) {
    console.log("Error al eliminar alumno", err);
    return null;
  }

}

//get by email
export async function getAlumnoByEmail(email: string) {
  return await prisma.alumno.findUnique({
    where: {
      email: email.trim(),
    },
  });
}



// verificar que el emial existe  en la base de datos en la tabla alumno, administrador o profesional
export async function emailExists(email: string): Promise<boolean> {
  const tables = ['alumno', 'administrador', 'profesional'] as const;
  type Table = typeof tables[number];

  try {
    const userResults = await Promise.all(
      tables.map(async (table) => {
        try {
          return await (prisma[table as Table] as any).findUnique({ where: { email } });
        } catch (error) {

          return null; // Si hay error en la consulta, devolvemos null
        }
      })
    );

    return userResults.some((user) => user !== null);
  } catch (error) {

    return false; // Si hay algún error general, devolvemos false
  }
}


//verificar si el dni existe en la base de datos
export async function dniExists(dni: number): Promise<boolean> {
  // Realiza búsquedas en paralelo para cada tabla y espera el primer resultado exitoso
  try {
    const userResults = await prisma.alumno.findUnique({ where: { dni } }
    );
    // Busca el primer usuario que no sea null
    // si existe el dni retorna true
    console.log("userResults", userResults)
    if (userResults) {
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error checking dni existence:", error);
    return false;
  }

}
// verifico si el id de alumno y el correoa son los mismos para poder modificar el alumno sin problemas

export async function verifyusuario(id: number, email: string, currentEmail: string): Promise<boolean> {
  const tables = ['alumno', 'administrador', 'profesional'] as const;
  type Table = typeof tables[number];

  // Si el email no ha cambiado, no es necesario hacer nada
  if (email === currentEmail) {
    return true; // No se realiza ningún cambio en el correo
  }

  try {
    // Verificamos si el nuevo email ya existe en las tablas
    const userResults = await Promise.all(
      tables.map(async (table) => {
        try {
          // Aquí buscamos solo por el email, no por el id, para saber si ya existe en otro usuario
          return await (prisma[table as Table] as any).findUnique({ where: { email } });
        } catch (error) {
          console.error(`Error al buscar en la tabla ${table}:`, error);
          return null; // Si hay error, devolvemos null
        }
      })
    );

    // Si alguna de las tablas tiene un usuario con el email, retornamos false
    return !userResults.some((user) => user !== null);
  } catch (error) {
    console.error('Error en la verificación del usuario:', error);
    return false; // Si ocurre algún error, devolvemos false
  }
}

//verificar si el alumno pertenece a algun curso
export async function verifyAlumnoCurso(alumnoId: number) {
  const alumnoExist = await getalumnos_cursoByIdAlumno(alumnoId);
  if (alumnoExist) {
    return true;
  }
  return false;
}

export async function updateAlumnoCuenta(alumnoId: number, data: {
  dni?: number | null;
  telefono?: string | null;
  direccionId?: number;
}) {
  // Trim the data if needed
  const alumnoTrim = {
    dni: data.dni,
    telefono: data.telefono?.trim() ?? undefined,
    direccionId: data.direccionId,
  };

  // Verificar si el alumno existe
  const alumno = await prisma.alumno.findUnique({ where: { id: alumnoId } });
  if (!alumno) {
    return "El alumno no existe.";
  }

  // Actualizar el alumno usando solo los campos que cambian
  const updateData: any = {};
  if (alumnoTrim.dni !== undefined) updateData.dni = alumnoTrim.dni;
  if (alumnoTrim.telefono !== undefined) updateData.telefono = alumnoTrim.telefono;
  if (alumnoTrim.direccionId !== undefined) updateData.direccionId = alumnoTrim.direccionId;

  console.log("Actualizando alumno cuenta", updateData);
  return await prisma.alumno.update({
    where: { id: alumnoId },
    data: updateData,
  });
}




