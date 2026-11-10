import { sitio } from "@/contenido/sitio";

export function Preguntas() {
  return (
    <section id="preguntas" className="mx-auto max-w-[900px] px-5 py-20 md:py-32">
      <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-semibold leading-none tracking-[-0.04em]">Preguntas</h2>
      <div className="mt-10 border-b border-line md:mt-14">
        {sitio.preguntas.map((p) => (
          <details key={p.pregunta} className="group border-t border-line">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-[19px] font-medium tracking-[-0.018em] md:text-[21px] [&::-webkit-details-marker]:hidden">
              {p.pregunta}
              <span aria-hidden className="text-[26px] font-light leading-none text-ink-2 transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="pb-6 text-[17px] leading-[1.5] text-ink-2 md:text-[19px]">{p.respuesta}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
