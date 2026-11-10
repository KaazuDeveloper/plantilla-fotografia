import type { Metadata } from "next";
import { Contacto } from "@/components/Contacto";
import { Contador } from "@/components/Contador";
import { Disponibilidad } from "@/components/Disponibilidad";
import { Galeria } from "@/components/Galeria";
import { Nav } from "@/components/Nav";
import { Opiniones } from "@/components/Opiniones";
import { Pie } from "@/components/Pie";
import { Portada } from "@/components/Portada";
import { Preguntas } from "@/components/Preguntas";
import { Servicios } from "@/components/Servicios";
import { Sobre } from "@/components/Sobre";
import { Videos } from "@/components/Videos";
import { galeria } from "@/contenido/galeria";
import { sitio } from "@/contenido/sitio";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const datosEstructurados = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: sitio.nombre,
  description: sitio.descripcion,
  url: sitio.url,
  email: sitio.contacto.email,
  telephone: sitio.contacto.telefonoVisible || undefined,
  image: new URL(sitio.portada[0].src, sitio.url).href,
  sameAs: sitio.contacto.instagram ? [sitio.contacto.instagram] : undefined,
  areaServed: sitio.contacto.zona,
};

export default function Inicio() {
  return (
    <>
      {!sitio.demo && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(datosEstructurados) }}
        />
      )}
      <Contador />
      <Nav />
      <main>
        <Portada />
        <Galeria fotos={galeria} />
        <Videos />
        <Servicios />
        <Disponibilidad />
        <Sobre />
        <Opiniones />
        <Preguntas />
        <Contacto />
      </main>
      <Pie />
    </>
  );
}
