"use client";

export const EVENTO_SERVICIO = "elegir-servicio";
export const EVENTO_FECHA = "elegir-fecha";

export function BotonReservar({ servicio }: { servicio: string }) {
  return (
    <a
      href="#contacto"
      onClick={() => window.dispatchEvent(new CustomEvent(EVENTO_SERVICIO, { detail: servicio }))}
      className="mt-7 inline-block rounded-full bg-ink px-6 py-3 text-[17px] text-white transition-colors hover:bg-ink/80"
    >
      Preguntar por {servicio.toLowerCase()}
    </a>
  );
}
