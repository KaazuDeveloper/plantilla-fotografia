import { contarUso, type Env } from "../../servidor/seguridad";

/* Cada petición cuenta contra el límite diario gratuito de Cloudflare. */
export const onRequest: PagesFunction<Env> = (contexto) => {
  contexto.waitUntil(contarUso(contexto.env, "peticiones"));
  return contexto.next();
};
