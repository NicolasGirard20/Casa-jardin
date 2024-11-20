"use server"
import { PrismaClient } from "@prisma/client"
import { get } from "http"
const prisma = new PrismaClient()
// funcion para crear una aula con los datos que se pasan en el objeto data que seria por el numero de aula

export async function createAula(data: {
    nombre: string,
}) {
    return prisma.aula.create({
        data
    })
}
// funcion para obtener todas las aulas

export async function getAulas() {
    return prisma.aula.findMany()
}

// funcion para obtener un aula por su id
export async function getAulaById(id: number) {
    return prisma.aula.findUnique({
        where: {
            id
        }
    })
}

// funcion para obtener un aula por su nombre

export async function getAulaByNombre(nombre1: string) {
    try {
        const nombreAulas = await getAulas();

        // Normalizamos ambos nombres para que la comparación ignore tildes, caracteres especiales y mayúsculas/minúsculas
        const normalizeString = (str: string) => {
            return str
                .normalize("NFD") // Normaliza para separar caracteres especiales
                .replace(/[\u0300-\u036f]/g, "") // Elimina las marcas diacríticas (tildes y otros)
                .toLowerCase(); // Convierte a minúsculas para ignorar mayúsculas
        };

        // Usamos some() para detenerse en el primer match
        const aulaExistente = nombreAulas.some(aula => normalizeString(aula.nombre) === normalizeString(nombre1));

        if (aulaExistente) {
            return true;
        }
        return false;
    } catch (error) {
        return false; // Retorna false si ocurre un error
    }
}





// funcion para eliminar un aula por su id

export async function deleteAulas(id: number) {
    return prisma.aula.delete({
        where: {
            id
        }
    })
}
