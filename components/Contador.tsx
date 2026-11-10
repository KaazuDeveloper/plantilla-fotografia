"use client";

import { useEffect } from "react";
import { registrarEvento } from "@/lib/estadisticas";

const hostDe = (direccion: string) => {
  try {
    return new URL(direccion).host;
  } catch {
    return "";
  }
};

/* Cuenta una visita al llegar a la web. Recargar o volver atrás no suma. */
export function Contador() {
  useEffect(() => {
    const navegacion = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    const procedencia = hostDe(document.referrer);
    if (navegacion?.type !== "navigate" || procedencia === location.host) return;
    registrarEvento({ tipo: "visita", origen: procedencia });
  }, []);

  return null;
}
