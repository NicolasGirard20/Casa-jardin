import { z } from 'zod';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Apple, Loader } from 'lucide-react';
//por si el profesional no tiene una imagen cargada
import NoImage from "../../../../public/Images/default-no-image.png";
import { handleUploadProfesionalImage } from '@/helpers/repoImages';
import { createProfesional, updateProfesional } from '@/services/profesional';
import { FileInput } from '../ui/fileInput';
import PasswordAdmin from '../passwordInput/passwordAdmin';

//para la imagen

const profesionalSchema = (nueva: boolean) => z.object({
  id: z.number().optional(),
  nombre: z.string().min(1, { message: "Debe completar el nombre" }),
  apellido: z.string().min(1, { message: "Debe completar el apellido" }),
  especialidad: z.string().min(1, { message: "Debe completar la especialidad" }),
  email: z.string().email({ message: "Debe ser un email válido" }),
  //si es una cuenta nueva es obligatoria, sino es opcional modificarla
  password: nueva ?
    z.string().min(8, { message: "La contraseña debe tener al menos 8 caracteres" })
      .regex(/(?=.*[0-9])/, { message: "Debe contener al menos un número" })
    :
    z.union([z.string().min(8, { message: "La contraseña debe tener al menos 8 caracteres" })
      .regex(/(?=.*[0-9])/, { message: "Debe contener al menos un número" }), z.string().length(0)]),
  telefono: z.string().min(1, { message: "Debe completar el teléfono" })
    .regex(/^\d+$/, { message: "El teléfono solo debe contener números" }),
  //url de la imagen del profesional
  imagen: z.any().nullable().optional(),
})

export type ProfesionalSchema = z.infer<ReturnType<typeof profesionalSchema>>;

interface ProfesionalProps {
  profesional: ProfesionalSchema | null
  setEditar: React.Dispatch<React.SetStateAction<boolean>>
  setChanged: React.Dispatch<React.SetStateAction<boolean>>
  nueva: boolean
  //para la imagen que hay que mostrar
  downloadUrl: string
  setProfesionalesListaCompleta?: React.Dispatch<React.SetStateAction<any[]>>
}

const ProfesionalAdminForm: React.FC<ProfesionalProps> = (ProfesionalProps) => {
  const [imagePreview, setImagePreview] = useState<string>(ProfesionalProps.downloadUrl || "../../../../public/Images/default-no-image.png");
  //esta varible no es null si hubieron cambios en la imagen
  const [imagenArchivo, setImagenArchivo] = useState<File | null>(null);

  const methods = useForm<ProfesionalSchema>({
    resolver: zodResolver(profesionalSchema(ProfesionalProps.nueva)),
    defaultValues: {
      id: ProfesionalProps.profesional?.id,
      nombre: ProfesionalProps.profesional?.nombre,
      apellido: ProfesionalProps.profesional?.apellido,
      especialidad: ProfesionalProps.profesional?.especialidad,
      email: ProfesionalProps.profesional?.email,
      password: "",
      telefono: ProfesionalProps.profesional?.telefono,
      imagen: ProfesionalProps.profesional?.imagen
    }
  })

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = methods

  const onSubmit = async (data: ProfesionalSchema) => {
    //creo profesional si no existe
    if (ProfesionalProps.nueva) {
      console.log("nuevo profesional")



      //guardo la nueva imagen en el repo

      console.log("imagen modificada")
      const nuevoUrl = imagenArchivo ? await handleImageUpload(imagenArchivo, data) : data.imagen

      //guardo el profesional con imagen
      const pro = await createProfesional({
        nombre: data.nombre,
        apellido: data.apellido,
        especialidad: data.especialidad,
        email: data.email,
        telefono: data.telefono,
        password: data.password,
        //uso el nuevo url de la imagen seleccionada
        imagen: nuevoUrl ? nuevoUrl : null
      })
      console.log(pro)

      //actualizo la lista de profesionales
      ProfesionalProps.setProfesionalesListaCompleta?.((prev) => [...prev, pro])
      //cambio el estado de editar
      ProfesionalProps.setChanged(true)
      ProfesionalProps.setEditar(false)
    }
    else {
      //actualizo el profesional ya existente
      console.log("actualizo profesional")
      console.log(imagenArchivo)
      const url = imagenArchivo ? await handleImageUpload(imagenArchivo, data) : data.imagen
      console.log("imagen modificada", url)

      //actualizo el profesional
      if (data.password.length === 0) {
        //actualizo el profesional sin cambiar la contraseña
        console.log("actualizo sin cambiar contraseña")
        await updateProfesional(
          Number(data.id), {
          nombre: data.nombre,
          apellido: data.apellido,
          especialidad: data.especialidad,
          email: data.email,
          telefono: data.telefono,
          imagen: url
        })
      }
      else {
        //actualizo el profesional cambiando la contraseña
        console.log("actualizo cambiando contraseña")
        await updateProfesional(
          Number(data.id), {
          nombre: data.nombre,
          apellido: data.apellido,
          especialidad: data.especialidad,
          email: data.email,
          telefono: data.telefono,
          password: data.password,
          imagen: url
        })
      }
      ProfesionalProps.setChanged(true)
      ProfesionalProps.setEditar(false)
    }
  }

  const cancelar = () => {
    ProfesionalProps.setEditar(false)
  }

  const handleImageChange = (file: File | null) => {
    console.log("imagen cambiada");
    if (file) {
      console.log("imagen seleccionada", file);
      setImagePreview(URL.createObjectURL(file));
      setImagenArchivo(file);
    } else {
      setImagePreview(ProfesionalProps.downloadUrl || "../../../../public/Images/default-no-image.png");
      setImagenArchivo(null);
    }
  };

  const handleImageUpload = async (file: File, data: ProfesionalSchema) => {
    console.log("imagen a subir", file)
    //para ponerle el nombre al archivo en el repo
    const filename = file.name;
    const lastDotIndex = filename.lastIndexOf(".");
    const fileExtension = lastDotIndex !== -1 ? filename.substring(lastDotIndex + 1) : "";

    const filenameResult = `${data.email}_${data.nombre}_${data.apellido}.${fileExtension}`
    console.log("filename ----", filenameResult)
    await handleUploadProfesionalImage(
      file,
      filenameResult
    );
    return filenameResult;
  }


  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-lg shadow-lg w-full max-w-[90rem] relative flex flex-col gap-6 h-auto overflow-y-auto max-h-[90vh]"
        >
          <Card>
            <CardHeader className="bg-sky-700 text-primary-foreground">
              <CardTitle className="flex items-center gap-2">
                <Apple className="w-6 h-6" />
                Datos Profesional
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input id="nombre" placeholder="Nombre del Profesional" type="text" {...register("nombre")} className="mt-1" />
                  {errors.nombre && <p className="text-destructive text-sm mt-1">{errors.nombre.message}</p>}
                </div>
                <div>
                  <Label htmlFor="apellido">Apellido</Label>
                  <Input id="apellido" placeholder="Apellido del Profesional" type="text" {...register("apellido")} className="mt-1" />
                  {errors.apellido && <p className="text-destructive text-sm mt-1">{errors.apellido.message}</p>}
                </div>
                <div>
                  <Label htmlFor="especialidad">Especialidad</Label>
                  <Input id="especialidad" placeholder="Especialidad del Profesional" type="text" {...register("especialidad")} className="mt-1" />
                  {errors.especialidad && <p className="text-destructive text-sm mt-1">{errors.especialidad.message}</p>}
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" placeholder="Correo electrónico del Profesional" type="email" {...register("email")} className="mt-1" />
                  {errors.email && <p className="text-destructive text-sm mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <PasswordAdmin methods={methods}  placeholderPassw={ProfesionalProps.nueva ? "Contraseña del Profesional" : "cambiar contraseña (opcional)"} />
                </div>
                <div>
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input id="telefono" placeholder="Teléfono del Profesional" type="text" {...register("telefono")} className="mt-1" />
                  {errors.telefono && <p className="text-destructive text-sm mt-1">{errors.telefono.message}</p>}
                </div>
                <div>
                  <Label htmlFor="imagen">Imagen</Label>
                  <FileInput
                    id="imagen"
                    onImageChange={handleImageChange}
                    previewUrl={imagePreview}
                    className="mt-1"
                    buttonText="Seleccionar foto de perfil"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-between px-6 pb-6">
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
  );
}

export default ProfesionalAdminForm;