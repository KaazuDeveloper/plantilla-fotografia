import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Pie } from "@/components/Pie";
import { sitio } from "@/contenido/sitio";

export const metadata: Metadata = { title: `Aviso legal y privacidad | ${sitio.nombre}` };

export default function AvisoLegal() {
  const { legal, contacto } = sitio;
  return (
    <>
      <Nav fija />
      <main className="mx-auto max-w-[760px] px-5 pb-24 pt-32 text-[17px] leading-[1.55] text-ink-2">
        <h1 className="text-[clamp(2.5rem,6vw,4rem)] font-semibold leading-none tracking-[-0.04em] text-ink">Aviso legal y privacidad</h1>
        {sitio.demo && <p className="mt-6 rounded-lg bg-mist p-4 text-[15px]">Web de ejemplo: estos datos son ficticios.</p>}

        <h2 className="mb-2 mt-10 text-[21px] font-semibold tracking-[-0.02em] text-ink">Titular</h2>
        <p>
          {legal.titular}, NIF {legal.nif}, con domicilio en {legal.direccion}. Contacto: {contacto.email}.
        </p>

        <h2 className="mb-2 mt-10 text-[21px] font-semibold tracking-[-0.02em] text-ink">Propiedad intelectual</h2>
        <p>Las fotografías y los textos de esta web pertenecen a su titular y no pueden reutilizarse sin su permiso.</p>

        <h2 className="mb-2 mt-10 text-[21px] font-semibold tracking-[-0.02em] text-ink">Datos personales</h2>
        <p>
          Esta web no guarda los datos del formulario: al enviarlo se abre tu WhatsApp o tu correo con el mensaje preparado. Los
          datos que envíes se usarán solo para responderte y preparar tu presupuesto. Puedes pedir su acceso, rectificación o
          supresión escribiendo a {contacto.email}.
        </p>

        <h2 className="mb-2 mt-10 text-[21px] font-semibold tracking-[-0.02em] text-ink">Estadísticas</h2>
        <p>
          Esta web cuenta las visitas de forma anónima y agregada: el número de visitas de cada día, el tipo de sitio desde el que
          se llega y si es un móvil o un ordenador. No se guarda tu dirección IP ni nada que permita identificarte. La web está
          alojada en Cloudflare, que necesita tratar la dirección IP de forma técnica para poder servir la página.
        </p>

        <h2 id="cookies" className="mb-2 mt-10 text-[21px] font-semibold tracking-[-0.02em] text-ink">Cookies</h2>
        <p>
          Esta web no utiliza cookies de análisis ni de publicidad. La única cookie propia es técnica y solo se crea cuando la persona
          que administra la web inicia sesión.
          {sitio.videos.length > 0
            ? " Los vídeos están alojados en YouTube, que puede instalar sus propias cookies. Por eso solo se cargan si las aceptas y pulsas reproducir. Tu elección se guarda en tu navegador y puedes cambiarla cuando quieras en el enlace Cookies, al final de la página."
            : " Tampoco guarda información en el navegador de quienes la visitan."}
        </p>
      </main>
      <Pie />
    </>
  );
}
