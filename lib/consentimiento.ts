import { useSyncExternalStore } from "react";

export type Eleccion = "si" | "no" | null;

const CLAVE = "cookiesYouTube";
const EVENTO = "cambio-cookies";
/* Si el navegador no deja guardar, la elección dura hasta cerrar la página. */
let memoria: Eleccion | undefined;

function leer(): Eleccion {
  if (memoria !== undefined) return memoria;
  try {
    const valor = localStorage.getItem(CLAVE);
    return valor === "si" || valor === "no" ? valor : null;
  } catch {
    return null;
  }
}

export function elegirCookies(eleccion: Eleccion) {
  memoria = eleccion;
  try {
    if (eleccion) localStorage.setItem(CLAVE, eleccion);
    else localStorage.removeItem(CLAVE);
  } catch {
    /* Se queda solo en memoria. */
  }
  window.dispatchEvent(new Event(EVENTO));
}

function suscribir(aviso: () => void) {
  window.addEventListener(EVENTO, aviso);
  return () => window.removeEventListener(EVENTO, aviso);
}

/* Devuelve undefined hasta que la página arranca en el navegador. */
export const useCookies = () => useSyncExternalStore<Eleccion | undefined>(suscribir, leer, () => undefined);
