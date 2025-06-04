import { z } from "zod"
import { useForm, FormProvider, Form } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader, User, User2 } from "lucide-react"
import { DireccionForm } from "./direccionForm"
import { Pen, MapPin } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { updateAlumno, createAlumnoAdmin } from "@/services/Alumno"
import { direccionHelper, direccionSchema } from "@/helpers/direccion"
import { getDireccionCompleta } from "@/services/ubicacion/direccion"
import React, { useState, useEffect } from "react"
//para el responsable 
import { ResponsableAdminForm, responsableSchema } from "./responsableAdminForm"
import { getResponsableByAlumnoId, updateResponsable } from "@/services/responsable"
import { formDate } from "@/helpers/fechas"
import { DireccionAdminForm } from "./direccionAdminForm"
import PasswordInput from "../passwordInput/passwordForm"
import PasswordAdmin from "../passwordInput/passwordAdmin"





const alumnoSchema = (mayor: boolean, nueva: boolean) => z.object({
  dni: z
    .union([
      z
        .number({
          required_error: "El DNI es obligatorio",
          invalid_type_error: "El DNI debe ser un número válido",
        })
        .int()
        .min(1000000, { message: "DNI inválido, debe ser un número de 8 dígitos" })
        .max(999999999, { message: "DNI inválido, debe ser un número de 8 dígitos" }),
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
  id: z.number().optional(),
  nombre: z.string().min(1, { message: "Debe completar el nombre" }),
  apellido: z.string().min(1, { message: "Debe completar el apellido" }),
  email: z.string().email({ message: "Debe ser un email válido" }),
  password: nueva ?
    z.string().min(8, { message: "La contraseña debe tener al menos 8 caracteres" })
      .regex(/(?=.*[0-9])/, { message: "Debe contener al menos un número" })
    :
    z.union([z.string().min(8, { message: "La contraseña debe tener al menos 8 caracteres" })
      .regex(/(?=.*[0-9])/, { message: "Debe contener al menos un número" }), z.string().length(0)]),
  fechaNacimiento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Debe ser una fecha válida" }),
  direccionId: z.number().optional().nullable(),
  responsable: responsableSchema.optional()
})

type AlumnoSchema = z.infer<ReturnType<typeof alumnoSchema>>;

interface FormProps {
  alumno: AlumnoSchema | null
  setEditar: React.Dispatch<React.SetStateAction<boolean>>
  setChanged: React.Dispatch<React.SetStateAction<boolean>>
  mayor: boolean
  nueva: boolean
}

const AlumnoAdminForm: React.FC<FormProps> = (FormProps) => {
  const [loading, setLoading] = useState(false)

  //tengo que traer la direccion desde el formulario
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (FormProps.alumno && FormProps.alumno.direccionId) {
          const direccion = await fetchDireccion(FormProps.alumno.direccionId);
          if (direccion) {
            methods.setValue("direccion", { ...direccion, pais: "Argentina" });
            //  console.log("direccion: ", direccion)
          }

        }
        if (FormProps.alumno?.id && !FormProps.mayor) {
          const responsable = await fetchResponsable(FormProps.alumno.id);
          if (responsable) {
            methods.setValue("responsable", responsable);
            console.log("responsableeeeeeee: ", responsable)
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [FormProps.alumno, FormProps.mayor]);

  //fetches de direccion y responsable del alumno
  const fetchDireccion = async (direccionId: number) => {
    const dire = await getDireccionCompleta(direccionId)
    if (dire) {
      return {
        pais: "Argentina" as const,
        provincia: String(dire.localidad.provincia.nombre),
        localidad: String(dire.localidad.nombre),
        calle: String(dire.calle),
        numero: Number(dire.numero)
      }
    }
  }

  const fetchResponsable = async (alumnoId: number) => {
    let dire = undefined
    const res = await getResponsableByAlumnoId(alumnoId)
    if (res) {
      res.direccionId ? dire = await fetchDireccion(res.direccionId) : null
      //devuelve un responsable con el formato de responsableSchema
      if (dire) {
        methods.setValue("responsable.direccion", { ...dire, pais: "Argentina" });
        console.log("direccionNNNNNNNNNNNNNNNNN: ", dire)
      }
      else {
        console.log("NOOOOOOOOo hay direccion")
      }

      return {
        id: res.id,
        nombre: res.nombre,
        apellido: res.apellido,
        dni: res.dni,
        telefono: res.telefono,
        email: res.email,
        direccion: dire
      }
    }
  }

  //datos originales para comparar cambios
  const copiaComparables = {
    dni: FormProps.alumno?.dni,
    telefono: FormProps.alumno?.telefono ?? null,
    direccion: FormProps.alumno?.direccion
  }
  //seteo de formulario
  const methods = useForm<AlumnoSchema>({
    resolver: zodResolver(alumnoSchema(FormProps.mayor, FormProps.nueva)),
    defaultValues: {

      id: FormProps.alumno?.id,
      nombre: FormProps.alumno?.nombre,
      apellido: FormProps.alumno?.apellido,
      email: FormProps.alumno?.email,
      password: "",
      fechaNacimiento: FormProps.alumno?.fechaNacimiento ? formDate(FormProps.alumno.fechaNacimiento) : "",
      direccionId: FormProps.alumno?.direccionId,
      dni: FormProps.alumno?.dni || undefined,
      telefono: FormProps.alumno?.telefono || "",
      direccion: FormProps.alumno?.direccion || {
        pais: "Argentina",
        provincia: "",
        localidad: "",
        calle: "",
        numero: undefined,
      },
      responsable: FormProps.alumno?.responsable,

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
    /*    if(JSON.stringify(copiaComparables) === JSON.stringify({
         dni: data.dni,
         telefono: data.telefono,
         direccion: data.direccion
       })){ 
         console.log("no hay cambios")
         await new Promise((resolve) => setTimeout(resolve, 1000))
         console.log(data)
         FormProps.setEditar(false)
       return
       } */

    //si hay cambios
    // console.log(data.direccion)
    //paso 1 actualizar / crear direccion
    const direccion = await direccionHelper(data.direccion)
    // console.log("direccionALumno: ", direccion)
    //paso 2 actualizar alumno
    if (FormProps.alumno?.id) {
      //cambio el direccion id por los nuevos datos
      FormProps.alumno.direccionId = direccion?.id
      //actualizo el alumno

      //si se cambia la contraseña
      if (data.password.length > 0) {
        await updateAlumno(FormProps.alumno.id, {
          nombre: data.nombre,
          apellido: data.apellido,
          email: data.email,
          password: data.password,
          fechaNacimiento: new Date(data.fechaNacimiento),
          dni: data.dni,
          telefono: data.telefono,
          direccionId: direccion?.id
        })
      }
      //si no se cambia la contraseña
      else {
        await updateAlumno(FormProps.alumno.id, {
          nombre: data.nombre,
          apellido: data.apellido,
          email: data.email,
          fechaNacimiento: new Date(data.fechaNacimiento),
          dni: data.dni,
          telefono: data.telefono,
          direccionId: direccion?.id
        })
        //console.log("alumno actualizado: ", upAl)
      }

      //paso 3 actualiar el responsable si es menor
      if (!FormProps.mayor && data.responsable) {
        // console.log("responsableantes del helper: ", data.responsable)
        //paso 3.1 actualizar / crear direccion responsable
        const dirRes = await direccionHelper(data.responsable.direccion)
        data.responsable.direccionId = dirRes?.id
        // console.log("direccion responsable: ", dirRes)
        //paso 3.2 actualizar responsable
        await updateResponsable(FormProps.alumno.id, {
          alumnoId: FormProps.alumno.id,
          nombre: data.responsable?.nombre,
          apellido: data.responsable?.apellido,
          dni: data.responsable?.dni,
          telefono: data.responsable?.telefono,
          email: data.responsable?.email,
          direccionId: dirRes?.id
        })
        //console.log("responsable actualizado: ", r)
      }

      FormProps.setChanged(true)
    }
    //crear alumno si no existe
    else {
      const newAlum = await createAlumnoAdmin({
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email,
        password: String(data.password),
        fechaNacimiento: new Date(data.fechaNacimiento),
        dni: Number(data.dni),
        telefono: String(data.telefono),
        direccionId: direccion?.id,
      })

      if (typeof newAlum !== "string") {
        console.log("nuevo alumno: ", newAlum)
        //crear el responsable 
        if (!FormProps.mayor && data.responsable) {
          //paso 3.1 actualizar / crear direccion responsable
          const dirRes = await direccionHelper(data.responsable.direccion)
          data.responsable.direccionId = dirRes?.id

          //paso 3.2 actualizar responsable
          const r = await updateResponsable(newAlum.id, {
            alumnoId: newAlum.id,
            nombre: data.responsable?.nombre,
            apellido: data.responsable?.apellido,
            dni: data.responsable?.dni,
            telefono: data.responsable?.telefono,
            email: data.responsable?.email,
            direccionId: dirRes?.id
          })
          console.log("responsable creado: ", r)
        }
        FormProps.setChanged(true)
      }

    }


    //cerrar formulario
    FormProps.setEditar(false)
  }

  const cancelar = () => {
    console.log("errores alumno form: ", errors)
    console.log(FormProps.alumno)
    console.log(methods.getValues().responsable)
    FormProps.setEditar(false)
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 px-4">
      {loading ? <Loader className="h-12 w-12 animate-spin" /> :
        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white rounded-lg shadow-lg w-full max-w-[90rem] relative flex flex-col gap-6 h-auto overflow-y-auto max-h-[90vh]"
          >
            <Card>
              <CardHeader className="bg-green-700 text-primary-foreground">
                <CardTitle className="flex items-center gap-2">
                  <Pen className="w-6 h-6" />
                  Datos Alumno
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input id="nombre" placeholder="Nombre del alumno" type="text" {...register("nombre")} className="mt-1" />
                    {errors.nombre && <p className="text-destructive text-sm mt-1">{errors.nombre.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="apellido">Apellido</Label>
                    <Input id="apellido" placeholder="Apellido del alumno" type="text" {...register("apellido")} className="mt-1" />
                    {errors.apellido && <p className="text-destructive text-sm mt-1">{errors.apellido.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
                    <Input id="fechaNacimiento" type="date" {...register("fechaNacimiento")} className="mt-1" />
                    {errors.fechaNacimiento && <p className="text-destructive text-sm mt-1">{errors.fechaNacimiento.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" placeholder="Correo electrónico del alumno" type="email" {...register("email")} className="mt-1" />
                    {errors.email && <p className="text-destructive text-sm mt-1">{errors.email.message}</p>}
                  </div>
                  <div>
                    <PasswordAdmin methods={methods} placeholderPassw={FormProps.nueva ? "Contraseña del alumno" : "cambiar contraseña (opcional)"} />
                  </div>
                  <div>
                    <Label htmlFor="dni">DNI</Label>
                    <Input id="dni" placeholder="DNI (sin puntos) del alumno" type="text" {...register("dni", { valueAsNumber: true })} className="mt-1" />
                    {errors.dni && <p className="text-destructive text-sm mt-1">{errors.dni.message}</p>}
                  </div>
                  {FormProps.mayor && (
                    <div>
                      <Label htmlFor="telefono">Teléfono</Label>
                      <Input id="telefono" placeholder="Teléfono del alumno" type="text" {...register("telefono")} className="mt-1" />
                      {errors.telefono && <p className="text-destructive text-sm mt-1">{errors.telefono.message}</p>}
                    </div>
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
                <DireccionAdminForm fieldPath={"direccion"} />
              </CardContent>
            </Card>

            {!FormProps.mayor &&
              <Card>
                <CardHeader className="bg-sky-700 text-primary-foreground">
                  <CardTitle className="flex items-center gap-2">
                    <User2 className="w-6 h-6" />
                    Responsable
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <ResponsableAdminForm />
                </CardContent>
              </Card>
            }

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
      }
    </div>
  );
}

export default AlumnoAdminForm

