"use client";

import { useState } from "react";
import { ImagenRanura } from "./ImagenRanura";
import { sitio, type Video } from "@/contenido/sitio";
import { elegirCookies, useCookies } from "@/lib/consentimiento";

export function Videos() {
  if (sitio.videos.length === 0) return null;
  return (
    <section id="video" className="bg-night py-20 text-white md:py-32">
      <div className="mx-auto max-w-[1200px] px-5 md:px-10">
        <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-semibold leading-none tracking-[-0.04em]">Vídeo</h2>
        <div className="mt-10 space-y-12 md:mt-14">
          {sitio.videos.map((video, i) => (
            <Reproductor key={video.titulo} video={video} indice={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* YouTube no se carga hasta que se pulsa reproducir: antes no recibe ningún dato del visitante. */
function Reproductor({ video, indice }: { video: Video; indice: number }) {
  const [pulsado, setPulsado] = useState(false);
  const cookies = useCookies();
  const pideCookies = pulsado && cookies !== "si";
  const reproduciendo = pulsado && cookies === "si" && video.youtube;

  return (
    <figure>
      <div className="relative aspect-video overflow-hidden bg-black">
        {reproduciendo ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.youtube}?autoplay=1&rel=0`}
            title={video.titulo}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            className="absolute inset-0 size-full"
          />
        ) : pideCookies ? (
          <div className="absolute inset-0">
            <ImagenRanura archivo={`video-${indice + 1}.jpg`} src={video.portada} alt={video.alt} fill sizes="(min-width: 1200px) 1120px, 100vw" className="object-cover" />
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 px-5 text-center">
              <p className="max-w-[420px] text-[17px] leading-snug">Para ver el vídeo hay que aceptar las cookies de YouTube.</p>
              <button type="button" onClick={() => elegirCookies("si")} className="mt-4 rounded-full bg-white px-6 py-2.5 text-[16px] text-ink hover:bg-white/85">
                Aceptar y ver el vídeo
              </button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setPulsado(true)} aria-label={`Reproducir: ${video.titulo}`} className="group absolute inset-0">
            <ImagenRanura archivo={`video-${indice + 1}.jpg`} src={video.portada} alt={video.alt} fill sizes="(min-width: 1200px) 1120px, 100vw" className="object-cover" />
            <span className="absolute inset-0 bg-black/25 transition-colors group-hover:bg-black/10" />
            <span className="absolute left-1/2 top-1/2 flex size-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-ink">
              <svg viewBox="0 0 24 24" className="ml-1 size-8" fill="currentColor" aria-hidden><path d="M7 4.5v15l13-7.5z" /></svg>
            </span>
            {pulsado && cookies === "si" && (
              <span className="absolute inset-x-0 bottom-5 text-center text-[16px]">Aquí se verá tu vídeo de YouTube.</span>
            )}
          </button>
        )}
      </div>
      <figcaption className="mt-3 flex flex-wrap justify-between gap-x-6 gap-y-1 text-[15px] text-white/70">
        <span className="text-white">{video.titulo}</span>
        <span>Al reproducirlo se conecta con YouTube.</span>
      </figcaption>
    </figure>
  );
}
