import Image from "next/image";
import { sitio } from "@/contenido/sitio";

export function Sobre() {
  const { sobre } = sitio;
  return (
    <section id="sobre-mi" className="mx-auto grid max-w-[1440px] items-center gap-10 px-5 py-20 md:grid-cols-2 md:gap-20 md:px-10 md:py-32">
      <div className="relative aspect-[4/5] overflow-hidden md:aspect-[5/6]">
        <Image src={sobre.foto} alt={sobre.alt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
      </div>
      <div>
        <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-semibold leading-none tracking-[-0.04em]">{sobre.saludo}</h2>
        <div className="mt-7 space-y-4 text-[19px] leading-[1.45] text-ink-2 md:text-[21px]">
          {sobre.parrafos.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-line pt-6">
          {sobre.datos.map((d) => (
            <div key={d.texto}>
              <dt className="sr-only">{d.texto}</dt>
              <dd className="text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-none tracking-[-0.03em]">{d.valor}</dd>
              <dd className="mt-1.5 text-[14px] text-ink-2 md:text-[15px]">{d.texto}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
