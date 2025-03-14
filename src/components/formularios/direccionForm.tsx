import { useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DireccionSchemaType } from "@/helpers/direccion"



export const DireccionForm: React.FC = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<{ direccion: DireccionSchemaType }>()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div>
        <Label htmlFor="pais">País</Label>
        <Input id="pais" type="text" {...register("direccion.pais")} className="mt-1" />
        {errors.direccion?.pais && <p className="text-destructive text-sm mt-1">{errors.direccion.pais.message}</p>}
      </div>
      <div>
        <Label htmlFor="provincia">Provincia</Label>
        <Input id="provincia" type="text" {...register("direccion.provincia")} className="mt-1" />
        {errors.direccion?.provincia && (
          <p className="text-destructive text-sm mt-1">{errors.direccion.provincia.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="localidad">Localidad</Label>
        <Input id="localidad" type="text" {...register("direccion.localidad")} className="mt-1" />
        {errors.direccion?.localidad && (
          <p className="text-destructive text-sm mt-1">{errors.direccion.localidad.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="calle">Calle</Label>
        <Input id="calle" type="text" {...register("direccion.calle")} className="mt-1" />
        {errors.direccion?.calle && <p className="text-destructive text-sm mt-1">{errors.direccion.calle.message}</p>}
      </div>
      <div>
        <Label htmlFor="numero">Número</Label>
        <Input
          id="numero"
          type="number"
          {...register("direccion.numero", {
            valueAsNumber: true,
            setValueAs: (value) => (value === "" ? undefined : Number(value)),
          })}
          className="mt-1"
        />
        {errors.direccion?.numero && <p className="text-destructive text-sm mt-1">{errors.direccion.numero.message}</p>}
      </div>
    </div>
  )
}

