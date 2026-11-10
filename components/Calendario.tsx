"use client";

import { aTexto, type Dias } from "@/lib/fechas";

const DIAS = ["L", "M", "X", "J", "V", "S", "D"];
const MAXIMO_MESES = 24;

type Props = {
  hoy: Date;
  mes: Date;
  alCambiarMes: (mes: Date) => void;
  dias: Dias;
  alElegir: (fecha: string) => void;
  /* En gestión se puede pulsar cualquier día futuro; en la web, solo los libres. */
  editable?: boolean;
};

export function Calendario({ hoy, mes, alCambiarMes, dias, alElegir, editable = false }: Props) {
  const anio = mes.getFullYear();
  const numeroMes = mes.getMonth();
  const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const distancia = (anio - inicio.getFullYear()) * 12 + numeroMes - inicio.getMonth();
  const huecos = (new Date(anio, numeroMes, 1).getDay() + 6) % 7;
  const totalDias = new Date(anio, numeroMes + 1, 0).getDate();
  const textoHoy = aTexto(hoy);
  const flecha = "flex size-10 items-center justify-center rounded-full text-[20px] transition-colors hover:bg-mist disabled:opacity-25 disabled:hover:bg-transparent";

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-[21px] font-semibold tracking-[-0.02em] first-letter:uppercase" aria-live="polite">
          {mes.toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
        </p>
        <div className="flex gap-1">
          <button type="button" aria-label="Mes anterior" disabled={distancia <= 0} onClick={() => alCambiarMes(new Date(anio, numeroMes - 1, 1))} className={flecha}>←</button>
          <button type="button" aria-label="Mes siguiente" disabled={distancia >= MAXIMO_MESES} onClick={() => alCambiarMes(new Date(anio, numeroMes + 1, 1))} className={flecha}>→</button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center">
        {DIAS.map((d) => (
          <span key={d} className="py-2 text-[13px] text-ink-2">{d}</span>
        ))}
        {Array.from({ length: huecos }, (_, i) => (
          <span key={`hueco-${i}`} />
        ))}
        {Array.from({ length: totalDias }, (_, i) => {
          const dia = i + 1;
          const fecha = aTexto(new Date(anio, numeroMes, dia));
          const pasado = fecha < textoHoy;
          const estado = pasado ? undefined : dias[fecha];
          const activo = !pasado && (editable || estado === "libre");
          const aspecto =
            estado === "libre"
              ? "bg-ink font-medium text-white hover:bg-ink/75"
              : estado === "ocupado"
                ? `bg-accent font-medium text-white line-through ${editable ? "hover:bg-accent/80" : ""}`
                : activo
                  ? "text-ink hover:bg-mist"
                  : pasado
                    ? "text-ink-2/45"
                    : "text-ink-2";
          return (
            <button
              key={fecha}
              type="button"
              disabled={!activo}
              aria-label={`${dia}${estado ? `, ${estado}` : ""}`}
              onClick={() => alElegir(fecha)}
              className={`flex aspect-square items-center justify-center rounded-full text-[16px] tabular-nums transition-colors md:text-[17px] ${aspecto}`}
            >
              {dia}
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex gap-6 text-[15px] text-ink-2">
        <span className="flex items-center gap-2"><span className="size-3.5 rounded-full bg-ink" />Libre</span>
        <span className="flex items-center gap-2"><span className="size-3.5 rounded-full bg-accent" />Ocupado</span>
      </div>
    </div>
  );
}
