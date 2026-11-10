import { archivoValido, json, contarUso, mismoOrigen, sesionValida, type Env } from "../../../servidor/seguridad";

const MAX_BYTES = 8 * 1024 * 1024;

export const onRequestPut: PagesFunction<Env> = async ({ request, env, params }) => {
  if (!mismoOrigen(request)) return json({ error: "origen" }, 403);
  if (!(await sesionValida(request, env))) return json({ error: "sesion" }, 401);

  const archivo = String(params.archivo);
  if (!archivoValido(archivo) || request.headers.get("Content-Type") !== "image/jpeg") return json({ error: "datos" }, 400);

  const datos = await request.arrayBuffer();
  const inicio = new Uint8Array(datos.slice(0, 3));
  if (datos.byteLength > MAX_BYTES) return json({ error: "tamano" }, 413);
  if (inicio[0] !== 0xff || inicio[1] !== 0xd8 || inicio[2] !== 0xff) return json({ error: "datos" }, 400);

  /* Si se agota el límite diario, KV lanza un error. */
  try {
    await env.DATOS.put(`foto:${archivo}`, datos);
    await contarUso(env, "escrituras");
  } catch {
    return json({ error: "limite" }, 503);
  }
  return json({ guardada: true });
};
