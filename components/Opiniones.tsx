import { sitio } from "@/contenido/sitio";

export function Opiniones() {
  if (sitio.opiniones.length === 0) return null;
  return (
    <section className="bg-mist py-20 md:py-28">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-5 md:grid-cols-3 md:gap-10 md:px-10">
        {sitio.opiniones.map((o) => (
          <figure key={o.autor}>
            <blockquote className="text-[clamp(1.5rem,2.3vw,2rem)] font-semibold leading-[1.18] tracking-[-0.025em]">
              “{o.texto}”
            </blockquote>
            <figcaption className="mt-4 text-[16px] text-ink-2">
              {o.autor}
              {sitio.demo && " · opinión de ejemplo"}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
