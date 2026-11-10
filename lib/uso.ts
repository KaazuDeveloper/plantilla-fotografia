import { sitio } from "@/contenido/sitio";

export const LIMITE_ESCRITURAS = 1000;
export const LIMITE_PETICIONES = 100000;

export type Uso = { peticiones: number; escrituras: number };

export async function leerUso(): Promise<Uso> {
  if (sitio.demo) return { peticiones: 1842, escrituras: 26 };
  const respuesta = await fetch("/api/uso", { cache: "no-store" });
  if (!respuesta.ok) throw new Error(String(respuesta.status));
  return respuesta.json();
}

/* Los límites se renuevan a medianoche UTC: se muestra esa hora en la zona del navegador. */
export function horaRenovacion() {
  const ahora = new Date();
  const proxima = new Date(Date.UTC(ahora.getUTCFullYear(), ahora.getUTCMonth(), ahora.getUTCDate() + 1));
  return proxima.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}
