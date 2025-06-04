import { z } from "zod"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader } from "lucide-react"
import { DireccionForm } from "./direccionForm"
import { User, Pen, MapPin } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { updateAlumnoCuenta } from "@/services/Alumno"
import { direccionHelper, direccionSchema } from "@/helpers/direccion"
import PasswordComponent from "../Password/page"
import { useState } from "react"



const alumnoSchema = (mayor: boolean) => z.object({
  dni: z
    .union([
      z
        .number({
          required_error: "El DNI es obligatorio",
          invalid_type_error: "El DNI debe ser un número válido",
        })
        .int()
        .min(1000000, { message: "DNI inválido, debe ser un número de 8 dígitos" })
        .max(99999999, { message: "DNI inválido, debe ser un número de 8 dígitos" }),

      z.null(),
    ])
    .optional(),
  telefono: mayor
    ? z
      .string()
      .min(1, { message: "Debe completar el teléfono" })
      .regex(/^\d+$/, { message: "El teléfono solo debe contener números" })
      .nullable()
      .optional()
    : z.string().nullable().optional(),
  direccion: direccionSchema.optional(),
  //campos no modificables
  id: z.number(),
  nombre: z.string(),
  apellido: z.string(),
  email: z.string().email(),
  fechaNacimiento: z.string(),
  direccionId: z.number().optional().nullable(),
})

type AlumnoSchema = z.infer<ReturnType<typeof alumnoSchema>>;

interface AlumnoProps {
  alumno: AlumnoSchema | null
  setEditar: React.Dispatch<React.SetStateAction<boolean>>
  setChanged: React.Dispatch<React.SetStateAction<boolean>>
  mayor: boolean
}

const AlumnoForm: React.FC<AlumnoProps> = (AlumnoProps) => {

  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  //datos originales para comparar cambios
  const copiaComparables = {
    dni: AlumnoProps.alumno?.dni,
    telefono: AlumnoProps.alumno?.telefono ?? null,
    direccion: AlumnoProps.alumno?.direccion
  }

  //seteo de formulario
  const methods = useForm<AlumnoSchema>({
    resolver: zodResolver(alumnoSchema(AlumnoProps.mayor)),
    defaultValues: {
      //campos no modificables
      id: AlumnoProps.alumno?.id,
      nombre: AlumnoProps.alumno?.nombre,
      apellido: AlumnoProps.alumno?.apellido,
      email: AlumnoProps.alumno?.email,
      fechaNacimiento: AlumnoProps.alumno?.fechaNacimiento,
      direccionId: AlumnoProps.alumno?.direccionId,

      //campos modificables
      dni: AlumnoProps.alumno?.dni || undefined,
      telefono: AlumnoProps.alumno?.telefono || "",
      direccion: AlumnoProps.alumno?.direccion || {
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

  const onSubmit = async (data: AlumnoSchema) => {
    console.log("guardando")
    //si no hay cambios no hago nada
    if (JSON.stringify(copiaComparables) === JSON.stringify({
      dni: data.dni,
      telefono: data.telefono,
      direccion: data.direccion
    })) {
      console.log("no hay cambios")
      await new Promise((resolve) => setTimeout(resolve, 1000))
      // console.log(data)
      AlumnoProps.setEditar(false)
      return
    }

    //si hay cambios

    //paso 1 actualizar / crear direccion
    const direccion = await direccionHelper(data.direccion)

    //paso 2 actualizar alumno
    if (AlumnoProps.alumno) {
      //cambio el direccion id por los nuevos datos
      AlumnoProps.alumno.direccionId = direccion?.id
      //actualizo el alumno usando solo los campos que cambian
      const updateAlumnoData = {
        dni: data.dni,
        telefono: data.telefono ?? undefined,
        direccionId: direccion?.id
      }
      await updateAlumnoCuenta(AlumnoProps.alumno.id, updateAlumnoData)
      AlumnoProps.setChanged(true)
    }
    //cerrar formulario
    AlumnoProps.setEditar(false)
  }

  const cancelar = () => {
    console.log("errores alumno form: ", errors)
    // console.log(AlumnoProps.alumno)
    // console.log(AlumnoProps.alumno?.direccion)
    AlumnoProps.setEditar(false)
  }

  function fecha(f: string | undefined) {
    if (!f) return
    const fecha = new Date(f)
    return fecha.toLocaleDateString()

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
                Información del Usuario (No editable)
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Nombre</Label>
                  <p className="text-lg font-medium overflow-auto">{AlumnoProps.alumno?.nombre}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Apellido</Label>
                  <p className="text-lg font-medium overflow-auto">{AlumnoProps.alumno?.apellido}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                  <p className="text-lg font-medium overflow-auto   ">{AlumnoProps.alumno?.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Fecha de Nacimiento</Label>
                  <p className="text-lg font-medium">{fecha(AlumnoProps.alumno?.fechaNacimiento)}</p>
                </div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="dni">DNI</Label>
                  <Input id="dni" placeholder="DNI del alumno" type="text" {...register("dni", { valueAsNumber: true })} className="mt-1" />
                  {errors.dni && <p className="text-destructive text-sm mt-1">{errors.dni.message}</p>}
                </div>
                {AlumnoProps.mayor && (
                  <div>
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input id="telefono" placeholder="Teléfono del alumno" maxLength={11} type="text" {...register("telefono")} className="mt-1" />
                    {errors.telefono && <p className="text-destructive text-sm mt-1">{errors.telefono.message}</p>}
                  </div>
                )}
                <div className="">
                    <div className="flex  mt-7">
                    <Button
                      type="button"
                      onClick={() => setShowEmailVerification(true)}
                      className="mt-auto p-4 bg-slate-500 hover:bg-slate-700 text-white"
                    >
                      Cambiar contraseña
                    </Button>
                    </div>
                </div>
                {showEmailVerification && (
                  <PasswordComponent
                    email={String(AlumnoProps.alumno?.email)}
                    setVerificarEmail={setShowEmailVerification}
                    setSaving={setIsSaving}
                  />
                )}
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

export default AlumnoForm

