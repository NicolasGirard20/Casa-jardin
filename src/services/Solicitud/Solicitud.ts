"use server"

import { PrismaClient } from "@prisma/client";
import { deleteSolicitudMayor, getSolicitudMayorByIdSolictud, SolicitudMayor } from "./SolicitudMayor";
import { getSolicitudMenorByIdSolictud, SolicitudMenores } from "./SolicitudMenor";
import { deleteAlumno_Curso } from "../alumno_curso";
import { getAlumnoById } from "../Alumno";
import { getResponsableByAlumnoId } from "../responsable";
import { deleteCursoSolicitud } from "../curso_solicitud";
import { cp } from "fs";

const prisma = new PrismaClient();

export type Solicitud = {
  id: number;
  leida: boolean;
  enEspera:Boolean;
};
//crear solicitud
export async function createSolicitud() {
  return await prisma.solicitud.create({});
}
//obtener solicitud por id
export async function getSolicitudById(solicitudId: number) {
  return await prisma.solicitud.findUnique({
    where: {
      id: solicitudId,
    },
  });
}
//obtener todas las solicitudes
export async function getSolicitudes() {
  return await prisma.solicitud.findMany();
}

//eliminar solicitud
export async function deleteSolicitud(solicitudId: number) {
  let solicitud; 
  let soliBorrada;
  // Check if the solicitud is a solicitudMayor or solicitudMenor
  solicitud = await getSolicitudMayorByIdSolictud(solicitudId);
  if(!solicitud) {
    solicitud = await getSolicitudMenorByIdSolictud(solicitudId);
    // si es una solicitudMenor, eliminarla
    soliBorrada = await prisma.solicitudMenores.delete({
      where: {
        id: solicitud?.id,
      },
    });
    await deleteCursoSolicitud(Number(solicitudId), Number(solicitud?.alumnoId));
    return await prisma.solicitud.delete({
      where: {
        id: solicitudId,
      },
    });
  }
  // si es una solicitudMayor, eliminarla
   soliBorrada = await deleteSolicitudMayor(solicitud.id);
  console.log("SOLICITUD BORRADA", soliBorrada);

  //elimina la tabla intermedia entre solicitud y curso
  const cur_soli = await deleteCursoSolicitud(Number(solicitudId), Number(solicitud?.alumnoId));
  
  if(typeof cur_soli === "string") {
    return cur_soli;}
  //console.log("CURSO SOLICITUD", cur_soli);
  // Eliminar la tabla intermedia entre alumno y curso


  // Eliminar la solicitud en cascada

  const x = await prisma.solicitud.delete({
    where: {
      id: Number(solicitudId),
    },
  });
  console.log("SOLICITUD BORRADA", x);
  return x;
}


//modificar solicitud
export async function updateSolicitud(solicitudId: number, data: {
  leida?: boolean;
}) {
  return await prisma.solicitud.update({
    where: {
      id: solicitudId,
    },
    data: data,
  });
}

//obtener todas las solicitudes
export async function getAllSolicitudes() {
  return await prisma.solicitud.findMany();
}

export async function getPersonasSoli(dataMa: SolicitudMayor[], dataMe: SolicitudMenores[]) {
  return await Promise.all([
    Promise.all(dataMa.map(async (solicitMay) => {
        const alumno = await getAlumnoById(solicitMay.alumnoId);
        return alumno;
    })),
    Promise.all(dataMe.map(async (solicitMen) => {
        const alumno = await getAlumnoById(solicitMen.alumnoId);
        return alumno;
    })),
    Promise.all(dataMe.map(async (solicitMen) => {
        const responsable = await getResponsableByAlumnoId(solicitMen.alumnoId);
        return responsable;
    }))

]);
}

export async function getPersonasSoli2(dataMa: SolicitudMayor[], dataMe: SolicitudMenores[]) {
    
    const mayores = await prisma.solicitudMayores.findFirst({
      where: {
      id: {
        in: dataMa.map((soli) => soli.id),
      },
      },
      include: {
        alumno: true,
      },

    });
    const menores = await prisma.responsable.findFirst({
      where: {
      id: {
        in: dataMe.map((soli) => soli.id),
      },
      },
      include: {
        alumno: {
          include: {
            responsable: true,
          },
        }
      },
    });
    return {mayores, menores};
}

//llamada que hace un join, devuelve toda la info que se quiere saber de una solicitud
export async function getSolicitudCompleta(solicitudId: number) {
  const solicitudConRelaciones = await prisma.solicitud.findUnique({
    where: { id: solicitudId },
    include: {
      solicitudMayores: {
        include: {
          alumno: {
            include: {
              direccion: true, // Dirección relacionada con el alumno
            },
          }
        },
      },
      solicitudMenores: {
        include: {
          alumno: {
            include: {
             direccion: true, // Dirección relacionada con el alumno
              responsable: {
                include: {
                  direccion: true, // Dirección relacionada con el responsable
                },
              } 
            },

          },
        },
      },
      cursoSolicitud: {
        include: {
          curso: true, // Cursos relacionados a la solicitud
        },
      },
    },
  });
  return solicitudConRelaciones;
}  

//version para muchas solicitudes devuelve un array de solicitudes completas
//son muuuchos datos
export async function getSolicitudesCompletas() {
  const solicitudesConRelaciones = await prisma.solicitud.findMany({
    include: {
      solicitudMayores: {
        include: {
          alumno: true, // Datos del alumno para mayores
        },
      },
      solicitudMenores: {
        include: {
          alumno: {
            include: {
              //direccion: true, // Dirección relacionada con el alumno
              responsable: {
                include: {
                  direccion: true, // Dirección relacionada con el responsable
                },
              }
            },

          },
        },
      },
      cursoSolicitud: {
        include: {
          curso: true, // Cursos relacionados a la solicitud
        },
      },
    },
  });
  return solicitudesConRelaciones;
}  
//devuelve las solicitudes completas de un alumno especifico
export async function getSolicitudesCompletasByAlumno(alumnoId: number) {
  const solicitudesConRelaciones = await prisma.solicitud.findMany({
    where: {
      OR: [
        { solicitudMayores: { alumnoId: alumnoId }},
        { solicitudMenores: { alumnoId: alumnoId }},
      ],
    },
    include: {
      solicitudMayores: {
        include: {
          alumno: true, // Datos del alumno para mayores
        },
      },
      solicitudMenores: {
        include: {
          alumno: {
            include: {
              responsable: {
                include: {
                  direccion: true, // Dirección relacionada con el responsable
                },
              },
            },
          },
        },
      },
      cursoSolicitud: {
        include: {
          curso: true, // Cursos relacionados a la solicitud
        },
      },
    },
  });
  return solicitudesConRelaciones;
}

//borrar todas las solicitudes asociadas a un alumno
export async function deleteSolicitudesByAlumnoId(alumnoId: number) {
  // Primero, obtengo todas las solicitudes asociadas al alumno
  const solicitudes = await prisma.solicitud.findMany({
    where: {
      OR: [
        { solicitudMayores: { alumnoId: alumnoId }},
        { solicitudMenores: { alumnoId: alumnoId }},
      ],
    },
  });

  // Luego, elimino cada solicitud
  console.log("Solicitudes a eliminar:", solicitudes);
  for (const solicitud of solicitudes) {
    await deleteSolicitud(solicitud.id);
  }

  return "Solicitudes eliminadas correctamente";
}

