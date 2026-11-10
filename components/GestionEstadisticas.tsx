"use client";

import { useEffect, useMemo, useState } from "react";
import { sitio } from "@/contenido/sitio";
import { leerEstadisticas, type Datos, type Fila } from "@/lib/estadisticas";
import { aTexto } from "@/lib/fechas";

const PERIODOS = [
  { dias: 7, texto: "7 días" },
  { dias: 30, texto: "30 días" },
  { dias: 90, texto: "3 meses" },
];

const ORIGENES: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  buscadores: "Buscadores",
  whatsapp: "WhatsApp",
  pinterest: "Pinterest",
  tiktok: "TikTok",
  directo: "Directo o enlace guardado",
  otras: "Otras webs",
};

const DISPOSITIVOS: Record<string, string> = { movil: "Móvil", ordenador: "Ordenador" };

const fechaCorta = (dia: string) =>
  new Date(`${dia}T12:00:00`).toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" });

const sumar = (filas: Fila[]) => filas.reduce((total, f) => total + f.total, 0);

function agrupar(filas: Fila[], campo: "detalle" | "dispositivo", nombres: Record<string, string>) {
  const grupos = new Map<string, number>();
  for (const f of filas) grupos.set(f[campo], (grupos.get(f[campo]) ?? 0) + f.total);
  return [...grupos].filter(([, total]) => total > 0).sort((a, b) => b[1] - a[1]).map(([clave, total]) => ({ nombre: nombres[clave] ?? clave, total }));
}

function serieDiaria(datos: Datos, visitas: Fila[]) {
  const porDia = new Map<string, number>();
  for (const f of visitas) porDia.set(f.dia, (porDia.get(f.dia) ?? 0) + f.total);
  const serie: { dia: string; total: number }[] = [];
  const cursor = new Date(`${datos.desde}T12:00:00`);
  while (aTexto(cursor) <= datos.hoy) {
    const dia = aTexto(cursor);
    serie.push({ dia, total: porDia.get(dia) ?? 0 });
    cursor.setDate(cursor.getDate() + 1);
  }
  return serie;
}

export function GestionEstadisticas({ activa, alCaducar }: { activa: boolean; alCaducar: () => void }) {
  const [dias, setDias] = useState(30);
  const [datos, setDatos] = useState<Datos | null>(null);
  const [fallo, setFallo] = useState(false);
  const [marcado, setMarcado] = useState<number | null>(null);

  useEffect(() => {
    if (!activa) return;
    let vigente = true;
    leerEstadisticas(dias)
      .then((nuevos) => {
        if (!vigente) return;
        setDatos(nuevos);
        setFallo(false);
      })
      .catch((e: Error) => {
        if (e.message === "401") alCaducar();
        else if (vigente) setFallo(true);
      });
    return () => {
      vigente = false;
    };
  }, [activa, dias, alCaducar]);

  const resumen = useMemo(() => {
    if (!datos) return null;
    const visitas = datos.filas.filter((f) => f.tipo === "visita");
    const contactos = datos.filas.filter((f) => f.tipo === "contacto");
    const serie = serieDiaria(datos, visitas);
    return {
      serie,
      maximo: Math.max(1, ...serie.map((p) => p.total)),
      visitas: sumar(visitas),
      hoy: serie.at(-1)?.total ?? 0,
      contactos: sumar(contactos),
      origenes: agrupar(visitas, "detalle", ORIGENES),
      dispositivos: agrupar(visitas, "dispositivo", DISPOSITIVOS),
    };
  }, [datos]);

  if (fallo) return <p className="text-[17px] text-ink-2">No se han podido cargar las estadísticas. Inténtalo de nuevo.</p>;
  if (!resumen) return <p className="text-[17px] text-ink-2">Cargando…</p>;

  const punto = marcado !== null ? resumen.serie[marcado] : null;
  const cifras = [
    { valor: resumen.visitas, texto: "visitas" },
    { valor: resumen.hoy, texto: "hoy" },
    { valor: resumen.contactos, texto: "mensajes iniciados" },
  ];

  return (
    <div>
      {sitio.demo && <p className="mb-6 rounded-lg bg-mist p-4 text-[15px]">Datos de ejemplo. En la web real verás tus visitas.</p>}

      <div className="flex gap-6 text-[17px]" role="group" aria-label="Periodo">
        {PERIODOS.map((p) => (
          <button
            key={p.dias}
            type="button"
            aria-pressed={p.dias === dias}
            onClick={() => { setMarcado(null); setDias(p.dias); }}
            className={`border-b pb-0.5 transition-colors ${p.dias === dias ? "border-ink text-ink" : "border-transparent text-ink-2 hover:text-ink"}`}
          >
            {p.texto}
          </button>
        ))}
      </div>

      <dl className="mt-8 grid grid-cols-3 gap-4">
        {cifras.map((c) => (
          <div key={c.texto}>
            <dd className="text-[clamp(2.25rem,6vw,4rem)] font-semibold leading-none tracking-[-0.04em] tabular-nums">{c.valor}</dd>
            <dt className="mt-2 text-[14px] text-ink-2 md:text-[15px]">{c.texto}</dt>
          </div>
        ))}
      </dl>

      <section className="mt-12">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-[21px] font-semibold tracking-[-0.02em]">Visitas por día</h2>
          <p aria-live="polite" className="text-[15px] tabular-nums text-ink-2">
            {punto ? `${fechaCorta(punto.dia)}: ${punto.total}` : `Máximo: ${resumen.maximo}`}
          </p>
        </div>
        <div className="mt-4 flex h-44 items-end gap-[2px] border-b border-line" onMouseLeave={() => setMarcado(null)}>
          {resumen.serie.map((p, i) => (
            <button
              key={p.dia}
              type="button"
              aria-label={`${fechaCorta(p.dia)}: ${p.total} visitas`}
              onMouseEnter={() => setMarcado(i)}
              onFocus={() => setMarcado(i)}
              onClick={() => setMarcado(i)}
              className="flex h-full min-w-0 flex-1 items-end"
            >
              <span
                className={`block w-full rounded-t-[4px] transition-colors ${marcado === i ? "bg-accent" : "bg-ink"}`}
                style={{ height: p.total ? `${Math.max(2, (p.total / resumen.maximo) * 100)}%` : 0 }}
              />
            </button>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[13px] text-ink-2">
          <span>{fechaCorta(resumen.serie[0].dia)}</span>
          <span>{fechaCorta(resumen.serie.at(-1)!.dia)}</span>
        </div>
      </section>

      <div className="mt-12 grid gap-10 md:grid-cols-2 md:gap-16">
        <Reparto titulo="De dónde llegan" filas={resumen.origenes} total={resumen.visitas} />
        <Reparto titulo="Desde qué dispositivo" filas={resumen.dispositivos} total={resumen.visitas} />
      </div>

      <p className="mt-12 max-w-[640px] text-[15px] leading-snug text-ink-2">
        Se cuentan visitas, no personas: sin cookies ni datos personales. Quien entra desde WhatsApp o desde la app de Instagram puede
        aparecer como directo. Tus visitas con la sesión abierta no se cuentan.
      </p>
    </div>
  );
}

function Reparto({ titulo, filas, total }: { titulo: string; filas: { nombre: string; total: number }[]; total: number }) {
  return (
    <section>
      <h2 className="text-[21px] font-semibold tracking-[-0.02em]">{titulo}</h2>
      {filas.length === 0 && <p className="mt-4 text-[16px] text-ink-2">Todavía no hay visitas en este periodo.</p>}
      <ul className="mt-4 space-y-4">
        {filas.map((f) => (
          <li key={f.nombre}>
            <div className="flex justify-between gap-4 text-[16px]">
              <span>{f.nombre}</span>
              <span className="tabular-nums text-ink-2">{f.total} · {Math.round((f.total / total) * 100)}%</span>
            </div>
            <div className="mt-1.5 h-1.5 rounded-full bg-mist">
              <div className="h-full rounded-full bg-ink" style={{ width: `${(f.total / total) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
