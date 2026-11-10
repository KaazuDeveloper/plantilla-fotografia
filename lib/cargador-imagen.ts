type Peticion = { src: string; width: number; quality?: number };

/* Sin servidor de imágenes: pide a Unsplash el tamaño justo, o la versión reducida de las fotos locales. */
export default function cargadorImagen({ src, width, quality }: Peticion): string {
  if (src.startsWith("https://images.unsplash.com/")) {
    const url = new URL(src);
    url.searchParams.set("w", String(width));
    url.searchParams.set("q", String(quality ?? 75));
    return url.toString();
  }
  return /^\/(galeria|web)\//.test(src) && width <= 1000 ? src.replace(/\.jpg(\?|$)/, "-900.jpg$1") : src;
}
