import type React from "react"
import { type FieldErrorsImpl, useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { DireccionSchemaType } from "@/helpers/direccion"

//la prop sirve para que no se mezclen las direcciones de alumnos y responsables
//en el formulario de admin/alumnos
// fieldpath para alumno: direccion.{pais, provincia, localidad, calle, numero}
// fieldpath para responsable: responsable.direccion.{pais, provincia, localidad, calle, numero}
interface DireccionFormProps {
  fieldPath: string;
}

export const DireccionAdminForm: React.FC<DireccionFormProps> = ({ fieldPath }) => {
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
        <Input id={`${fieldPath}.provincia`} type="text" readOnly value={"Entre Ríos"} className="mt-1" />
      </div>
      <div>
        <Label htmlFor={`${fieldPath}.localidad`}>Localidad</Label>
<Input
          id="calle"
          type="text"
          {...register(`${fieldPath}.localidad`)}
          className="mt-1"
          placeholder="Nombre de la localidad"
        />
        {direccionErrors?.localidad && <p className="text-destructive text-sm mt-1">{direccionErrors.localidad.message}</p>}

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

