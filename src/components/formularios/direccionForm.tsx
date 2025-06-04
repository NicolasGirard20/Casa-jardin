import { FieldErrorsImpl, useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DireccionSchemaType } from "@/helpers/direccion"
import Provincias from "../ubicacion/provincia"
import { useState } from "react"
import Localidades from "../ubicacion/localidad"
import { useEffect } from "react";



export const DireccionForm: React.FC = () => {

  const [provincia, setProvincia] = useState<string | null>("")
  const [localidad, setLocalidad] = useState<string | null>("")
  const [fieldPath, setFieldPath] = useState<string>("direccion"); // Default field path for the form

  const {
    register,
    formState: { errors },
  } = useFormContext()
  const { getValues } = useFormContext();

  useEffect(() => {
    const provinciaRegistrada = getValues("direccion.provincia");
    if (provinciaRegistrada) {
      setProvincia(provinciaRegistrada);
    }
  }, [getValues]);

  useEffect(() => {
    const localidadRegistrada = getValues("direccion.localidad");
    if (localidadRegistrada) {
      setLocalidad(localidadRegistrada);
    }
  }, [getValues]);

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
        <Provincias
          setprovincia={setProvincia}
          provincia={provincia}
          fieldPath={fieldPath}
          direccionErrors={direccionErrors}

        />

      </div>

      <div >
        <Label htmlFor="localidad">Localidad</Label>
        <Localidades
          setLocalidad={setLocalidad}
          provinciaName={provincia}
          localidad={localidad}
          fieldPath={fieldPath}
          direccionErrors={direccionErrors}
        />

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

