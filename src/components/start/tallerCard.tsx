"use client";

import Image from 'next/image';
import { ArrowRight, Calendar, Users, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { TallerModal } from './tallerModal';
import { getCursoHorarios } from '@/services/cursos';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { set } from 'zod';
interface Taller {
  id: number;
  nombre: string;
  descripcion: string;
  imageUrl: string;
  edadMinima: number;
  edadMaxima: number;
  fechaFin: string;
}

interface TallerCardProps {
  taller: Taller;
  profesionales: any[] | undefined;
}

export default function TallerCard({ taller, profesionales }: TallerCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTallerHorarios, setSelectedTallerHorarios] = useState<{ [key: string]: string[]}>();
  const fechaFin = new Date(taller.fechaFin).toLocaleDateString();

  useEffect(() => {
    if (isModalOpen && taller.id) {
      getCursoHorarios(taller.id).then((horarios) => {
        if (horarios && Object.keys(horarios).length === 0) {
          setSelectedTallerHorarios({ "No hay horarios Disponibles": [""] });
        } else {
          setSelectedTallerHorarios(horarios);
        }
      });
    }
  }, [isModalOpen, taller.id]);

  return (
    <>
      <div className="group relative h-[450px] overflow-hidden rounded-2xl bg-sky-800 shadow-lg transition-all duration-500 hover:shadow-2xl">
        <div className="absolute inset-0">
          {taller.imageUrl && (
            <Image
              src={taller.imageUrl}
              alt={taller.nombre}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          )}
          <div className={cn(
            "absolute inset-0 bg-gradient-to-t from-sky-700/95 via-black-900/75 to-transparent",
            "opacity-60 transition-opacity duration-500 group-hover:opacity-75"
          )} />
          
          {/* Option 2: Deep Teal to Emerald (uncomment to use)
          <div className={cn(
            "absolute inset-0 bg-gradient-to-t from-teal-900/95 via-emerald-800/75 to-transparent",
            "opacity-60 transition-opacity duration-500 group-hover:opacity-75"
          )} />
          */}
          
          {/* Option 3: Warm Gradient (uncomment to use)
          <div className={cn(
            "absolute inset-0 bg-gradient-to-t from-rose-900/95 via-orange-900/75 to-transparent",
            "opacity-60 transition-opacity duration-500 group-hover:opacity-75"
          )} />
          */}
          
          {/* Option 4: Modern Dark (uncomment to use)
          <div className={cn(
            "absolute inset-0 bg-gradient-to-t from-slate-900/95 via-gray-800/75 to-transparent",
            "opacity-60 transition-opacity duration-500 group-hover:opacity-75"
          )} />
          */}
        </div>

        <div className="absolute top-4 right-4 z-10">
          <Badge variant="secondary" className="bg-white/90 text-black hover:bg-white/95">
            {taller.edadMinima} - {taller.edadMaxima} años
          </Badge>
        </div>

        <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
          <div className="transform space-y-4 transition-all duration-500 group-hover:-translate-y-20">
            <h2 className="text-2xl font-bold leading-tight tracking-tight">{taller.nombre}</h2>
            
            <div className="flex flex-wrap gap-4 text-sm text-white/90">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Hasta {fechaFin}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{profesionales?.length || 0} profesores</span>
              </div>
              {selectedTallerHorarios && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{Object.keys(selectedTallerHorarios).length} días disponibles</span>
                </div>
              )}
            </div>
          </div>

          <div className="transform space-y-4 transition-all duration-500 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
            <p className="line-clamp-3 text-sm leading-relaxed text-white/90">
              {taller.descripcion}
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-white/90"
            >
              Ver detalles
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <TallerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="space-y-6 overflow-y-auto max-h-[80vh]">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">{taller.nombre}</h2>
            <p className="text-muted-foreground">{taller.descripcion}</p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Badge variant="outline" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {taller.edadMinima} - {taller.edadMaxima} años
            </Badge>
            <Badge variant="outline" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Hasta {fechaFin}
            </Badge>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Profesores</h3>
            <div className="grid gap-2">
              {profesionales ? (
                profesionales.length === 0 ? (
                  <p className="text-muted-foreground">Aún no hay profesionales asignados</p>
                ) : (
                  profesionales.map((profesional) => (
                    <div key={profesional.id} className="flex items-center gap-2 rounded-lg border p-3">
                      <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                        <Users className="h-4 w-4" />
                      </div>
                      <span>
                        {profesional.nombre} {profesional.apellido}
                      </span>
                    </div>
                  ))
                )
              ) : (
                <p className="text-muted-foreground">Aún no hay profesionales asignados</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Horarios </h3>
            <div className="grid gap-2">
              {selectedTallerHorarios ? (
                Object.entries(selectedTallerHorarios).map(([dia, horarios]) => (
                  <div key={dia} className="flex flex-col gap-2 rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <strong className="font-medium">{dia}</strong>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {horarios.map((horario) => (
                        <Badge key={horario} variant="secondary">
                          {horario}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 animate-spin" />
                  <span>Cargando horarios...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </TallerModal>
    </>
  );
}