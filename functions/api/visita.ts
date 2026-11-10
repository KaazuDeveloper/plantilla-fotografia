import { hoyEnEspana, json, mismoOrigen, sesionValida, type Env } from "../../servidor/seguridad";

const ROBOTS = /bot|crawl|spider|slurp|preview|headless|lighthouse|facebookexternalhit|whatsapp/i;
const CANALES = new Set(["whatsapp", "correo"]);

/* Solo se guarda el tipo de origen, nunca la dirección de la que viene el visitante. */
function origen(host: unknown): string {
  if (typeof host !== "string" || !host) return "directo";
  if (/instagram\./i.test(host)) return "instagram";
  if (/(^|\.)(facebook\.com|fb\.com|fb\.me)$/i.test(host)) return "facebook";
  if (/(^|\.)(google\.|bing\.|duckduckgo\.|yahoo\.|ecosia\.)/i.test(host)) return "buscadores";
  if (/(whatsapp\.|^wa\.me$)/i.test(host)) return "whatsapp";
  if (/pinterest\./i.test(host)) return "pinterest";
  if (/tiktok\./i.test(host)) return "tiktok";
  return "otras";
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const nada = new Response(null, { status: 204 });
  const agente = request.headers.get("User-Agent") ?? "";
  /* No cuenta robots ni las visitas de quien gestiona la web. */
  if (!mismoOrigen(request) || !agente || ROBOTS.test(agente) || (await sesionValida(request, env))) return nada;

  const cuerpo = await request.json<{ tipo?: unknown; origen?: unknown; canal?: unknown }>().catch(() => null);
  let detalle: string | null = null;
  if (cuerpo?.tipo === "visita") detalle = origen(cuerpo.origen);
  if (cuerpo?.tipo === "contacto" && typeof cuerpo.canal === "string" && CANALES.has(cuerpo.canal)) detalle = cuerpo.canal;
  if (!detalle) return json({ error: "datos" }, 400);

  const dispositivo = /Mobi|Android|iPhone|iPad/i.test(agente) ? "movil" : "ordenador";
  await env.ESTADISTICAS.prepare(
    `INSERT INTO eventos (dia, tipo, detalle, dispositivo, total) VALUES (?, ?, ?, ?, 1)
     ON CONFLICT (dia, tipo, detalle, dispositivo) DO UPDATE SET total = total + 1`,
  )
    .bind(hoyEnEspana(), cuerpo!.tipo as string, detalle, dispositivo)
    .run()
    .catch(() => null);
  return nada;
};
