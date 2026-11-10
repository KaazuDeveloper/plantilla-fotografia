"use client";

import Link from "next/link";
import { sitio } from "@/contenido/sitio";
import { elegirCookies, useCookies } from "@/lib/consentimiento";

const boton = "flex-1 rounded-full bg-ink py-2.5 text-[16px] text-white transition-colors hover:bg-ink/80";

/* Solo tiene sentido si hay vídeos de YouTube: el resto de la web no usa cookies. */
export function AvisoCookies() {
  const eleccion = useCookies();
  if (sitio.videos.length === 0 || eleccion !== null) return null;

  return (
    <div role="dialog" aria-label="Aviso de cookies" className="fixed inset-x-3 bottom-3 z-50 rounded-2xl border border-line bg-white p-5 text-ink shadow-[0_12px_40px_rgba(0,0,0,0.22)] md:bottom-6 md:left-6 md:right-auto md:w-[420px]">
      <p className="text-[17px] font-medium">¿Aceptas las cookies de YouTube?</p>
      <p className="mt-1.5 text-[15px] leading-snug text-ink-2">
        Esta web funciona sin cookies. Solo el vídeo de YouTube puede instalarlas, si lo reproduces.{" "}
        <Link href="/aviso-legal#cookies" className="text-accent hover:underline">Más información</Link>
      </p>
      <div className="mt-4 flex gap-2">
        <button type="button" onClick={() => elegirCookies("no")} className={boton}>Rechazar</button>
        <button type="button" onClick={() => elegirCookies("si")} className={boton}>Aceptar</button>
      </div>
    </div>
  );
}

/* Permite cambiar de opinión en cualquier momento. */
export function EnlaceCookies() {
  if (sitio.videos.length === 0) return null;
  return (
    <button type="button" onClick={() => elegirCookies(null)} className="hover:text-white">Cookies</button>
  );
}
