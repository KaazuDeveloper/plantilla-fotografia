import { archivoValido, type Env } from "../../servidor/seguridad";

/* Las fotos subidas desde la gestión tienen prioridad sobre las publicadas con la web. */
export const onRequestGet: PagesFunction<Env> = async ({ params, env, next }) => {
  const archivo = String(params.archivo);
  if (!archivoValido(archivo)) return next();
  const foto = await env.DATOS.get(`foto:${archivo}`, "stream");
  if (!foto) return next();
  return new Response(foto, {
    headers: {
      "Content-Type": "image/jpeg",
      "X-Content-Type-Options": "nosniff",
      /* Las de la galería nunca cambian de contenido; las demás se sustituyen con el mismo nombre. */
      "Cache-Control": archivo.startsWith("g-") ? "public, max-age=31536000, immutable" : "public, max-age=300",
    },
  });
};
