import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { FieldErrors, useFormContext, UseFormRegister } from 'react-hook-form';
import { DireccionSchemaType } from '@/helpers/direccion';
import { getLocalidadesByProvincia } from '@/helpers/geo';
interface Localidad {
    id: string;
    nombre: string;
    provincia: { id: string; nombre: string };
}



interface localidadProps {
    provinciaName: string | null;
    setLocalidad: React.Dispatch<React.SetStateAction<string | null>>;
    localidad: string | null;
    fieldPath?: string; // Default field path
    direccionErrors?:  FieldErrors<DireccionSchemaType> ;
}

const Localidades: React.FC<localidadProps> = ({
    provinciaName,
    setLocalidad,
    localidad,
    fieldPath,
    direccionErrors,
}) => {
    const [localities, setLocalities] = useState<Localidad[]>([]);
    const [habilitarLocalidades, setHabilitarLocalidades] = useState<Boolean>(false);
    const {
        register,
        formState: { errors },
    } = useFormContext()
    useEffect(() => {
        
        if(localities.length === 0 && provinciaName) {
            const fetchLocalities = async () => {
                const responde = await getLocalidadesByProvincia(provinciaName);
                //console.log('responde', responde)
                setLocalities(responde);
            }
            fetchLocalities();
        }
    }, [provinciaName]);

    return (
        <div>
            <select
                {...register(`${fieldPath}.localidad`, { required: "La localidad es obligatoria" })}
                onClick={() => setHabilitarLocalidades(true)}
                onChange={(e) => {
                    setLocalidad(String(e.target.value));
                }}
                className="border p-2 rounded mt-1 text-sm w-full"
            >
                <option value="" disabled selected={!localidad}>
                    Seleccione una localidad
                </option>
                {localities.map((locality: Localidad) => (
                    <option key={locality.id} value={locality.nombre}>
                        {locality.nombre}
                    </option>
                ))}
            </select>
            {direccionErrors?.localidad && (
                <p className="text-destructive text-sm mt-1">{direccionErrors.localidad?.message}</p>
            )}
        </div>
    );
};

export default Localidades;
