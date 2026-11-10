"use client";

import { useEffect, useState } from "react";
import { Calendario } from "./Calendario";
import { EVENTO_FECHA } from "./BotonReservar";
import { aTexto, leerDias, legible, type Dias } from "@/lib/fechas";

export function Disponibilidad() {
  const [hoy, setHoy] = useState<Date | null>(null);
  const [mes, setMes] = useState<Date | null>(null);
  const [dias, setDias] = useState<Dias>({});
  const [fallo, setFallo] = useState(false);

  useEffect(() => {
    leerDias()
      .then((leidos) => {
        const ahora = new Date();
        const primera = Object.keys(leidos).filter((f) => leidos[f] === "libre" && f >= aTexto(ahora)).sort()[0];
        const inicial = primera ? new Date(`${primera}T12:00:00`) : ahora;
        setDias(leidos);
        setHoy(ahora);
        setMes(new Date(inicial.getFullYear(), inicial.getMonth(), 1));
      })
      .catch(() => setFallo(true));
  }, []);

  const elegir = (fecha: string) => {
    window.dispatchEvent(new CustomEvent(EVENTO_FECHA, { detail: legible(fecha) }));
    document.getElementById("contacto")?.scrollIntoView();
  };

  return (
    <section id="fechas" className="mx-auto grid max-w-[1440px] gap-10 px-5 py-20 md:grid-cols-2 md:gap-20 md:px-10 md:py-32">
      <div>
        <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-semibold leading-none tracking-[-0.04em]">Fechas disponibles</h2>
        <p className="mt-6 max-w-[460px] text-[19px] leading-[1.45] text-ink-2 md:text-[21px]">
          Elige un día libre y te preparo el presupuesto. Los días en color ya están ocupados. Si tu fecha no aparece, pregúntame igualmente.
        </p>
      </div>
      <div className="min-h-[420px] w-full max-w-[460px] md:justify-self-end">
        {fallo && <p className="text-ink-2">No se ha podido cargar el calendario. Escríbeme y te digo si tengo la fecha libre.</p>}
        {hoy && mes && (
          <Calendario hoy={hoy} mes={mes} alCambiarMes={setMes} dias={dias} alElegir={elegir} />
        )}
      </div>
    </section>
  );
}
