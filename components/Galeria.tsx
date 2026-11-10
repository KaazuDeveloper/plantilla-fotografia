"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Foto } from "@/contenido/sitio";

const TODO = "Todo";

export function Galeria({ fotos }: { fotos: Foto[] }) {
  const categorias = useMemo(() => [TODO, ...new Set(fotos.map((f) => f.categoria))], [fotos]);
  const [categoria, setCategoria] = useState(TODO);
  const [abierta, setAbierta] = useState<number | null>(null);

  const visibles = useMemo(
    () => (categoria === TODO ? fotos : fotos.filter((f) => f.categoria === categoria)),
    [fotos, categoria],
  );

  return (
    <section id="trabajos" className="mx-auto max-w-[1440px] px-5 pb-24 pt-20 md:px-10 md:pb-36 md:pt-32">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-semibold leading-none tracking-[-0.04em]">Trabajos</h2>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-[17px]" role="group" aria-label="Filtrar por categoría">
          {categorias.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={c === categoria}
              onClick={() => setCategoria(c)}
              className={`border-b pb-0.5 transition-colors ${
                c === categoria ? "border-ink text-ink" : "border-transparent text-ink-2 hover:text-ink"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div key={categoria} className="aparecer mt-10 columns-2 gap-2 md:mt-14 md:gap-3 lg:columns-3">
        {visibles.map((foto, i) => (
          <button
            key={foto.src}
            type="button"
            onClick={() => setAbierta(i)}
            aria-label={`Ampliar: ${foto.alt}`}
            className="group mb-2 block w-full cursor-zoom-in overflow-hidden bg-mist md:mb-3"
          >
            <Image
              src={foto.src}
              alt={foto.alt}
              width={foto.ancho}
              height={foto.alto}
              loading="lazy"
              sizes="(min-width: 1024px) 33vw, 50vw"
              className="h-auto w-full transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
          </button>
        ))}
      </div>

      {abierta !== null && (
        <Visor fotos={visibles} inicial={abierta} alCerrar={() => setAbierta(null)} />
      )}
    </section>
  );
}

function Visor({ fotos, inicial, alCerrar }: { fotos: Foto[]; inicial: number; alCerrar: () => void }) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const inicioToque = useRef<number | null>(null);
  const [indice, setIndice] = useState(inicial);

  const mover = useCallback(
    (paso: number) => setIndice((i) => (i + paso + fotos.length) % fotos.length),
    [fotos.length],
  );

  useEffect(() => {
    if (!dialogo.current?.open) dialogo.current?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") mover(1);
      if (e.key === "ArrowLeft") mover(-1);
    };
    window.addEventListener("keydown", alPulsar);
    return () => window.removeEventListener("keydown", alPulsar);
  }, [mover]);

  const foto = fotos[indice];
  const siguiente = fotos[(indice + 1) % fotos.length];
  const boton = "absolute top-1/2 hidden h-14 w-14 -translate-y-1/2 items-center justify-center text-[28px] text-white/70 hover:text-white md:flex";

  return (
    <dialog
      ref={dialogo}
      onClose={alCerrar}
      aria-label={foto.alt}
      className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none bg-black text-white"
      onTouchStart={(e) => (inicioToque.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (inicioToque.current === null) return;
        const distancia = e.changedTouches[0].clientX - inicioToque.current;
        if (Math.abs(distancia) > 50) mover(distancia < 0 ? 1 : -1);
        inicioToque.current = null;
      }}
    >
      <div className="absolute inset-x-4 bottom-14 top-14 md:inset-x-20">
        <Image key={foto.src} src={foto.src} alt={foto.alt} fill quality={85} sizes="100vw" className="aparecer object-contain" />
        {/* Precarga la siguiente para que el paso sea inmediato. */}
        <Image src={siguiente.src} alt="" fill sizes="100vw" className="invisible" aria-hidden />
      </div>

      <div className="absolute inset-x-5 top-4 flex items-center justify-between text-[15px]">
        <span className="tabular-nums text-white/70">
          {indice + 1} / {fotos.length}
        </span>
        <button type="button" onClick={() => dialogo.current?.close()} className="py-1">
          Cerrar
        </button>
      </div>
      <p className="absolute inset-x-5 bottom-4 text-center text-[14px] text-white/70">{foto.categoria}</p>

      <button type="button" aria-label="Anterior" onClick={() => mover(-1)} className={`${boton} left-3`}>
        ←
      </button>
      <button type="button" aria-label="Siguiente" onClick={() => mover(1)} className={`${boton} right-3`}>
        →
      </button>
    </dialog>
  );
}
