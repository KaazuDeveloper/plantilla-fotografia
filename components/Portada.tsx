"use client";

import { useEffect, useState } from "react";
import { ImagenRanura } from "./ImagenRanura";
import { sitio } from "@/contenido/sitio";

const INTERVALO = 6500;

export function Portada() {
  const [actual, setActual] = useState(0);

  useEffect(() => {
    if (sitio.portada.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setActual((a) => (a + 1) % sitio.portada.length), INTERVALO);
    return () => clearInterval(id);
  }, []);

  return (
    <section id="inicio" className="relative h-svh min-h-[560px] overflow-hidden bg-night text-white">
      {sitio.portada.map((foto, i) => (
        <div
          key={foto.src}
          aria-hidden={i !== actual}
          className={`absolute inset-0 transition-opacity duration-[1400ms] ${i === actual ? "opacity-100" : "opacity-0"}`}
        >
          <ImagenRanura
            archivo={`portada-${i + 1}.jpg`}
            src={foto.src}
            alt={foto.alt}
            fill
            priority={i === 0}
            quality={85}
            sizes="100vw"
            className={`object-cover ${i === actual ? "acercar" : ""}`}
          />
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/5 to-black/65" />

      <div className="absolute inset-x-0 bottom-0 mx-auto flex max-w-[1440px] flex-col gap-6 px-5 pb-8 md:flex-row md:items-end md:justify-between md:px-10 md:pb-11">
        <h1 className="text-[clamp(3.25rem,6.6vw,6.75rem)] font-semibold leading-[0.95] tracking-[-0.045em]">
          {sitio.nombre}
        </h1>
        <div className="shrink-0 md:max-w-[320px] md:pb-3">
          <p className="text-[19px] leading-[1.3] tracking-[-0.018em]">{sitio.lema}</p>
          <a href="#trabajos" className="mt-3 inline-block border-b border-white/70 pb-0.5 text-[16px] hover:border-white">
            Ver trabajos
          </a>
        </div>
      </div>
    </section>
  );
}
