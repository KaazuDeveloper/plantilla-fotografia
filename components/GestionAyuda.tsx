"use client";

import { useEffect, useState } from "react";
import { galeria } from "@/contenido/galeria";
import { sitio } from "@/contenido/sitio";
import { MAX_ENTRADA_MB, MAX_FOTOS, PESO_FINAL_MB, leerGaleria } from "@/lib/fotos";
import { LIMITE_ESCRITURAS, LIMITE_PETICIONES, horaRenovacion, leerUso, type Uso } from "@/lib/uso";

const REFRESCO = 60_000;
const numero = (n: number) => n.toLocaleString("es-ES", { useGrouping: "always" });

const LIMITES = [
  { que: "Fotos en la galería", cuanto: `${MAX_FOTOS}`, nota: "Para añadir más, elimina antes alguna." },
  { que: "Tamaño de cada foto al elegirla", cuanto: `${MAX_ENTRADA_MB} MB`, nota: "Si pesa más, expórtala en menor tamaño desde tu programa de edición." },
  { que: "Tamaño con el que se guarda", cuanto: `2400 px y ${PESO_FINAL_MB.toLocaleString("es-ES")} MB`, nota: "Se reduce sola. No tienes que preparar nada." },
  { que: "Fotos subidas al día", cuanto: "Unas 400", nota: "Si se supera, podrás seguir al día siguiente." },
  { que: "Visitas al día", cuanto: "Unas 3.000", nota: "Si se superan, el calendario y las fotos subidas fallan hasta la noche. El resto de la web sigue funcionando." },
  { que: "Intentos de contraseña", cuanto: "10", nota: "Después, el acceso se bloquea 15 minutos." },
  { que: "Duración de la sesión", cuanto: "12 horas", nota: "Luego hay que volver a entrar. Tus cambios sin guardar no se pierden." },
];

const titulo = "text-[24px] font-semibold tracking-[-0.025em]";
const parrafo = "mt-2 text-[17px] leading-[1.45] text-ink-2";

function Medidor({ etiqueta, valor, maximo, nota }: { etiqueta: string; valor: number; maximo: number; nota: string }) {
  const parte = Math.min(100, (valor / maximo) * 100);
  const estado = parte >= 100 ? "Límite alcanzado. " : parte >= 80 ? "Cerca del límite. " : "";
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4 text-[17px]">
        <span>{etiqueta}</span>
        <span className="shrink-0 tabular-nums text-ink-2">
          <span className="font-medium text-ink">{numero(valor)}</span> de {numero(maximo)}
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-mist">
        <div className={`h-full rounded-full ${parte >= 80 ? "bg-accent" : "bg-ink"}`} style={{ width: `${Math.max(valor > 0 ? 1 : 0, parte)}%` }} />
      </div>
      <p className="mt-1.5 text-[15px] leading-snug text-ink-2">{estado}{nota}</p>
    </div>
  );
}

export function GestionAyuda({ activa, alCaducar }: { activa: boolean; alCaducar: () => void }) {
  const [uso, setUso] = useState<Uso | null>(null);
  const [fotos, setFotos] = useState(galeria.length);
  const [hora, setHora] = useState("");
  const [fallo, setFallo] = useState(false);

  useEffect(() => {
    if (!activa) return;
    let vigente = true;
    const refrescar = () =>
      leerUso()
        .then((nuevo) => {
          if (!vigente) return;
          setUso(nuevo);
          setFallo(false);
          setHora(new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }));
        })
        .catch((e: Error) => {
          if (e.message === "401") alCaducar();
          else if (vigente) setFallo(true);
        });
    refrescar();
    leerGaleria()
      .then((lista) => {
        if (vigente && lista) setFotos(lista.length);
      })
      .catch(() => undefined);
    const temporizador = window.setInterval(refrescar, REFRESCO);
    return () => {
      vigente = false;
      window.clearInterval(temporizador);
    };
  }, [activa, alCaducar]);

  return (
    <div className="max-w-[760px] space-y-12">
      <section>
        <h2 className={titulo}>Uso de hoy</h2>
        {sitio.demo && <p className="mt-3 rounded-lg bg-mist p-4 text-[15px]">Datos de ejemplo. En la web real verás tu uso.</p>}
        {fallo && <p role="alert" className={parrafo}>No se ha podido consultar el uso. Inténtalo de nuevo en un momento.</p>}
        {!fallo && !uso && <p className={parrafo}>Cargando…</p>}
        {uso && (
          <div className="mt-5 space-y-6">
            <Medidor etiqueta="Fotos en la galería" valor={fotos} maximo={MAX_FOTOS} nota="Este límite no se renueva: para añadir más, elimina alguna." />
            <Medidor etiqueta="Subidas y cambios" valor={uso.escrituras} maximo={LIMITE_ESCRITURAS} nota="Cada foto subida cuenta 2, y cada vez que guardas, 1." />
            <Medidor etiqueta="Actividad de la web" valor={uso.peticiones} maximo={LIMITE_PETICIONES} nota="Cada visita gasta entre 1 y unas 30, según las fotos que vea." />
            <p className="text-[15px] text-ink-2">
              Se renueva cada noche a las {horaRenovacion()}.{hora && ` Actualizado a las ${hora}.`}
            </p>
          </div>
        )}
      </section>

      <section>
        <h2 className={titulo}>Fechas</h2>
        <p className={parrafo}>
          Pulsa un día una vez para marcarlo libre, otra vez para marcarlo ocupado y otra más para quitarlo. Cuando termines, pulsa
          Guardar cambios. La web se actualiza en menos de un minuto.
        </p>
        <p className={parrafo}>
          Para marcar muchos a la vez, elige los días de la semana y durante cuánto tiempo, y pulsa Libres, Ocupados o Quitar. Empieza a
          contar desde el mes que estés viendo, y al marcar días libres no se tocan los que ya estén ocupados.
        </p>
      </section>

      <section>
        <h2 className={titulo}>Fotos</h2>
        <p className={parrafo}>
          Elige las fotos tal como las tengas, en JPG, PNG o desde la galería del móvil. Antes de subirlas se reducen solas para que la
          web cargue rápido, y te decimos cuánto han bajado. Las fotos en RAW no se pueden subir: expórtalas antes a JPG.
        </p>
        <p className={parrafo}>
          Para cambiar el orden de la galería o de la portada, arrastra cada foto desde el círculo de su esquina. Después de ordenar o
          eliminar fotos, pulsa Guardar cambios. Se verá en la web en unos minutos.
        </p>
      </section>

      <section>
        <h2 className={titulo}>Estadísticas</h2>
        <p className={parrafo}>
          Cuentan visitas, no personas, y no guardan datos de nadie. Tus propias visitas no se cuentan mientras tengas la sesión abierta.
        </p>
      </section>

      <section>
        <h2 className={titulo}>Límites</h2>
        <p className={parrafo}>La web usa servicios gratuitos. Para una web como esta, lo normal es no llegar a ninguno.</p>
        <dl className="mt-5 border-t border-line">
          {LIMITES.map((l) => (
            <div key={l.que} className="grid gap-1 border-b border-line py-4 sm:grid-cols-[1fr_auto] sm:gap-x-8">
              <dt className="text-[17px]">{l.que}</dt>
              <dd className="text-[17px] font-medium tabular-nums sm:text-right">{l.cuanto}</dd>
              <dd className="text-[15px] leading-snug text-ink-2 sm:col-span-2">{l.nota}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <h2 className={titulo}>Si algo no funciona</h2>
        <ul className="mt-2 space-y-2 text-[17px] leading-[1.45] text-ink-2">
          <li>Si un cambio no aparece, espera unos minutos y recarga la página.</li>
          <li>Si te pide entrar otra vez, escribe la contraseña: lo que no habías guardado sigue ahí.</li>
          <li>Si una foto no se sube, prueba a exportarla en JPG.</li>
          <li>
            Si sigue sin ir, <a href={sitio.credito.url} target="_blank" rel="noreferrer" className="text-accent hover:underline">contacta con quien hizo tu web</a>.
          </li>
        </ul>
      </section>
    </div>
  );
}
