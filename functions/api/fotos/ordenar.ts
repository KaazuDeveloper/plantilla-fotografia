import { contarUso, json, mismoOrigen, sesionValida, type Env } from "../../../servidor/seguridad";

const PORTADA = /^portada-(\d{1,2})\.jpg$/;
const numero = (archivo: string) => Number(archivo.match(PORTADA)?.[1]);

/*
 * Cambia el orden de las fotos de portada. Recibe los archivos en el orden nuevo: el primero pasa a ser
 * portada-1, el segundo portada-2… Las direcciones no cambian, así que la web no necesita volver a publicarse.
 */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!mismoOrigen(request)) return json({ error: "origen" }, 403);
  if (!(await sesionValida(request, env))) return json({ error: "sesion" }, 401);

  const cuerpo = await request.json<{ archivos?: unknown }>().catch(() => null);
  const archivos = cuerpo?.archivos;
  if (
    !Array.isArray(archivos) ||
    archivos.length < 2 ||
    archivos.length > 12 ||
    !archivos.every((a) => typeof a === "string" && PORTADA.test(a)) ||
    new Set(archivos).size !== archivos.length
  ) {
    return json({ error: "datos" }, 400);
  }
  const destinos = [...(archivos as string[])].sort((a, b) => numero(a) - numero(b));

  /* La foto puede estar subida desde la gestión o ser la que se publicó con la web. */
  const leer = async (nombre: string) => {
    const subida = await env.DATOS.get(`foto:${nombre}`, "arrayBuffer");
    if (subida) return subida;
    const publicada = await env.ASSETS.fetch(new URL(`/web/${nombre}`, request.url));
    return publicada.ok && publicada.headers.get("Content-Type")?.startsWith("image/") ? publicada.arrayBuffer() : null;
  };
  const variantes = (nombre: string) => [nombre, nombre.replace(".jpg", "-900.jpg")];
  const datos = await Promise.all((archivos as string[]).flatMap(variantes).map(leer));
  if (datos.some((d) => !d)) return json({ error: "faltan" }, 409);

  try {
    await Promise.all(destinos.flatMap(variantes).map((destino, i) => env.DATOS.put(`foto:${destino}`, datos[i]!)));
  } catch {
    return json({ error: "limite" }, 503);
  }
  for (let i = 0; i < destinos.length * 2; i++) await contarUso(env, "escrituras");
  return json({ ordenado: true });
};
