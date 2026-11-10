import { json, contarUso, mismoOrigen, sesionValida, type Env } from "../../servidor/seguridad";

const CLAVE = "dias";
const MAX_DIAS = 800;

type Dias = Record<string, "libre" | "ocupado">;

const hoy = () => new Date().toISOString().slice(0, 10);

const fechaValida = (valor: unknown): valor is string => {
  if (typeof valor !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
  const fecha = new Date(`${valor}T00:00:00Z`);
  return !Number.isNaN(fecha.getTime()) && fecha.toISOString().slice(0, 10) === valor;
};

const futuros = (dias: Dias) => Object.fromEntries(Object.entries(dias).filter(([f]) => f >= hoy()).sort(([a], [b]) => a.localeCompare(b)));

export const onRequestGet: PagesFunction<Env> = async ({ env }) =>
  json({ dias: futuros((await env.DATOS.get<Dias>(CLAVE, "json")) ?? {}) });

export const onRequestPut: PagesFunction<Env> = async ({ request, env }) => {
  if (!mismoOrigen(request)) return json({ error: "origen" }, 403);
  if (!(await sesionValida(request, env))) return json({ error: "sesion" }, 401);

  const cuerpo = await request.json<{ dias?: unknown }>().catch(() => null);
  const dias = cuerpo?.dias;
  if (typeof dias !== "object" || dias === null || Array.isArray(dias)) return json({ error: "datos" }, 400);
  const pares = Object.entries(dias);
  if (pares.length > MAX_DIAS || !pares.every(([f, estado]) => fechaValida(f) && (estado === "libre" || estado === "ocupado"))) {
    return json({ error: "datos" }, 400);
  }
  const limpios = futuros(dias as Dias);
  try {
    await env.DATOS.put(CLAVE, JSON.stringify(limpios));
    await contarUso(env, "escrituras");
  } catch {
    return json({ error: "limite" }, 503);
  }
  return json({ dias: limpios });
};
