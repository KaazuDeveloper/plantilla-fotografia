"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";

/*
 * Arrastrar para ordenar, con ratón o con el dedo. Se escucha en toda la ventana porque, al recolocar
 * un elemento, el navegador pierde el que se estaba arrastrando.
 */
export function useOrdenar(atributo: string, alMover: (origen: number, destino: number) => void) {
  const actual = useRef<number | null>(null);
  const limpiar = useRef<(() => void) | null>(null);
  const [arrastrando, setArrastrando] = useState<number | null>(null);

  useEffect(() => () => limpiar.current?.(), []);

  const empezar = (evento: PointerEvent<HTMLElement>, indice: number) => {
    evento.preventDefault();
    actual.current = indice;
    setArrastrando(indice);

    const mover = (e: globalThis.PointerEvent) => {
      const origen = actual.current;
      if (origen === null) return;
      /* Cerca de los bordes de la pantalla, la página se desplaza sola. */
      if (e.clientY < 90) window.scrollBy(0, -14);
      else if (e.clientY > window.innerHeight - 90) window.scrollBy(0, 14);
      const debajo = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>(`[${atributo}]`);
      const destino = debajo ? Number(debajo.getAttribute(atributo)) : origen;
      if (Number.isNaN(destino) || destino === origen) return;
      actual.current = destino;
      setArrastrando(destino);
      alMover(origen, destino);
    };
    const terminar = () => {
      actual.current = null;
      setArrastrando(null);
      window.removeEventListener("pointermove", mover);
      window.removeEventListener("pointerup", terminar);
      window.removeEventListener("pointercancel", terminar);
      limpiar.current = null;
    };
    window.addEventListener("pointermove", mover);
    window.addEventListener("pointerup", terminar);
    window.addEventListener("pointercancel", terminar);
    limpiar.current = terminar;
  };

  return { arrastrando, empezar };
}

export const recolocar = <T,>(lista: T[], origen: number, destino: number) => {
  const nueva = [...lista];
  const [movido] = nueva.splice(origen, 1);
  nueva.splice(destino, 0, movido);
  return nueva;
};

export function Asa({ alEmpezar }: { alEmpezar: (evento: PointerEvent<HTMLButtonElement>) => void }) {
  return (
    <button
      type="button"
      aria-label="Arrastrar para cambiar el orden"
      title="Arrastra para cambiar el orden"
      onPointerDown={alEmpezar}
      className="absolute left-2 top-2 flex size-10 cursor-grab touch-none select-none items-center justify-center rounded-full bg-white/90 text-ink shadow-[0_2px_8px_rgba(0,0,0,0.2)] active:cursor-grabbing"
    >
      <svg viewBox="0 0 20 20" className="size-5" fill="currentColor" aria-hidden>
        {[5, 10, 15].flatMap((y) => [7, 13].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.6" />))}
      </svg>
    </button>
  );
}
