"use client";

import { useEffect, useState } from "react";
import { Calendario } from "./Calendario";
import { sitio } from "@/contenido/sitio";
import { aTexto, guardarDias, leerDias, type Dias } from "@/lib/fechas";

const SEMANA = [
  { numero: 1, letra: "L", nombre: "lunes" },
  { numero: 2, letra: "M", nombre: "martes" },
  { numero: 3, letra: "X", nombre: "miércoles" },
  { numero: 4, letra: "J", nombre: "jueves" },
  { numero: 5, letra: "V", nombre: "viernes" },
  { numero: 6, letra: "S", nombre: "sábados" },
  { numero: 0, letra: "D", nombre: "domingos" },
];

const PERIODOS = [
  { meses: 1, texto: "Este mes" },
  { meses: 3, texto: "3 meses" },
  { meses: 6, texto: "6 meses" },
  { meses: 12, texto: "12 meses" },
];

const cuenta = (n: number) => (n === 1 ? "1 día" : `${n} días`);
const atajo = "text-[15px] text-accent hover:underline";

const iguales = (a: Dias, b: Dias) => Object.keys(a).length === Object.keys(b).length && Object.keys(a).every((f) => a[f] === b[f]);

const sinDia = (dias: Dias, fecha: string) => Object.fromEntries(Object.entries(dias).filter(([f]) => f !== fecha));

export function GestionFechas({ alCaducar }: { alCaducar: () => void }) {
  const [hoy, setHoy] = useState<Date | null>(null);
  const [mes, setMes] = useState<Date | null>(null);
  const [dias, setDias] = useState<Dias>({});
  const [guardados, setGuardados] = useState<Dias>({});
  const [aviso, setAviso] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [semana, setSemana] = useState<number[]>([]);
  const [meses, setMeses] = useState(1);

  const pendiente = !iguales(dias, guardados);

  useEffect(() => {
    leerDias()
      .then((leidos) => {
        const ahora = new Date();
        setDias(leidos);
        setGuardados(leidos);
        setHoy(ahora);
        setMes(new Date(ahora.getFullYear(), ahora.getMonth(), 1));
      })
      .catch(() => setAviso("No se han podido cargar las fechas. Recarga la página."));
  }, []);

  useEffect(() => {
    if (!pendiente) return;
    const avisar = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", avisar);
    return () => window.removeEventListener("beforeunload", avisar);
  }, [pendiente]);

  /* Cada pulsación avanza: sin marcar, libre, ocupado y otra vez sin marcar. */
  const alternar = (fecha: string) => {
    setAviso("");
    setDias((actuales) => {
      if (!actuales[fecha]) return { ...actuales, [fecha]: "libre" };
      if (actuales[fecha] === "libre") return { ...actuales, [fecha]: "ocupado" };
      return sinDia(actuales, fecha);
    });
  };

  const alternarSemana = (numero: number) => {
    setSemana((actual) => (actual.includes(numero) ? actual.filter((n) => n !== numero) : [...actual, numero]));
  };

  /* Los días elegidos dentro del periodo, empezando por el mes que se está viendo. Nunca incluye días pasados. */
  const diasElegidos = () => {
    if (!mes || !hoy) return [];
    const elegidos: string[] = [];
    const hoyTexto = aTexto(hoy);
    const fin = new Date(mes.getFullYear(), mes.getMonth() + meses, 1);
    for (const d = new Date(mes.getFullYear(), mes.getMonth(), 1); d < fin; d.setDate(d.getDate() + 1)) {
      if (semana.includes(d.getDay()) && aTexto(d) >= hoyTexto) elegidos.push(aTexto(d));
    }
    return elegidos;
  };

  const aplicar = (accion: "libre" | "ocupado" | "quitar") => {
    if (semana.length === 0) {
      setAviso("Elige antes algún día de la semana.");
      return;
    }
    const elegidos = diasElegidos();
    const nuevos = { ...dias };
    let respetados = 0;
    for (const fecha of elegidos) {
      if (accion === "quitar") delete nuevos[fecha];
      else if (accion === "libre" && nuevos[fecha] === "ocupado") respetados++;
      else nuevos[fecha] = accion;
    }
    setDias(nuevos);
    const hechos = elegidos.length - respetados;
    const uno = hechos === 1;
    const texto =
      accion === "quitar"
        ? uno ? "quitado" : "quitados"
        : accion === "libre"
          ? uno ? "marcado como libre" : "marcados como libres"
          : uno ? "marcado como ocupado" : "marcados como ocupados";
    const aparte = respetados === 1 ? " 1 día ya ocupado no se ha tocado." : respetados ? ` ${respetados} días ya ocupados no se han tocado.` : "";
    setAviso(hechos || respetados ? `${cuenta(hechos)} ${texto}.${aparte} Pulsa Guardar cambios para que se vea en la web.` : "No hay días que cambiar en ese periodo.");
  };

  const deshacer = () => {
    setDias(guardados);
    setAviso("Cambios deshechos.");
  };

  const guardar = async () => {
    setGuardando(true);
    setAviso("");
    try {
      await guardarDias(dias);
      setGuardados(dias);
      setAviso(sitio.demo ? "Guardado solo en este navegador, porque es una demo." : "Guardado. La web se actualiza en menos de un minuto.");
    } catch (e) {
      if ((e as Error).message === "401") alCaducar();
      else setAviso((e as Error).message === "503" ? "Hoy se ha llegado al límite gratuito de cambios. Prueba mañana." : "No se ha podido guardar. Inténtalo de nuevo.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,300px)] md:gap-16">
      <div>
        <p className="mb-8 text-[17px] text-ink-2">Pulsa un día una vez para marcarlo libre, otra vez para marcarlo ocupado y otra más para quitarlo.</p>
        <div className="max-w-[460px]">
          {hoy && mes && <Calendario hoy={hoy} mes={mes} alCambiarMes={setMes} dias={dias} alElegir={alternar} editable />}
        </div>
      </div>

      <aside className="md:pt-14">
        <p className="text-[15px] font-medium">Marcar varios días</p>
        <div className="mt-3 flex justify-between gap-1" role="group" aria-label="Días de la semana">
          {SEMANA.map((d) => {
            const activo = semana.includes(d.numero);
            return (
              <button
                key={d.numero}
                type="button"
                aria-pressed={activo}
                aria-label={`Todos los ${d.nombre}`}
                onClick={() => alternarSemana(d.numero)}
                className={`flex size-9 items-center justify-center rounded-full text-[15px] transition-colors ${activo ? "bg-ink text-white" : "bg-mist text-ink hover:bg-line"}`}
              >
                {d.letra}
              </button>
            );
          })}
        </div>
        <div className="mt-2 flex gap-4">
          <button type="button" onClick={() => setSemana([6, 0])} className={atajo}>Fines de semana</button>
          <button type="button" onClick={() => setSemana(SEMANA.map((d) => d.numero))} className={atajo}>Todos</button>
          <button type="button" onClick={() => setSemana([])} className={atajo}>Ninguno</button>
        </div>

        <label className="mt-4 block">
          <span className="mb-1.5 block text-[14px] font-medium">Durante</span>
          <select
            value={meses}
            onChange={(e) => setMeses(Number(e.target.value))}
            className="h-11 w-full rounded-xl border border-line bg-white px-3 text-[16px] outline-none focus:border-ink"
          >
            {PERIODOS.map((p) => <option key={p.meses} value={p.meses}>{p.texto}</option>)}
          </select>
        </label>

        <div className="mt-4 grid grid-cols-3 gap-2 text-[15px]">
          <button type="button" onClick={() => aplicar("libre")} className="rounded-full bg-ink py-2.5 text-white transition-colors hover:bg-ink/75">Libres</button>
          <button type="button" onClick={() => aplicar("ocupado")} className="rounded-full bg-accent py-2.5 text-white transition-colors hover:bg-accent/80">Ocupados</button>
          <button type="button" onClick={() => aplicar("quitar")} className="rounded-full border border-line py-2.5 transition-colors hover:bg-mist">Quitar</button>
        </div>

        <button
          type="button"
          disabled={!pendiente || guardando}
          onClick={guardar}
          className="mt-8 w-full rounded-full bg-ink py-3 text-[17px] text-white transition-colors hover:bg-ink/80 disabled:bg-line disabled:text-ink-2"
        >
          {guardando ? "Guardando…" : pendiente ? "Guardar cambios" : "Sin cambios"}
        </button>
        {pendiente && !guardando && (
          <button type="button" onClick={deshacer} className="mt-2 w-full py-1 text-[15px] text-ink-2 hover:text-ink">Deshacer cambios</button>
        )}
        {aviso && <p role="status" className="mt-3 text-[15px] leading-snug text-ink-2">{aviso}</p>}
      </aside>
    </div>
  );
}
