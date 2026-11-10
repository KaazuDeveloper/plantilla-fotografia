import type { Metadata } from "next";
import { Gestion } from "@/components/Gestion";
import { Nav } from "@/components/Nav";
import { sitio } from "@/contenido/sitio";

export const metadata: Metadata = { title: `Acceso | ${sitio.nombre}`, robots: { index: false, follow: false } };

export default function Acceso() {
  return (
    <>
      <Nav fija />
      <main className="mx-auto min-h-svh max-w-[920px] px-5 pb-24 pt-32">
        <Gestion />
      </main>
    </>
  );
}
