import type React from "react"
import { type FieldErrorsImpl, useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEffect, useState } from "react"
import Provincias from "../ubicacion/provincia"
import Localidades from "../ubicacion/localidad"
import { DireccionSchemaType } from "@/helpers/direccion"

//la prop sirve para que no se mezclen las direcciones de alumnos y responsables
//en el formulario de admin/alumnos
// fieldpath para alumno: direccion.{pais, provincia, localidad, calle, numero}
// fieldpath para responsable: responsable.direccion.{pais, provincia, localidad, calle, numero}
interface DireccionFormProps {
  fieldPath: string;
}

export const DireccionAdminForm: React.FC<DireccionFormProps> = ({ fieldPath }) => {

  const [provincia, setProvincia] = useState<string | null>("")
  const [localidad, setLocalidad] = useState<string | null>("")
  const {
    register,
    formState: { errors },
    getValues
  } = useFormContext()
  // Helper function to get nested errors
  const getNestedErrors = (path: string) => {
    const parts = path.split(".")
    let current: any = errors

    for (const part of parts) {
      if (!current || !current[part]) return undefined
      current = current[part]
    }

    return current as FieldErrorsImpl<DireccionSchemaType> | undefined
  }

  useEffect(() => {
    const provinciaRegistrada = getValues(`${fieldPath}.provincia`);
    console.log('provinciaRegistrada', provinciaRegistrada)
    if (provinciaRegistrada) {
      setProvincia(provinciaRegistrada);
    }
  }, [getValues, provincia]);

  useEffect(() => {
    const localidadRegistrada = getValues(`${fieldPath}.localidad`);
    console.log('localidadRegistrada', localidadRegistrada)
    if (localidadRegistrada) {
      setLocalidad(localidadRegistrada);
    }
  }, [getValues, localidad]);


  // Get errors for the current field path
  const direccionErrors = getNestedErrors(fieldPath)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div>
        <Label htmlFor={`${fieldPath}.pais`}>País</Label>
        <Input id={`${fieldPath}.pais`} type="text" readOnly value={"Argentina"} className="mt-1" />
      </div>
      <div>
        <Label htmlFor={`${fieldPath}.provincia`}>Provincia</Label>
        <Provincias
          setprovincia={setProvincia}
          provincia={provincia}
          fieldPath={fieldPath}
          direccionErrors={direccionErrors}

        />
      </div>
      <div>
        <Label htmlFor={`${fieldPath}.localidad`}>Localidad</Label>
        <Localidades
          setLocalidad={setLocalidad}
          provinciaName={provincia}
          localidad={localidad}
          fieldPath={fieldPath}
          direccionErrors={direccionErrors}
        />

      </div>
      <div>
        <Label htmlFor={`${fieldPath}.calle`}>Calle</Label>
        <Input
          id={`${fieldPath}.calle`}
          type="text"
          {...register(`${fieldPath}.calle`)}
          className="mt-1"
          placeholder="Nombre de la calle"
        />
        {direccionErrors?.calle && <p className="text-destructive text-sm mt-1">{direccionErrors?.calle.message}</p>}
      </div>
      <div>
        <Label htmlFor={`${fieldPath}.numero`}>Número</Label>
        <Input
          id={`${fieldPath}.numero`}
          placeholder="Número de la calle"
          type="number"
          {...register(`${fieldPath}.numero`, { valueAsNumber: true })}
          className="mt-1"
        />
        {direccionErrors?.numero && <p className="text-destructive text-sm mt-1">{direccionErrors.numero.message}</p>}
      </div>
    </div>
  )
}

