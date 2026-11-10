import { hoyUtc, json, sesionValida, type Env } from "../../servidor/seguridad";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (!(await sesionValida(request, env))) return json({ error: "sesion" }, 401);
  const { results } = await env.ESTADISTICAS.prepare("SELECT detalle, total FROM eventos WHERE dia = ? AND tipo = 'uso'")
    .bind(hoyUtc())
    .all<{ detalle: string; total: number }>();
  const valor = (detalle: string) => results.find((f) => f.detalle === detalle)?.total ?? 0;
  return json({ peticiones: valor("peticiones"), escrituras: valor("escrituras") });
};
