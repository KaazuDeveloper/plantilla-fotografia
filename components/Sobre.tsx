import { ImagenRanura } from "./ImagenRanura";
import { sitio } from "@/contenido/sitio";

const titular = "font-semibold leading-none tracking-[-0.04em]";

export function Sobre() {
  const { equipo } = sitio;
  const Nombre = equipo.titulo ? "h3" : "h2";
  return (
    <section id="sobre-mi" className="mx-auto max-w-[1440px] px-5 py-20 md:px-10 md:py-32">
      {equipo.titulo && <h2 className={`mb-12 max-w-[1000px] text-balance text-[clamp(2.5rem,6vw,5rem)] md:mb-20 ${titular}`}>{equipo.titulo}</h2>}
      <div className="space-y-16 md:space-y-28">
        {equipo.personas.map((persona, i) => (
          <article key={persona.saludo} className="grid items-center gap-10 md:grid-cols-2 md:gap-20">
            <div className={`relative aspect-[4/5] overflow-hidden md:aspect-[5/6] ${i % 2 ? "md:order-2" : ""}`}>
              <ImagenRanura archivo={`equipo-${i + 1}.jpg`} src={persona.foto} alt={persona.alt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover object-top" />
            </div>
            <div>
              <Nombre className={`text-[clamp(2.5rem,6vw,5rem)] ${titular}`}>{persona.saludo}</Nombre>
              <div className="mt-7 space-y-4 text-[19px] leading-[1.45] text-ink-2 md:text-[21px]">
                {persona.parrafos.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
              {persona.datos && (
                <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-line pt-6">
                  {persona.datos.map((d) => (
                    <div key={d.texto}>
                      <dt className="sr-only">{d.texto}</dt>
                      <dd className="text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-none tracking-[-0.03em]">{d.valor}</dd>
                      <dd className="mt-1.5 text-[14px] text-ink-2 md:text-[15px]">{d.texto}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
