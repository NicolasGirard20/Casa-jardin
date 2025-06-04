import { z } from "zod"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader, User, Pen, MapPin } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DireccionForm } from "./direccionForm"
import { direccionHelper, direccionSchema } from "@/helpers/direccion"
import { updateResponsable } from "@/services/responsable"



const responsableSchema = z.object({
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
  telefono: z.string().min(1, { message: "Debe completar el teléfono" }),
  email: z.string().min(1, { message: "Debe completar el email" }).email({ message: "Email inválido" }),
  alumnoId: z.number().optional(),
  direccion: direccionSchema.optional(),
  id: z.number().optional(),
})

type ResponsableSchema = z.infer<typeof responsableSchema>

interface ResponsableProps {
  responsable: ResponsableSchema | null
  setEditar: React.Dispatch<React.SetStateAction<boolean>>
  setChanged: React.Dispatch<React.SetStateAction<boolean>>
  alumnoId: number
}

const ResponsableForm: React.FC<ResponsableProps> = (ResponsableProps) => {
  //datos originales para comparar cambios
  const copiaComparables = {
    nombre: ResponsableProps.responsable?.nombre,
    apellido: ResponsableProps.responsable?.apellido,
    dni: ResponsableProps.responsable?.dni,
    telefono: ResponsableProps.responsable?.telefono,
    email: ResponsableProps.responsable?.email,
    direccion: ResponsableProps.responsable?.direccion
  }
  //seteo de formulario
  const methods = useForm<ResponsableSchema>({
    resolver: zodResolver(responsableSchema),
    defaultValues: {
      id: ResponsableProps.responsable?.id,
      nombre: ResponsableProps.responsable?.nombre || "",
      apellido: ResponsableProps.responsable?.apellido || "",
      dni: ResponsableProps.responsable?.dni || undefined,
      telefono: ResponsableProps.responsable?.telefono || "",
      email: ResponsableProps.responsable?.email || "",
      direccion: ResponsableProps.responsable?.direccion || {
        pais: "Argentina",
        provincia: "",
        localidad: "",
        calle: "",
        numero: undefined,
      },
    },
  })

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = methods

  const onSubmit = async (data: ResponsableSchema) => {
    //si no hay cambios
    if(JSON.stringify(copiaComparables) === JSON.stringify({
      nombre: data.nombre,
      apellido: data.apellido,
      dni: data.dni,
      telefono: data.telefono,
      email: data.email,
      direccion: data.direccion
    })){
      console.log("no hay cambios")
      console.log(ResponsableProps.responsable)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      console.log(data)
      ResponsableProps.setEditar(false)
      return 
    }

    //si hay cambios

    //paso 1 actualizar / crear direccion
    const direccion = await direccionHelper(data.direccion)

    //paso 2 actualizar / crear responsable
    console.log("actualizar responsable")
    const r = await updateResponsable( ResponsableProps.alumnoId,{
      alumnoId: ResponsableProps.alumnoId,
      nombre: data.nombre,
      apellido: data.apellido,
      dni: data.dni,
      telefono: data.telefono,
      email: data.email,
      direccionId: direccion?.id
    })
    console.log("responsable actualizado: ", r)
    ResponsableProps.setChanged(true)
      
    
    //cerrar formulario
    ResponsableProps.setEditar(false)
  
  }

  const cancelar = () => {
    console.log("responsableProps: ", ResponsableProps)
    ResponsableProps.setEditar(false)
  }

 
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-lg shadow-lg w-full max-w-2xl relative flex flex-col gap-6 h-auto overflow-y-auto max-h-[90vh]"
        >
          <Card>
            <CardHeader className="bg-sky-700 text-primary-foreground">
              <CardTitle className="flex items-center gap-2">
                <User className="w-6 h-6" />
                Información del Responsable
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-row-2 gap-4 pt-6">
              <div>
                <Label htmlFor="nombre">Nombre</Label>
                <Input id="nombre" {...register("nombre")} placeholder="Nombre" className="mt-1" />
                {errors.nombre && <p className="text-destructive text-sm mt-1">{errors.nombre.message}</p>}
              </div>
              <div>
                <Label htmlFor="apellido">Apellido</Label>
                <Input id="apellido" {...register("apellido")} placeholder="Apellido" className="mt-1" />
                {errors.apellido && <p className="text-destructive text-sm mt-1">{errors.apellido.message}</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-green-700 text-primary-foreground">
              <CardTitle className="flex items-center gap-2">
                <Pen className="w-6 h-6" />
                Datos Adicionales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div>
                <Label htmlFor="dni">DNI</Label>
                <Input
                  id="dni"
                  {...register("dni", {
                    setValueAs: (v: string) => (v === "" ? undefined : Number.parseInt(v, 10)),
                    required: "El DNI es obligatorio",
                  })}
                  type="text"
                  maxLength={9}
                  placeholder="DNI (sin puntos)"
                  className="mt-1"
                  style={{ WebkitAppearance: "none", MozAppearance: "textfield" }}
                />
                {errors.dni && <p className="text-destructive text-sm mt-1">{errors.dni.message}</p>}
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" {...register("email")} type="email" placeholder="Email" className="mt-1" />
                {errors.email && <p className="text-destructive text-sm mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <Label htmlFor="telefono">Teléfono</Label>
                <Input id="telefono" {...register("telefono")} type="text" placeholder="Teléfono" className="mt-1" />
                {errors.telefono && <p className="text-destructive text-sm mt-1">{errors.telefono.message}</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-yellow-700 text-primary-foreground">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-6 h-6" />
                Dirección
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <DireccionForm />
            </CardContent>
          </Card>

          <div className="flex justify-between mt-4 pt-4 border-t px-6 pb-6">
            <Button type="button" onClick={cancelar} variant="destructive">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-sky-600 hover:bg-sky-800 text-white">
              {isSubmitting ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
              Guardar
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}

export default ResponsableForm

