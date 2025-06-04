import { z } from "zod"
import { useFormContext} from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader, User, Pen, MapPin } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DireccionForm } from "./direccionForm"
import { direccionHelper, direccionSchema } from "@/helpers/direccion"
import { updateResponsable } from "@/services/responsable"
import { DireccionAdminForm } from "./direccionAdminForm"




export const responsableSchema = z.object({
  id: z.number().optional(),
  nombre: z
    .string()
    .min(1, { message: "Debe completar el nombre" })
    .regex(/^[A-Za-zÀ-ÿ ]+$/, "Nombre inválido, no debe contener números o caracteres especiales."),
  apellido: z
    .string()
    .min(1, { message: "Debe completar el apellido" })
    .regex(/^[A-Za-zÀ-ÿ ]+$/, "Apellido inválido, no debe contener números o caracteres especiales."),
  dni: z
    .number({
      required_error: "El DNI es obligatorio",
      invalid_type_error: "El DNI debe ser un número válido",
    })
    .int()
    .min(1000000, { message: "DNI inválido, debe ser un número de 8 dígitos" })
    .max(999999999, { message: "DNI inválido, debe ser un número de 8 dígitos" }),
  telefono: z
  .string()
  .min(1, { message: "Debe completar el teléfono" })
  .regex(/^\d+$/, { message: "El teléfono solo debe contener números" }),
  email: z.string().min(1, { message: "Debe completar el email" }).email({ message: "Email inválido" }),
  alumnoId: z.number().optional(),
  direccionId: z.number().optional(),
  direccion: direccionSchema.optional(),

})

type ResponsableSchema = z.infer<typeof responsableSchema>

export const ResponsableAdminForm: React.FC = () => {
    const {
        register,
        formState: { errors },
    } = useFormContext<{ responsable: ResponsableSchema}>()

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input id="nombre" placeholder="Nombre del Responsable" type="text" {...register("responsable.nombre")} className="mt-1" />
                    {errors.responsable?.nombre && <p className="text-destructive text-sm mt-1">{errors.responsable.nombre.message}</p>}
                </div>
                <div>
                    <Label htmlFor="apellido">Apellido</Label>
                    <Input id="apellido" placeholder="Apellido del Responsable" type="text" {...register("responsable.apellido")} className="mt-1" />
                    {errors.responsable?.apellido && (
                        <p className="text-destructive text-sm mt-1">{errors.responsable.apellido.message}</p>
                    )}
                </div>
                <div>
                    <Label htmlFor="dni">DNI</Label>
                    <Input
                        id="dni"
                        {...register("responsable.dni", {
                        setValueAs: (v: string) => (v === "" ? undefined : Number.parseInt(v, 10)),
                        required: "El DNI es obligatorio",
                        })}
                        type="text"
                        maxLength={9}
                        placeholder="DNI (sin puntos) del profesional"
                        className="mt-1"
                        style={{ WebkitAppearance: "none", MozAppearance: "textfield" }}
                    />
                    {errors.responsable?.dni && <p className="text-destructive text-sm mt-1">{errors.responsable.dni.message}</p>}
                </div>
                <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" placeholder="Correo electrónico del Responsable" type="email" {...register("responsable.email")} className="mt-1" />
                    {errors.responsable?.email && <p className="text-destructive text-sm mt-1">{errors.responsable.email.message}</p>}
                </div>
                <div>
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input id="telefono" placeholder="Teléfono del Responsable" type="text" {...register("responsable.telefono")} className="mt-1" />
                    {errors.responsable?.telefono && (
                        <p className="text-destructive text-sm mt-1">{errors.responsable.telefono.message}</p>
                    )}
                </div>
                <div>
                </div>
            </div>
            <DireccionAdminForm fieldPath="responsable.direccion"  />
        </div>
        
    )
}