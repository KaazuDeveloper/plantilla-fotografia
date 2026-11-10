import { sitio, type Foto } from "@/contenido/sitio";

export type FotoGaleria = Foto & { archivo?: string };

export const MAX_FOTOS = 120;
export const MAX_ENTRADA_MB = 60;
export const PESO_FINAL_MB = 1.5;

const BYTES_MB = 1024 * 1024;
const LADOS = [2400, 2000, 1600];
const CALIDADES = [0.84, 0.76, 0.68, 0.6];
/* Por debajo de este lado la foto puede verse borrosa a pantalla grande. */
const LADO_MINIMO = 1400;

export const enMb = (bytes: number) => `${(bytes / BYTES_MB).toLocaleString("es-ES", { maximumFractionDigits: 1 })} MB`;

/* Explica en palabras normales por qué no se ha podido subir una foto. */
export function motivoError(error: unknown) {
  switch ((error as Error).message) {
    case "formato":
      return "ese formato no se puede leer; prueba a exportarla en JPG";
    case "enorme":
      return `pesa más de ${MAX_ENTRADA_MB} MB; expórtala en menor tamaño`;
    case "503":
      return "hoy se ha llegado al límite gratuito de subidas; prueba mañana";
    default:
      return "ha fallado la conexión; inténtalo de nuevo";
  }
}

/* Fotos de sitio fijo: se sustituyen manteniendo el nombre del archivo. */
export const ranuras = [
  ...sitio.portada.map((f, i) => ({ archivo: `portada-${i + 1}.jpg`, grupo: "Portada", nombre: `Foto ${i + 1}`, src: f.src })),
  ...sitio.servicios.map((s, i) => ({ archivo: `servicio-${i + 1}.jpg`, grupo: "Servicios", nombre: s.nombre, src: s.foto })),
  ...sitio.equipo.personas.map((p, i) => ({ archivo: `equipo-${i + 1}.jpg`, grupo: sitio.equipo.menu, nombre: p.saludo, src: p.foto })),
  ...sitio.videos.map((v, i) => ({ archivo: `video-${i + 1}.jpg`, grupo: "Portada del vídeo", nombre: v.titulo, src: v.portada })),
];

export type Ranura = (typeof ranuras)[number];
type FotoPreparada = { grande: Blob; pequena: Blob; ancho: number; alto: number; pesoOriginal: number; escasa: boolean };

/* La demo guarda las fotos en este navegador, sin servidor. */
const abrirDemo = () =>
  new Promise<IDBDatabase>((resolver, rechazar) => {
    const peticion = indexedDB.open("demoFotos", 1);
    peticion.onupgradeneeded = () => peticion.result.createObjectStore("archivos");
    peticion.onsuccess = () => resolver(peticion.result);
    peticion.onerror = () => rechazar(peticion.error);
  });

async function operarDemo<T>(modo: IDBTransactionMode, accion: (almacen: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const base = await abrirDemo();
  return new Promise<T>((resolver, rechazar) => {
    const peticion = accion(base.transaction("archivos", modo).objectStore("archivos"));
    peticion.onsuccess = () => resolver(peticion.result);
    peticion.onerror = () => rechazar(peticion.error);
  }).finally(() => base.close());
}

const leerDemo = <T>(clave: string) => operarDemo<T | undefined>("readonly", (a) => a.get(clave));
const escribirDemo = (clave: string, valor: unknown) => operarDemo("readwrite", (a) => a.put(valor, clave));
const borrarDemo = (clave: string) => operarDemo("readwrite", (a) => a.delete(clave));

export async function urlRanuraDemo(archivo: string): Promise<string | null> {
  const blob = await leerDemo<Blob>(archivo);
  return blob ? URL.createObjectURL(blob) : null;
}

export const vistaRanura = async (ranura: Ranura) =>
  sitio.demo ? ((await urlRanuraDemo(ranura.archivo)) ?? ranura.src) : `${ranura.src}?v=${Date.now()}`;

const comprimir = (lienzo: HTMLCanvasElement, calidad: number) =>
  new Promise<Blob>((resolver, rechazar) =>
    lienzo.toBlob((b) => (b ? resolver(b) : rechazar(new Error("foto"))), "image/jpeg", calidad),
  );

function reducir(origen: CanvasImageSource, ancho: number, alto: number, ladoMaximo: number) {
  const escala = Math.min(1, ladoMaximo / Math.max(ancho, alto));
  const lienzo = document.createElement("canvas");
  lienzo.width = Math.round(ancho * escala);
  lienzo.height = Math.round(alto * escala);
  const contexto = lienzo.getContext("2d");
  if (!contexto) throw new Error("foto");
  contexto.imageSmoothingQuality = "high";
  contexto.drawImage(origen, 0, 0, lienzo.width, lienzo.height);
  return lienzo;
}

/* Reduce la foto en el propio navegador: baja la calidad y, si no basta, el tamaño, hasta que pese poco. */
export async function prepararFoto(archivo: File): Promise<FotoPreparada> {
  if (archivo.size > MAX_ENTRADA_MB * BYTES_MB) throw new Error("enorme");
  const imagen = await createImageBitmap(archivo).catch(() => {
    throw new Error("formato");
  });
  try {
    const escasa = Math.max(imagen.width, imagen.height) < LADO_MINIMO;
    for (const lado of LADOS) {
      const lienzo = reducir(imagen, imagen.width, imagen.height, lado);
      for (const calidad of CALIDADES) {
        const grande = await comprimir(lienzo, calidad);
        const ultimo = lado === LADOS[LADOS.length - 1] && calidad === CALIDADES[CALIDADES.length - 1];
        if (grande.size <= PESO_FINAL_MB * BYTES_MB || ultimo) {
          const pequena = await comprimir(reducir(lienzo, lienzo.width, lienzo.height, 900), 0.78);
          return { grande, pequena, ancho: lienzo.width, alto: lienzo.height, pesoOriginal: archivo.size, escasa };
        }
      }
    }
    throw new Error("formato");
  } finally {
    imagen.close();
  }
}

async function subirArchivo(archivo: string, datos: Blob) {
  const respuesta = await fetch(`/api/fotos/${archivo}`, { method: "PUT", headers: { "Content-Type": "image/jpeg" }, body: datos });
  if (!respuesta.ok) throw new Error(String(respuesta.status));
}

/* Sustituye una foto de sitio fijo y devuelve la dirección con la que previsualizarla. */
export async function cambiarRanura(ranura: Ranura, foto: FotoPreparada): Promise<string> {
  if (sitio.demo) {
    await escribirDemo(ranura.archivo, foto.grande);
    return URL.createObjectURL(foto.grande);
  }
  await subirArchivo(ranura.archivo, foto.grande);
  await subirArchivo(ranura.archivo.replace(".jpg", "-900.jpg"), foto.pequena);
  return `${ranura.src}?v=${Date.now()}`;
}

const numeroRanura = (archivo: string) => Number(archivo.match(/-(\d+)\.jpg$/)?.[1] ?? 0);

/*
 * Cambia el orden de las fotos de portada: la primera de la lista pasa a portada-1, y así sucesivamente.
 * Devuelve cómo previsualizar cada hueco después del cambio.
 */
export async function ordenarRanuras(orden: Ranura[]): Promise<Record<string, string>> {
  const destinos = [...orden].sort((a, b) => numeroRanura(a.archivo) - numeroRanura(b.archivo));
  if (sitio.demo) {
    const contenidos = await Promise.all(
      orden.map(async (r) => (await leerDemo<Blob>(r.archivo)) ?? (await (await fetch(r.src)).blob())),
    );
    await Promise.all(destinos.map((d, i) => escribirDemo(d.archivo, contenidos[i])));
    return Object.fromEntries(destinos.map((d, i) => [d.archivo, URL.createObjectURL(contenidos[i])]));
  }
  const respuesta = await fetch("/api/fotos/ordenar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ archivos: orden.map((r) => r.archivo) }),
  });
  if (!respuesta.ok) throw new Error(String(respuesta.status));
  return Object.fromEntries(destinos.map((d) => [d.archivo, `${d.src}?v=${Date.now()}`]));
}

export async function subirFotoGaleria(foto: FotoPreparada, categoria: string): Promise<FotoGaleria> {
  const id = `g-${crypto.randomUUID()}`;
  const datos = { ancho: foto.ancho, alto: foto.alto, categoria, alt: `Fotografía de ${categoria.toLowerCase()}` };
  if (sitio.demo) {
    await escribirDemo(`${id}.jpg`, foto.grande);
    return { ...datos, src: URL.createObjectURL(foto.grande), archivo: `${id}.jpg` };
  }
  await subirArchivo(`${id}.jpg`, foto.grande);
  await subirArchivo(`${id}-900.jpg`, foto.pequena);
  return { ...datos, src: `/web/${id}.jpg` };
}

/* null significa que nunca se ha tocado: se usa la galería publicada con la web. */
export async function leerGaleria(): Promise<FotoGaleria[] | null> {
  if (sitio.demo) {
    const guardadas = await leerDemo<FotoGaleria[]>("galeria");
    if (!guardadas) return null;
    return Promise.all(
      guardadas.map(async (foto) => {
        if (!foto.archivo) return foto;
        const blob = await leerDemo<Blob>(foto.archivo);
        return blob ? { ...foto, src: URL.createObjectURL(blob) } : foto;
      }),
    );
  }
  const respuesta = await fetch("/api/galeria", { cache: "no-store" });
  if (!respuesta.ok) throw new Error(String(respuesta.status));
  return ((await respuesta.json()) as { fotos: FotoGaleria[] | null }).fotos;
}

export async function guardarGaleria(fotos: FotoGaleria[]): Promise<void> {
  if (sitio.demo) {
    const anteriores = (await leerDemo<FotoGaleria[]>("galeria")) ?? [];
    const siguen = new Set(fotos.map((f) => f.archivo));
    await escribirDemo("galeria", fotos.map((f) => (f.archivo ? { ...f, src: `/web/${f.archivo}` } : f)));
    await Promise.all(anteriores.filter((f) => f.archivo && !siguen.has(f.archivo)).map((f) => borrarDemo(f.archivo!)));
    return;
  }
  const respuesta = await fetch("/api/galeria", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fotos }),
  });
  if (!respuesta.ok) throw new Error(String(respuesta.status));
}
