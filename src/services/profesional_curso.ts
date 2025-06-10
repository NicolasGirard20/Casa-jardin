'use server'
import { PrismaClient } from "@prisma/client";
import { getCursosActivos } from "./cursos";

const prisma = new PrismaClient();

export type Profesional_Curso = {
  id: number;
  profesionalId: number;
  cursoId: number;
}
export async function createProfesional_Curso(data: { cursoId: number, profesionalId: number }) {
  // Check if a record with the same cursoId already exists
  const prof_cur = await getProfesional_CursoById_curso_prof(data.cursoId, data.profesionalId);
  if (prof_cur) return "El profesional ya se encuentra inscripto en el curso";

  // Check if the cursoId exists
  const cursoExists = await prisma.curso.findUnique({
    where: { id: data.cursoId },
  });
  if (!cursoExists) return "El curso no existe";

  // Proceed with creating the new record
  const newRecord = await prisma.profesional_Curso.create({
    data: {
      cursoId: data.cursoId,
      profesionalId: data.profesionalId,
    },
  });

  return newRecord;
}

export async function getProfesional_CursoById_curso_prof(cursoId: number, profesionalId: number) {
  return await prisma.profesional_Curso.findFirst({
    where: {
      cursoId: cursoId,
      profesionalId: profesionalId,
    },
  });
}

// Get all profesionales_cursos
export async function getProfesionales_CursoByIdProf(profesionalId: number) {
  return await prisma.profesional_Curso.findMany({
    where: {
      profesionalId: profesionalId,
    },
  });
}
export async function getCursosByIdProfesional(profesionalId: number) {
  const prof_cur = await prisma.profesional_Curso.findMany({
    where: {
      profesionalId: profesionalId,
    },
  });
  console.log("PROF_CUR", prof_cur);
  let arrayCursos: any[] = [];
  for (const pc of prof_cur) {
    const curso = await prisma.curso.findFirst({
      where: {
        id: pc.cursoId,
      },
    });
    arrayCursos.push(curso);
    console.log("CURSO", curso);
  }
  console.log("CURSOS", arrayCursos);
  return arrayCursos;
}
export async function getAllProfesionales_cursos() {
  return await prisma.profesional_Curso.findMany();
}

// obtener los profesionales que estén en cursos activos
/* export async function getCantProfesionalesActivos() {
  const prof_Curso = await getAllProfesionales_cursos();
  const cursosActivos = await getCursosActivos();

  const profesionalesActivos = prof_Curso.filter((prof) =>
    cursosActivos.some((curso: any) => curso.id === prof.cursoId)
  );
    // Filtrar profesionalesActivos para que solo quede un registro por profesionalId (el primero que aparece)
  const prof_CursoUnicos = profesionalesActivos.filter(
    (prof, index, self) =>
      index === self.findIndex((p) => p.profesionalId === prof.profesionalId)
  );
  const cantProf = prof_CursoUnicos.length;
  return cantProf

} */

//devuelve una lista de profesionales que estan a cargo de un curso
export async function getProfesionalesByCursoId(cursoId: number) {
  const prof_cur = await prisma.profesional_Curso.findMany({
    where: {
      cursoId: cursoId,
    },
  });
  let arrayProfesionales: any[] = [];
  for (const pc of prof_cur) {
    const profesional = await prisma.profesional.findFirst({
      where: {
        id: pc.profesionalId,
      },
    });
    if (profesional) {
      arrayProfesionales.push(profesional);
    }
  }
  return arrayProfesionales;
}

export async function deleteProfesional_Curso(idProfesional: number, idCurso: number) {
  return await prisma.profesional_Curso.deleteMany({
    where: {
      profesionalId: idProfesional,
      cursoId: idCurso,
    },
  });
}