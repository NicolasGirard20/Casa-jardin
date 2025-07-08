import { FieldErrorsImpl, useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DireccionSchemaType } from "@/helpers/direccion"
import { useState } from "react"
import { useEffect } from "react";



export const DireccionForm: React.FC = () => {

  const [provincia, setProvincia] = useState<string | null>("Entre Ríos")
  const [localidad, setLocalidad] = useState<string | null>("")
  const [fieldPath, setFieldPath] = useState<string>("direccion"); // Default field path for the form
  const [cambioProvincia, setCambioProvincia] = useState<boolean>(false);

  const {
    register,
    formState: { errors },
  } = useFormContext()
  const { getValues } = useFormContext();


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
        <Label htmlFor="pais">País</Label>
        <Input id="pais" type="text" readOnly value={"Argentina"} className="mt-1" />
      </div>
      <div >
        <Label htmlFor="provincia">Provincia</Label>
        <Input id={`${fieldPath}.provincia`} type="text" readOnly value={"Entre Ríos"} className="mt-1" />
      </div>

      <div >
        <Label htmlFor="localidad">Localidad</Label>
        <Input
          id="localidad"
          type="text"
          {...register(`${fieldPath}.localidad`)}
          className="mt-1"
          placeholder="Nombre de la localidad"
        />
        {direccionErrors?.localidad && <p className="text-destructive text-sm mt-1">{direccionErrors.localidad.message}</p>}

      </div>
      <div>
        <Label htmlFor="calle">Calle</Label>
        <Input
          id="calle"
          type="text"
          {...register(`${fieldPath}.calle`)}
          className="mt-1"
          placeholder="Nombre de la calle"
        />
        {direccionErrors?.calle && <p className="text-destructive text-sm mt-1">{direccionErrors.calle.message}</p>}
      </div>
      <div>
        <Label htmlFor="numero">Número</Label>
        <Input
          id="numero"
          type="number"
          placeholder="Número de la calle"
          {...register(`${fieldPath}.numero`, {
            valueAsNumber: true,
            setValueAs: (value) => (value === "" ? undefined : Number(value)),
          })}
          className="mt-1"
        />
        {direccionErrors?.numero && <p className="text-destructive text-sm mt-1">{direccionErrors.numero.message}</p>}
      </div>
    </div>
  )
}

