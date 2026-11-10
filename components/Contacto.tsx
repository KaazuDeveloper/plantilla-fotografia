"use client";

import { useEffect, useState, type FormEvent } from "react";
import { sitio } from "@/contenido/sitio";
import { EVENTO_FECHA, EVENTO_SERVICIO } from "./BotonReservar";
import { registrarEvento } from "@/lib/estadisticas";

const campo =
  "h-12 w-full border-b border-white/30 bg-transparent text-[17px] text-white outline-none transition-colors placeholder:text-white/40 focus:border-white";

export function Contacto() {
  const [servicio, setServicio] = useState("");
  const [fecha, setFecha] = useState("");
  const [avisoDemo, setAvisoDemo] = useState<string | null>(null);

  useEffect(() => {
    const alElegir = (e: Event) => setServicio((e as CustomEvent<string>).detail);
    const alElegirFecha = (e: Event) => setFecha((e as CustomEvent<string>).detail);
    window.addEventListener(EVENTO_SERVICIO, alElegir);
    window.addEventListener(EVENTO_FECHA, alElegirFecha);
    return () => {
      window.removeEventListener(EVENTO_SERVICIO, alElegir);
      window.removeEventListener(EVENTO_FECHA, alElegirFecha);
    };
  }, []);

  const enviar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const canal = (evento.nativeEvent as SubmitEvent).submitter?.getAttribute("value");
    const datos = new FormData(evento.currentTarget);
    const linea = (nombre: string, valor: FormDataEntryValue | null) => (valor ? `${nombre}: ${valor}` : null);
    const mensaje = [
      `Hola, soy ${datos.get("nombre")}.`,
      linea("Me interesa", datos.get("servicio")),
      linea("Fecha", datos.get("fecha")),
      linea("Contacto", datos.get("contacto")),
      datos.get("mensaje"),
    ]
      .filter(Boolean)
      .join("\n");

    if (sitio.demo) {
      setAvisoDemo(canal === "correo" ? "tu correo" : "tu WhatsApp");
      return;
    }
    registrarEvento({ tipo: "contacto", canal: canal === "correo" ? "correo" : "whatsapp" });
    const texto = encodeURIComponent(mensaje);
    if (canal === "correo") {
      const asunto = encodeURIComponent(`Presupuesto: ${datos.get("servicio") || "sesión de fotos"}`);
      window.location.href = `mailto:${sitio.contacto.email}?subject=${asunto}&body=${texto}`;
    } else {
      window.open(`https://wa.me/${sitio.contacto.whatsapp}?text=${texto}`, "_blank", "noopener");
    }
  };

  const { contacto } = sitio;

  return (
    <section id="contacto" className="bg-night py-20 text-white md:py-32">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-5 md:grid-cols-2 md:gap-20 md:px-10">
        <div>
          <h2 className="text-[clamp(2.75rem,7vw,6rem)] font-semibold leading-[0.98] tracking-[-0.045em]">
            Cuéntame qué tienes en mente.
          </h2>
          <ul className="mt-9 space-y-1.5 text-[19px] text-white/75">
            <li>
              <a href={`mailto:${contacto.email}`} className="hover:text-white">{contacto.email}</a>
            </li>
            <li>{contacto.telefonoVisible}</li>
            <li>
              <a href={contacto.instagram} target="_blank" rel="noreferrer" className="hover:text-white">{contacto.instagramUsuario}</a>
            </li>
            <li>{contacto.zona}</li>
          </ul>
        </div>

        <form onSubmit={enviar} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <input name="nombre" required placeholder="Tu nombre" aria-label="Tu nombre" autoComplete="name" className={campo} />
            <input name="contacto" required placeholder="Teléfono o correo" aria-label="Teléfono o correo" className={campo} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <select
              name="servicio"
              aria-label="Servicio"
              value={servicio}
              onChange={(e) => setServicio(e.target.value)}
              className={`${campo} ${servicio ? "" : "text-white/40"}`}
            >
              <option value="" className="text-ink">¿Qué necesitas?</option>
              {(sitio.opcionesContacto.length ? sitio.opcionesContacto : sitio.servicios.map((s) => s.nombre)).map((opcion) => (
                <option key={opcion} value={opcion} className="text-ink">{opcion}</option>
              ))}
            </select>
            <input name="fecha" value={fecha} onChange={(e) => setFecha(e.target.value)} placeholder="Fecha aproximada" aria-label="Fecha aproximada" className={campo} />
          </div>
          <textarea
            name="mensaje"
            rows={4}
            placeholder="Cuéntame un poco más"
            aria-label="Mensaje"
            className="w-full resize-none border-b border-white/30 bg-transparent py-3 text-[17px] text-white outline-none transition-colors placeholder:text-white/40 focus:border-white"
          />
          <div className="flex flex-wrap gap-3 pt-3">
            <button type="submit" value="whatsapp" className="rounded-full bg-white px-6 py-3 text-[17px] font-medium text-ink transition-colors hover:bg-white/85">
              Enviar por WhatsApp
            </button>
            <button type="submit" value="correo" className="rounded-full border border-white/40 px-6 py-3 text-[17px] transition-colors hover:border-white">
              Enviar por correo
            </button>
          </div>
          {avisoDemo && (
            <p role="status" className="aparecer text-[15px] text-white/75">
              Esta web es un ejemplo y no se ha enviado nada. En la web real, el mensaje te llegaría directamente a {avisoDemo}.
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
