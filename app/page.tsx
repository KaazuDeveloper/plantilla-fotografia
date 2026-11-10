import { Contacto } from "@/components/Contacto";
import { Galeria } from "@/components/Galeria";
import { Nav } from "@/components/Nav";
import { Opiniones } from "@/components/Opiniones";
import { Pie } from "@/components/Pie";
import { Portada } from "@/components/Portada";
import { Preguntas } from "@/components/Preguntas";
import { Servicios } from "@/components/Servicios";
import { Sobre } from "@/components/Sobre";
import { galeria } from "@/contenido/galeria";
import { sitio } from "@/contenido/sitio";

const datosEstructurados = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: sitio.nombre,
  description: sitio.descripcion,
  url: sitio.url,
  email: sitio.contacto.email,
  telephone: sitio.contacto.telefonoVisible,
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
      <Nav />
      <main>
        <Portada />
        <Galeria fotos={galeria} />
        <Servicios />
        <Sobre />
        <Opiniones />
        <Preguntas />
        <Contacto />
      </main>
      <Pie />
    </>
  );
}
