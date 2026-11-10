import { sitio } from "@/contenido/sitio";

/* Fechas siempre como "AAAA-MM-DD" en hora local, para que no se desplacen de día. */
export const aTexto = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const legible = (fecha: string) =>
  new Date(`${fecha}T12:00:00`).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

export type EstadoDia = "libre" | "ocupado";
export type Dias = Record<string, EstadoDia>;

const CLAVE_DEMO = "demoDias";
const SESION_DEMO = "demoSesion";

/* Días de muestra para la demo: sábados alternos libres y ocupados, y algún viernes libre. */
function diasDeEjemplo(): Dias {
  const dias: Dias = {};
  const dia = new Date();
  for (let i = 1; i < 150; i++) {
    dia.setDate(dia.getDate() + 1);
    const semana = Math.floor(i / 7);
    if (dia.getDay() === 6) dias[aTexto(dia)] = semana % 2 === 0 ? "libre" : "ocupado";
    if (dia.getDay() === 5 && semana % 3 === 0) dias[aTexto(dia)] = "libre";
  }
  return dias;
}

export async function leerDias(): Promise<Dias> {
  if (sitio.demo) {
    const guardados = localStorage.getItem(CLAVE_DEMO);
    return guardados ? (JSON.parse(guardados) as Dias) : diasDeEjemplo();
  }
  const respuesta = await fetch("/api/disponibilidad", { cache: "no-store" });
  if (!respuesta.ok) throw new Error("No se han podido cargar las fechas");
  return ((await respuesta.json()) as { dias: Dias }).dias;
}

export async function guardarDias(dias: Dias): Promise<void> {
  if (sitio.demo) {
    localStorage.setItem(CLAVE_DEMO, JSON.stringify(dias));
    return;
  }
  const respuesta = await fetch("/api/disponibilidad", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dias }),
  });
  if (!respuesta.ok) throw new Error(String(respuesta.status));
}

export async function haySesion(): Promise<boolean> {
  if (sitio.demo) return sessionStorage.getItem(SESION_DEMO) === "1";
  const respuesta = await fetch("/api/sesion", { cache: "no-store" });
  return respuesta.ok;
}

/* Devuelve el código HTTP de la respuesta: 200 si ha entrado. */
export async function entrar(clave: string): Promise<number> {
  if (sitio.demo) {
    sessionStorage.setItem(SESION_DEMO, "1");
    return 200;
  }
  const respuesta = await fetch("/api/sesion", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clave }),
  });
  return respuesta.status;
}

export async function salir(): Promise<void> {
  if (sitio.demo) {
    sessionStorage.removeItem(SESION_DEMO);
    return;
  }
  await fetch("/api/sesion", { method: "DELETE" });
}
