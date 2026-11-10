import { hoyEnEspana, json, sesionValida, type Env } from "../../servidor/seguridad";

const PERIODOS = new Set([7, 30, 90]);

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (!(await sesionValida(request, env))) return json({ error: "sesion" }, 401);

  const pedidos = Number(new URL(request.url).searchParams.get("dias"));
  const dias = PERIODOS.has(pedidos) ? pedidos : 30;
  const desde = hoyEnEspana(new Date(Date.now() - (dias - 1) * 86_400_000));
  const { results } = await env.ESTADISTICAS.prepare("SELECT dia, tipo, detalle, dispositivo, total FROM eventos WHERE dia >= ?").bind(desde).all();
  return json({ hoy: hoyEnEspana(), desde, filas: results });
};
