/*
 * Prepara las fotos de la galería.
 *
 *   fotos-cliente/Bodas/*.jpg     ->  public/galeria/bodas/1.jpg ...
 *   fotos-cliente/Retratos/*.jpg  ->  public/galeria/retratos/1.jpg ...
 *
 * Cada carpeta es una categoría. Reduce las fotos a un tamaño adecuado para web
 * y genera contenido/galeria.generada.json. Uso: npm run fotos
 */
import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ORIGEN = "fotos-cliente";
const DESTINO = "public/galeria";
const LADO_MAXIMO = 2400;
const EXTENSIONES = /\.(jpe?g|png|webp|tiff?|heic)$/i;

const url = (texto) =>
  texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-");

const CARPETA_WEB = "_web";

async function exportar(entrada, salida) {
  const imagen = () => sharp(entrada).rotate();
  const { width, height } = await imagen()
    .resize(LADO_MAXIMO, LADO_MAXIMO, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(salida);
  await imagen()
    .resize(900, 900, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 78, mozjpeg: true })
    .toFile(salida.replace(/\.jpg$/, "-900.jpg"));
  return { width, height };
}

/* Portada, servicios y retrato: fotos-cliente/_web/portada-1.jpg -> /web/portada-1.jpg */
await rm("public/web", { recursive: true, force: true });
await mkdir("public/web", { recursive: true });
const sueltas = await readdir(path.join(ORIGEN, CARPETA_WEB)).catch(() => []);
for (const archivo of sueltas.filter((a) => EXTENSIONES.test(a))) {
  await exportar(path.join(ORIGEN, CARPETA_WEB, archivo), `public/web/${url(path.parse(archivo).name)}.jpg`);
  console.log(`Web: /web/${url(path.parse(archivo).name)}.jpg`);
}

const carpetas = (await readdir(ORIGEN, { withFileTypes: true }))
  .filter((e) => e.isDirectory() && e.name !== CARPETA_WEB)
  .map((e) => e.name);
await rm(DESTINO, { recursive: true, force: true });

const fotos = [];
for (const categoria of carpetas) {
  const archivos = (await readdir(path.join(ORIGEN, categoria))).filter((a) => EXTENSIONES.test(a)).sort();
  await mkdir(path.join(DESTINO, url(categoria)), { recursive: true });

  for (const [i, archivo] of archivos.entries()) {
    const salida = `${url(categoria)}/${i + 1}.jpg`;
    const { width, height } = await exportar(path.join(ORIGEN, categoria, archivo), path.join(DESTINO, salida));
    fotos.push({ src: `/galeria/${salida}`, ancho: width, alto: height, categoria, alt: `Fotografía de ${categoria.toLowerCase()}` });
  }
  console.log(`${categoria}: ${archivos.length} fotos`);
}

/* Alterna las categorías para que la galería "Todo" quede variada. */
const porCategoria = carpetas.map((c) => fotos.filter((f) => f.categoria === c));
const mezcla = [];
while (porCategoria.some((lista) => lista.length)) {
  for (const lista of porCategoria) if (lista.length) mezcla.push(lista.shift());
}

await writeFile("contenido/galeria.generada.json", `${JSON.stringify(mezcla, null, 2)}\n`);
console.log(`Listo: ${mezcla.length} fotos en la galería.`);
