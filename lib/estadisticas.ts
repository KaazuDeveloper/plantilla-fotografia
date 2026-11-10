import { sitio } from "@/contenido/sitio";
import { aTexto } from "./fechas";

export type Fila = { dia: string; tipo: string; detalle: string; dispositivo: string; total: number };
export type Datos = { hoy: string; desde: string; filas: Fila[] };

/* Aviso anónimo de una visita o de un contacto: sin cookies y sin identificar a nadie. */
export function registrarEvento(evento: { tipo: "visita"; origen: string } | { tipo: "contacto"; canal: string }) {
  if (sitio.demo) return;
  void fetch("/api/visita", {
    method: "POST",
    keepalive: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(evento),
  }).catch(() => undefined);
}

function datosDeEjemplo(dias: number): Datos {
  const filas: Fila[] = [];
  const dia = new Date();
  const hoy = aTexto(dia);
  const pseudo = (n: number) => {
    const x = Math.sin(n * 91.7) * 43758.5;
    return x - Math.floor(x);
  };
  const reparto: [string, number][] = [["instagram", 0.46], ["directo", 0.24], ["buscadores", 0.18], ["whatsapp", 0.09], ["otras", 0.03]];
  dia.setDate(dia.getDate() - dias + 1);
  const desde = aTexto(dia);
  for (let i = 0; i < dias; i++) {
    const texto = aTexto(dia);
    const numero = Number(texto.replaceAll("-", ""));
    const finde = dia.getDay() === 0 || dia.getDay() === 6;
    const visitas = Math.round((finde ? 26 : 13) + pseudo(numero) * 14);
    for (const [detalle, parte] of reparto) {
      const total = Math.round(visitas * parte);
      filas.push({ dia: texto, tipo: "visita", detalle, dispositivo: "movil", total: Math.round(total * 0.72) });
      filas.push({ dia: texto, tipo: "visita", detalle, dispositivo: "ordenador", total: total - Math.round(total * 0.72) });
    }
    filas.push({ dia: texto, tipo: "contacto", detalle: "whatsapp", dispositivo: "movil", total: pseudo(numero + 1) > 0.72 ? 1 : 0 });
    dia.setDate(dia.getDate() + 1);
  }
  return { hoy, desde, filas };
}

export async function leerEstadisticas(dias: number): Promise<Datos> {
  if (sitio.demo) return datosDeEjemplo(dias);
  const respuesta = await fetch(`/api/estadisticas?dias=${dias}`, { cache: "no-store" });
  if (!respuesta.ok) throw new Error(String(respuesta.status));
  return respuesta.json();
}
