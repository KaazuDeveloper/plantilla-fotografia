import { anotarFallo, bloqueado, borrarCookie, claveCorrecta, crearCookie, json, limpiarFallos, mismoOrigen, sesionValida, type Env } from "../../servidor/seguridad";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) =>
  (await sesionValida(request, env)) ? json({ activa: true }) : json({ activa: false }, 401);

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!mismoOrigen(request)) return json({ error: "origen" }, 403);
  if (await bloqueado(request, env)) return json({ error: "intentos" }, 429);

  const cuerpo = await request.json<{ clave?: unknown }>().catch(() => null);
  if (typeof cuerpo?.clave !== "string" || !(await claveCorrecta(env, cuerpo.clave))) {
    await anotarFallo(request, env);
    return json({ error: "clave" }, 401);
  }
  await limpiarFallos(request, env);
  return json({ activa: true }, 200, { "Set-Cookie": await crearCookie(env) });
};

export const onRequestDelete: PagesFunction<Env> = async ({ request }) =>
  mismoOrigen(request) ? json({ activa: false }, 200, { "Set-Cookie": borrarCookie() }) : json({ error: "origen" }, 403);
