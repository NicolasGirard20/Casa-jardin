import { addPais } from "@/services/ubicacion/pais"
import { addProvincias } from "@/services/ubicacion/provincia"
import { addLocalidad } from "@/services/ubicacion/localidad"
import { addDireccion, getDireccionCompleta} from "@/services/ubicacion/direccion"
import { z } from "zod"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"
export const direccionSchema = z.object({
  pais: z.string().min(1, "El país es obligatorio").refine((value) => value === "Argentina", {
    message: "El país ingresado debe ser Argentina",
  }),
  provincia: z.string()
    .min(1, "La provincia es obligatoria")
    .refine((value) => value !== "Seleccione una provincia", {
      message: "La provincia es obligatoria",
    }),
  localidad: z.string()
    .min(1, "La localidad es obligatoria")
    .refine((value) => value !== "Seleccione una localidad", {
    message: "La localidad es obligatoria",
  }),
  calle: z.string().min(1, "La calle es obligatoria"),
  numero: z.number({
    required_error: "El número es obligatorio",
    invalid_type_error: "El número debe ser válido",
  }).min(1, { message: "El número debe ser mayor a 0" }),
})


export type DireccionSchemaType = z.infer<typeof direccionSchema>   

type Direccion = {
    pais: "Argentina"
    provincia: string
    localidad: string
    calle: string
    numero: number
}
// Helper para agregar una dirección desde los formularios de alumno o responsable
export async function direccionHelper(direccionData: DireccionSchemaType | undefined) {
    if(direccionData) {
      const nacionalidad = await addPais({nombre: direccionData.pais})
      const provincia = await addProvincias({nombre: direccionData.provincia, nacionalidadId: nacionalidad.id})
      const localidad = await addLocalidad({nombre: direccionData.localidad, provinciaId: provincia.id})  
      const direccion = await addDireccion({calle: direccionData.calle, numero: direccionData.numero, localidadId: localidad.id})
      return direccion

    }
}

export async function getDireccionSimple(direccionId: number){
        const dire = await getDireccionCompleta(direccionId);

        if(!dire) return 
        const direccion: Direccion = {
            pais: "Argentina",
            provincia: String(dire.localidad?.provincia?.nombre),
            localidad: String(dire.localidad?.nombre),
            calle: String(dire.calle),
            numero: Number(dire.numero)
        }
        return direccion

    }