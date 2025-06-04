'use server'
import { PrismaClient } from "@prisma/client";
import { get } from "http";

const prisma = new PrismaClient();

export type Alumno_Curso = {
    id: number;
    alumnoId: number;
    cursoId: number;
}
export async function createAlumno_Curso(data: {
    cursoId: number;
    alumnoId: number;
}) {
  console.log("dataAAAAAAAAAAAAAAA", data);
  const al_cur = await getalumnos_cursoByIdAlumnoIdCur(data.alumnoId, data.cursoId);
  if (al_cur) {
    return "El alumno ya se encuentra inscripto en el curso";
  }
  return await prisma.alumno_Curso.create({
    data,
  });
}

export async function getalumnos_cursoByIdAlumnoIdCur(alumnoId: number, cursoId:number) {
  return await prisma.alumno_Curso.findFirst({
    where: {
      alumnoId: alumnoId,
      cursoId: cursoId,
    },
  });
}
export async function getalumnos_cursoByIdAlumno(alumnoId: number) {
  return await prisma.alumno_Curso.findMany({
    where: {
      alumnoId: alumnoId,
    },
  });
}
export async function getAllAlumnos_cursos() {
  return await prisma.alumno_Curso.findMany();
}
export async function getCantAlumnosInscriptos() {
  const alum_Curso = await getAllAlumnos_cursos();
  const uniqueAlumnos = Array.from(new Set(alum_Curso.map(alum_cur => alum_cur.alumnoId)));
  const cantAlumno = uniqueAlumnos.length;
  return cantAlumno;
}

export async function getCursosByIdAlumno(id: number) {
  const alum_cur=  await prisma.alumno_Curso.findMany({
    where: {
      alumnoId: id,
    },
  });
  let arrayCursos: any[] = [];
  for (const pc of alum_cur) {
    const curso = await prisma.curso.findFirst({
      where: {
        id: pc.cursoId,
      },
    });
    arrayCursos.push(curso);
    //console.log("CURSO", curso);
  }
  console.log("CURSO", arrayCursos);
  return arrayCursos;
}

export async function deleteAlumno_Curso(idAlumno: number, idCurso: number) {
  const al_cur = await getalumnos_cursoByIdAlumnoIdCur(idAlumno, idCurso);
  if (!al_cur) {
    console.log("El alumno no está inscripto en el curso");
    return "El alumno no está inscripto en el curso";
  }
  return await prisma.alumno_Curso.delete({
    where: { id: al_cur.id },
  });
}


//trae todos los alumnos que estan inscriptos en un curso en particular con su id, nombre y apellido y email
export async function getAlumnosByIdCurso(idCurso: number) {
  const alum_cur = await prisma.alumno_Curso.findMany({
    where: {
      cursoId: idCurso,
    },
  });
  let arrayAlumnos: any[] = [];
  for (const pc of alum_cur) {
    const alumno = await prisma.alumno.findFirst({
      where: {
        id: pc.alumnoId,
      },
    });
    arrayAlumnos.push(alumno);
  }
  return arrayAlumnos;
}