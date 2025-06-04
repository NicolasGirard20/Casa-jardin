import { DireccionSchemaType } from '@/helpers/direccion';
import { getProvincias } from '@/helpers/geo';
import React, { useEffect, useState } from 'react';
import { UseFormRegister, FieldErrors, useFormContext } from 'react-hook-form';

interface ProvinciaPros {
    setprovincia: React.Dispatch<React.SetStateAction<string | null>>;
    provincia: string | null;
    fieldPath?: string; // Default field path
    direccionErrors?: FieldErrors<DireccionSchemaType> ;
}
interface Provincia {
    id: string;
    nombre: string;
}

const Provincias: React.FC<ProvinciaPros> = ({
    setprovincia,
    provincia,
    fieldPath,
    direccionErrors
}) => {
    const [provinces, setProvinces] = useState<Provincia[]>([]);
    const [habilitarProv, setHabilitarProv] = useState<boolean>(false);
        const {
            register,
            formState: { errors },
        } = useFormContext()

    useEffect(() => {
        const fetchProvinces = async () =>{
            const response = await getProvincias()
            console.log('response', response)
            setProvinces(response);
        }
        if (provinces.length === 0) fetchProvinces();
    }, [provinces]);

    return (
        <div>
            <select
                {...register(`${fieldPath}.provincia`, { required: 'La provincia es obligatoria' })}
                onClick={() => setHabilitarProv(true)}
                onChange={(e) => setprovincia(String(e.target.value))}
                className={`mt-1 border p-2 rounded w-full text-sm `}
            >
                <option value="">{(!provincia || habilitarProv) ? "Seleccione una provincia" : provincia}</option>
                {provinces.map((province: Provincia) => (
                    <option key={province.id} value={province.nombre}>
                        {province.nombre}
                    </option>
                ))}
            </select>
            {direccionErrors?.provincia && (
                <p className="text-destructive text-sm mt-1">{direccionErrors?.provincia.message}</p>
            )}
        </div>
    );
};

export default Provincias;
