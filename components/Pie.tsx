import Link from "next/link";
import { AvisoCookies, EnlaceCookies } from "./AvisoCookies";
import { sitio } from "@/contenido/sitio";

export function Pie() {
  return (
    <footer className="bg-night pb-8 text-[13px] text-white/50">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-2 border-t border-white/10 px-5 pt-6 md:flex-row md:justify-between md:px-10">
        <p>
          © {sitio.anio} {sitio.nombre}
          {sitio.demo && " · Web de ejemplo con contenido ficticio y fotos de Unsplash"}
        </p>
        <p className="flex flex-wrap gap-x-5 gap-y-1">
          <Link href="/aviso-legal" className="hover:text-white">Aviso legal y privacidad</Link>
          <EnlaceCookies />
          <Link href="/acceso" className="hover:text-white">Acceso</Link>
          <a href={sitio.credito.url} target="_blank" rel="noreferrer" className="hover:text-white">{sitio.credito.texto}</a>
        </p>
      </div>
      <AvisoCookies />
    </footer>
  );
}
