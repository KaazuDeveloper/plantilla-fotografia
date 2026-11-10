import { json, contarUso, mismoOrigen, sesionValida, type Env } from "../../servidor/seguridad";

const CLAVE = "galeria";
const MAX_FOTOS = 120;
const SUBIDA = /^\/web\/(g-[0-9a-f-]{36})\.jpg$/;
const ORIGENES = /^(\/web\/g-[0-9a-f-]{36}\.jpg|\/galeria\/[a-z0-9/-]+\.jpg|https:\/\/images\.unsplash\.com\/.+)$/;

type Foto = { src: string; ancho: number; alto: number; alt: string; categoria: string };

const medida = (n: unknown) => Number.isInteger(n) && (n as number) > 0 && (n as number) <= 12000;

const fotoValida = (f: Partial<Foto> | null): f is Foto =>
  typeof f?.src === "string" &&
  ORIGENES.test(f.src) &&
  medida(f.ancho) &&
  medida(f.alto) &&
  typeof f.alt === "string" &&
  f.alt.length <= 200 &&
  typeof f.categoria === "string" &&
  f.categoria.trim().length > 0 &&
  f.categoria.length <= 40;

export const onRequestGet: PagesFunction<Env> = async ({ env }) => json({ fotos: await env.DATOS.get<Foto[]>(CLAVE, "json") });

export const onRequestPut: PagesFunction<Env> = async ({ request, env }) => {
  if (!mismoOrigen(request)) return json({ error: "origen" }, 403);
  if (!(await sesionValida(request, env))) return json({ error: "sesion" }, 401);

  const cuerpo = await request.json<{ fotos?: unknown }>().catch(() => null);
  const fotos = cuerpo?.fotos;
  if (!Array.isArray(fotos) || fotos.length > MAX_FOTOS || !fotos.every(fotoValida)) return json({ error: "datos" }, 400);

  const anteriores = (await env.DATOS.get<Foto[]>(CLAVE, "json")) ?? [];
  const siguen = new Set((fotos as Foto[]).map((f) => f.src));
  try {
    await env.DATOS.put(CLAVE, JSON.stringify(fotos));
    await contarUso(env, "escrituras");
  } catch {
    return json({ error: "limite" }, 503);
  }

  /* Libera el espacio de las fotos subidas que se han quitado. */
  const quitadas = anteriores.filter((f) => !siguen.has(f.src)).flatMap((f) => f.src.match(SUBIDA)?.[1] ?? []);
  await Promise.all(quitadas.flatMap((id) => [env.DATOS.delete(`foto:${id}.jpg`), env.DATOS.delete(`foto:${id}-900.jpg`)]));
  return json({ guardada: true });
};
