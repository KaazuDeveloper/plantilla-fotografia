"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { sitio } from "@/contenido/sitio";

const enlaces = [
  { href: "/#trabajos", texto: "Trabajos" },
  { href: "/#servicios", texto: "Servicios" },
  { href: "/#sobre-mi", texto: "Sobre mí" },
  { href: "/#preguntas", texto: "Preguntas" },
];

export function Nav({ fija = false }: { fija?: boolean }) {
  const [sobreFoto, setSobreFoto] = useState(!fija);
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    const portada = document.getElementById("inicio");
    if (!portada) return;
    const observador = new IntersectionObserver(([e]) => setSobreFoto(e.isIntersecting), {
      rootMargin: "-72px 0px 0px 0px",
    });
    observador.observe(portada);
    return () => observador.disconnect();
  }, []);

  const claro = sobreFoto && !abierto;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
        claro ? "text-white" : "border-b border-line bg-paper/95 text-ink backdrop-blur"
      }`}
    >
      <div className="mx-auto flex h-[64px] max-w-[1440px] items-center justify-between px-5 md:px-10">
        <Link href="/#inicio" className="text-[17px] font-semibold tracking-[-0.02em]">
          {sitio.nombre}
        </Link>
        <nav className="hidden items-center gap-8 text-[15px] md:flex" aria-label="Principal">
          {enlaces.map((e) => (
            <Link key={e.href} href={e.href} className="opacity-80 transition-opacity hover:opacity-100">
              {e.texto}
            </Link>
          ))}
          <Link
            href="/#contacto"
            className={`rounded-full px-4 py-[7px] font-medium transition-colors ${
              claro ? "bg-white text-ink hover:bg-white/85" : "bg-ink text-white hover:bg-ink/80"
            }`}
          >
            Pedir presupuesto
          </Link>
        </nav>
        <button
          type="button"
          className="text-[15px] font-medium md:hidden"
          aria-expanded={abierto}
          onClick={() => setAbierto(!abierto)}
        >
          {abierto ? "Cerrar" : "Menú"}
        </button>
      </div>
      {abierto && (
        <nav className="border-t border-line bg-paper px-5 pb-6 pt-2 md:hidden" aria-label="Móvil">
          {[...enlaces, { href: "/#contacto", texto: "Pedir presupuesto" }].map((e) => (
            <Link
              key={e.href}
              href={e.href}
              onClick={() => setAbierto(false)}
              className="block py-2.5 text-[26px] font-semibold tracking-[-0.025em]"
            >
              {e.texto}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
