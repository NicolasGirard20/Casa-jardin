'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/varios/ui/custom-tabs" 

export default function TabbedContent() {
  return (
    <Tabs defaultValue="tab1" className="w-full lg:max-w-[80vh] max-w-[45vh] ">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="tab1" className="text-xl">Misión</TabsTrigger>
        <TabsTrigger value="tab2" className="text-xl">Visión</TabsTrigger>
        <TabsTrigger value="tab3" className="text-xl">Valores</TabsTrigger>
      </TabsList>
      <TabsContent 
        value="tab1" 
        className="border rounded-lg mt-2 p-4"
      >
        <p className="text-2xl">Ofrecer espacios educativos y de acompañamiento para niños, adolescentes y 
            adultos, abarcando los desafíos de cada etapa de sus vidas, promoviendo la 
            realización de sus metas personales, teniendo en cuenta para esto, 
            todas las dimensiones del ser humano.</p>
      </TabsContent>
      <TabsContent 
        value="tab2"
        className="border rounded-lg mt-2 p-4"
      >
        <p className="text-2xl">Ser una institución líder en Crespo y la región, 
            reconocida por contar con un equipo profesional 
            comprometido con el acompañamiento integral de personas que 
            enfrentan desafíos o buscan alcanzar metas en una sociedad en 
            constante transformación. Adaptarnos a las necesidades educativas 
            y terapéuticas de niños, adolescentes y adultos, permaneciendo 
            siempre fieles a nuestros valores, objetivos y misión.</p>
      </TabsContent>
      <TabsContent 
        value="tab3"
        className="border rounded-lg mt-2 p-4"
      >
        <p className="text-2xl">En Casa Jardín, nos guiamos por valores fundamentales que reflejan nuestro
            compromiso con la comunidad. Promovemos el espíritu de familia, 
            la cercanía y el amor al trabajo, actuando con solidaridad, empatía e integridad. 
            Fomentamos la creatividad, innovación, la resiliencia y el respeto por la naturaleza, 
            mientras priorizamos la escucha activa, la transparencia y la mejora continua. 
            Trabajamos con responsabilidad y calidad, siempre fieles a nuestra misión.</p>
      </TabsContent>
    </Tabs>
  )
}

