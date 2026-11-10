import Link from "next/link";
import { sitio } from "@/contenido/sitio";

export function Pie() {
  return (
    <footer className="bg-night pb-8 text-[13px] text-white/50">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-2 border-t border-white/10 px-5 pt-6 md:flex-row md:justify-between md:px-10">
        <p>
          © {sitio.anio} {sitio.nombre}
          {sitio.demo && " · Web de ejemplo con contenido ficticio y fotos de Unsplash"}
        </p>
        <p className="flex gap-5">
          <Link href="/aviso-legal" className="hover:text-white">Aviso legal y privacidad</Link>
          <a href={sitio.credito.url} target="_blank" rel="noreferrer" className="hover:text-white">{sitio.credito.texto}</a>
        </p>
      </div>
    </footer>
  );
}
