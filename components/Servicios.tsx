import { sitio } from "@/contenido/sitio";
import { BotonReservar } from "./BotonReservar";
import { ImagenRanura } from "./ImagenRanura";

export function Servicios() {
  if (sitio.servicios.length === 0) return null;
  return (
    <section id="servicios" className="bg-mist py-20 md:py-32">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-semibold leading-none tracking-[-0.04em]">Servicios</h2>
        <div className="mt-12 space-y-16 md:mt-20 md:space-y-28">
          {sitio.servicios.map((s, i) => (
            <article key={s.nombre} className="grid items-center gap-7 md:grid-cols-12 md:gap-16">
              <div className={`relative aspect-[4/3] overflow-hidden md:col-span-7 ${i % 2 ? "md:order-2" : ""}`}>
                <ImagenRanura archivo={`servicio-${i + 1}.jpg`} src={s.foto} alt={s.alt} fill sizes="(min-width: 768px) 58vw, 100vw" className="object-cover" />
              </div>
              <div className="md:col-span-5">
                <h3 className="text-[clamp(2rem,3.6vw,3.25rem)] font-semibold leading-[1.05] tracking-[-0.035em]">{s.nombre}</h3>
                <p className="mt-2 text-[19px] text-accent">{s.precio}</p>
                <p className="mt-5 text-[19px] leading-[1.4] text-ink-2">{s.texto}</p>
                <ul className="mt-6 border-t border-line">
                  {s.incluye.map((linea) => (
                    <li key={linea} className="border-b border-line py-2.5 text-[17px]">
                      {linea}
                    </li>
                  ))}
                </ul>
                <BotonReservar servicio={s.nombre} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
