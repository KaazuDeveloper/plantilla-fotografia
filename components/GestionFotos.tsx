"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { Asa, recolocar, useOrdenar } from "./Ordenar";
import { galeria } from "@/contenido/galeria";
import { sitio } from "@/contenido/sitio";
import {
  MAX_FOTOS,
  cambiarRanura,
  enMb,
  guardarGaleria,
  leerGaleria,
  motivoError,
  ordenarRanuras,
  prepararFoto,
  ranuras,
  subirFotoGaleria,
  vistaRanura,
  type FotoGaleria,
  type Ranura,
} from "@/lib/fotos";

const PLAZO = "Se verá en la web en unos minutos.";
const boton = "inline-block cursor-pointer rounded-full bg-ink px-5 py-2.5 text-[16px] text-white transition-colors hover:bg-ink/80";
const pequeno = "flex h-9 min-w-9 items-center justify-center rounded-full px-2 text-[15px] transition-colors hover:bg-mist disabled:opacity-25";

export function GestionFotos({ alCaducar }: { alCaducar: () => void }) {
  const [fotos, setFotos] = useState<FotoGaleria[]>(galeria);
  const [guardadas, setGuardadas] = useState<FotoGaleria[]>(galeria);
  const [categoria, setCategoria] = useState(galeria[0]?.categoria ?? "");
  const [vistas, setVistas] = useState<Record<string, string>>({});
  const [ocupado, setOcupado] = useState("");
  const [aviso, setAviso] = useState("");
  const [avisoRanuras, setAvisoRanuras] = useState("");
  const portadaInicial = useMemo(() => ranuras.filter((r) => r.archivo.startsWith("portada-")), []);
  const [portada, setPortada] = useState(portadaInicial);
  const portadaCambiada = portada.some((r, i) => r !== portadaInicial[i]);
  const galeriaOrden = useOrdenar("data-foto", (origen, destino) => setFotos((lista) => recolocar(lista, origen, destino)));
  const portadaOrden = useOrdenar("data-portada", (origen, destino) => setPortada((lista) => recolocar(lista, origen, destino)));

  const categorias = useMemo(() => [...new Set(fotos.map((f) => f.categoria))], [fotos]);
  const pendiente = fotos !== guardadas;

  useEffect(() => {
    leerGaleria()
      .then((lista) => {
        if (!lista) return;
        setFotos(lista);
        setGuardadas(lista);
      })
      .catch(() => setAviso("No se ha podido cargar la galería. Recarga la página."));
    Promise.all(ranuras.map(async (r) => [r.archivo, await vistaRanura(r)] as const))
      .then((pares) => setVistas(Object.fromEntries(pares)))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!pendiente && !portadaCambiada) return;
    const avisar = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", avisar);
    return () => window.removeEventListener("beforeunload", avisar);
  }, [pendiente, portadaCambiada]);

  const caducada = (e: unknown) => {
    if ((e as Error).message !== "401") return false;
    alCaducar();
    return true;
  };

  const guardar = async (lista: FotoGaleria[]) => {
    await guardarGaleria(lista);
    setGuardadas(lista);
    setFotos(lista);
    setAviso(sitio.demo ? "Guardado solo en este navegador, porque es una demo." : `Guardado. ${PLAZO}`);
  };

  const anadir = async (evento: ChangeEvent<HTMLInputElement>) => {
    const elegidas = [...(evento.target.files ?? [])];
    evento.target.value = "";
    const seleccion = elegidas.slice(0, MAX_FOTOS - fotos.length);
    const destino = categoria.trim();
    if (!destino) {
      setAviso("Escribe primero una categoría.");
      return;
    }
    if (seleccion.length === 0) {
      setAviso(`La galería ya tiene el máximo de ${MAX_FOTOS} fotos. Elimina alguna para añadir otras.`);
      return;
    }
    let lista = fotos;
    let pesoAntes = 0;
    let pesoDespues = 0;
    let subidas = 0;
    let escasas = 0;
    const fallos: string[] = [];
    setAviso("");
    try {
      for (const [i, archivo] of seleccion.entries()) {
        setOcupado(`Subiendo ${i + 1} de ${seleccion.length}…`);
        try {
          const preparada = await prepararFoto(archivo);
          const nueva = await subirFotoGaleria(preparada, destino);
          lista = [nueva, ...lista];
          setFotos(lista);
          subidas++;
          pesoAntes += preparada.pesoOriginal;
          pesoDespues += preparada.grande.size;
          if (preparada.escasa) escasas++;
        } catch (e) {
          if ((e as Error).message === "401") throw e;
          fallos.push(`${archivo.name}: ${motivoError(e)}`);
          if ((e as Error).message === "503") break;
        }
      }
      if (lista !== fotos) await guardar(lista);
      const partes: string[] = [];
      if (subidas) partes.push(`${subidas === 1 ? "1 foto subida" : `${subidas} fotos subidas`}, de ${enMb(pesoAntes)} a ${enMb(pesoDespues)}.`);
      if (escasas) partes.push(`${escasas === 1 ? "1 foto es pequeña y puede" : `${escasas} fotos son pequeñas y pueden`} verse borrosa${escasas === 1 ? "" : "s"}.`);
      if (elegidas.length > seleccion.length) partes.push(`No han cabido ${elegidas.length - seleccion.length}: el máximo son ${MAX_FOTOS} fotos.`);
      if (fallos.length) partes.push(`No se ha podido subir ${fallos.join("; ")}.`);
      if (subidas) partes.push(sitio.demo ? "Guardado solo en este navegador, porque es una demo." : PLAZO);
      setAviso(partes.join(" "));
    } catch (e) {
      if (!caducada(e)) setAviso(`No se han podido guardar las fotos: ${motivoError(e)}.`);
    } finally {
      setOcupado("");
    }
  };

  const cambiar = async (ranura: Ranura, evento: ChangeEvent<HTMLInputElement>) => {
    const archivo = evento.target.files?.[0];
    evento.target.value = "";
    if (!archivo) return;
    setOcupado("Subiendo…");
    setAvisoRanuras("");
    try {
      const preparada = await prepararFoto(archivo);
      const vista = await cambiarRanura(ranura, preparada);
      setVistas((v) => ({ ...v, [ranura.archivo]: vista }));
      const reduccion = `De ${enMb(preparada.pesoOriginal)} a ${enMb(preparada.grande.size)}.`;
      const escasa = preparada.escasa ? " Es pequeña y puede verse borrosa." : "";
      setAvisoRanuras(`Cambiada. ${reduccion}${escasa} ${sitio.demo ? "Solo en este navegador, porque es una demo." : PLAZO}`);
    } catch (e) {
      if (!caducada(e)) setAvisoRanuras(`No se ha podido cambiar: ${motivoError(e)}.`);
    } finally {
      setOcupado("");
    }
  };

  const mover = (indice: number, paso: number) => {
    const lista = [...fotos];
    [lista[indice], lista[indice + paso]] = [lista[indice + paso], lista[indice]];
    setAviso("");
    setFotos(lista);
  };

  const cambiarCategoria = (indice: number, nueva: string) => {
    setAviso("");
    setFotos(fotos.map((f, i) => (i === indice ? { ...f, categoria: nueva, alt: `Fotografía de ${nueva.toLowerCase()}` } : f)));
  };

  const hayCambios = pendiente || portadaCambiada;

  /* Un solo botón guarda todo lo pendiente: el orden de la portada y la galería. */
  const guardarCambios = async () => {
    setOcupado("Guardando…");
    setAviso("");
    try {
      if (portadaCambiada) {
        const nuevas = await ordenarRanuras(portada);
        setVistas((v) => ({ ...v, ...nuevas }));
        setPortada(portadaInicial);
      }
      if (pendiente) await guardar(fotos);
      else setAviso(sitio.demo ? "Guardado solo en este navegador, porque es una demo." : `Guardado. ${PLAZO}`);
    } catch (e) {
      if (!caducada(e)) setAviso(`No se ha podido guardar: ${motivoError(e)}.`);
    } finally {
      setOcupado("");
    }
  };

  const deshacer = () => {
    setFotos(guardadas);
    setPortada(portadaInicial);
    setAviso("Cambios deshechos.");
  };

  return (
    <div className="space-y-16">
      <section>
        <h2 className="text-[28px] font-semibold tracking-[-0.03em]">Fotos principales</h2>
        <p className="mt-2 max-w-[640px] text-[17px] text-ink-2">Pulsa Cambiar y elige otra foto. Se reduce sola al tamaño de la web. Las fotos de portada se pueden arrastrar para elegir en qué orden pasan.</p>
        <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-4">
          {[...portada, ...ranuras.filter((r) => !r.archivo.startsWith("portada-"))].map((r, i) => {
            const enPortada = i < portada.length;
            return (
            <div key={r.archivo} data-portada={enPortada ? i : undefined} className={enPortada && portadaOrden.arrastrando === i ? "opacity-70" : ""}>
              <div className={`relative aspect-[4/3] overflow-hidden bg-mist ${enPortada && portadaOrden.arrastrando === i ? "ring-2 ring-accent" : ""}`}>
                <Image src={vistas[r.archivo] ?? r.src} alt={`${r.grupo}: ${r.nombre}`} fill sizes="(min-width: 768px) 220px, 50vw" className="pointer-events-none object-cover" />
                {enPortada && portada.length > 1 && <Asa alEmpezar={(e) => portadaOrden.empezar(e, i)} />}
              </div>
              <p className="mt-2 text-[14px] text-ink-2">{r.grupo}</p>
              <p className="truncate text-[16px]">{enPortada ? `Foto ${i + 1}` : r.nombre}</p>
              <label className={`mt-0.5 inline-block cursor-pointer py-1 text-[16px] text-accent hover:underline ${ocupado || (enPortada && portadaCambiada) ? "pointer-events-none opacity-40" : ""}`}>
                Cambiar
                <input type="file" accept="image/*" className="sr-only" disabled={Boolean(ocupado) || (enPortada && portadaCambiada)} onChange={(e) => cambiar(r, e)} />
              </label>
            </div>
            );
          })}
        </div>
        {avisoRanuras && <p role="status" className="mt-4 text-[15px] text-ink-2">{avisoRanuras}</p>}
      </section>

      <section>
        <h2 className="text-[28px] font-semibold tracking-[-0.03em]">Galería</h2>
        <p className="mt-2 max-w-[640px] text-[17px] text-ink-2">
          {fotos.length} de {MAX_FOTOS} fotos. Para cambiar el orden, arrastra cada foto desde el círculo de su esquina. Las nuevas aparecen las primeras.
        </p>

        <div className="mt-6 flex flex-wrap items-end gap-3">
          <label className="block">
            <span className="mb-1.5 block text-[14px] font-medium">Categoría de las fotos nuevas</span>
            <input
              list="categorias-galeria"
              value={categoria}
              maxLength={40}
              onChange={(e) => setCategoria(e.target.value)}
              className="h-11 w-60 max-w-full rounded-xl border border-line px-3.5 text-[16px] outline-none focus:border-ink"
            />
            <datalist id="categorias-galeria">
              {categorias.map((c) => <option key={c} value={c} />)}
            </datalist>
          </label>
          <label className={`${boton} ${ocupado ? "pointer-events-none opacity-40" : ""}`}>
            Añadir fotos
            <input type="file" accept="image/*" multiple className="sr-only" disabled={Boolean(ocupado)} onChange={anadir} />
          </label>
          {ocupado && <p role="status" className="py-2.5 text-[16px] text-ink-2">{ocupado}</p>}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-4">
          {fotos.map((foto, i) => (
            <div key={foto.src} data-foto={i} className={galeriaOrden.arrastrando === i ? "opacity-70" : ""}>
              <div className={`relative aspect-square overflow-hidden bg-mist ${galeriaOrden.arrastrando === i ? "ring-2 ring-accent" : ""}`}>
                <Image src={foto.src} alt={foto.alt} fill sizes="(min-width: 768px) 220px, 50vw" className="pointer-events-none object-cover" />
                <Asa alEmpezar={(e) => galeriaOrden.empezar(e, i)} />
                <span className="pointer-events-none absolute right-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-[13px] tabular-nums text-white">{i + 1}</span>
              </div>
              <select
                aria-label="Categoría"
                value={foto.categoria}
                onChange={(e) => cambiarCategoria(i, e.target.value)}
                className="mt-2 h-9 w-full rounded-lg border border-line bg-white px-2 text-[15px]"
              >
                {[...new Set([foto.categoria, ...categorias])].map((c) => <option key={c}>{c}</option>)}
              </select>
              <div className="mt-1 flex items-center justify-between">
                <div className="flex">
                  <button type="button" aria-label="Mover antes" disabled={i === 0} onClick={() => mover(i, -1)} className={pequeno}>←</button>
                  <button type="button" aria-label="Mover después" disabled={i === fotos.length - 1} onClick={() => mover(i, 1)} className={pequeno}>→</button>
                </div>
                <button type="button" onClick={() => { setAviso(""); setFotos(fotos.filter((_, j) => j !== i)); }} className={`${pequeno} text-[#c0271d]`}>
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>

      </section>

      <div className="sticky bottom-0 -mt-8 border-t border-line bg-white/90 py-4 backdrop-blur">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <button
            type="button"
            disabled={!hayCambios || Boolean(ocupado)}
            onClick={guardarCambios}
            className="rounded-full bg-ink px-6 py-3 text-[17px] text-white transition-colors hover:bg-ink/80 disabled:bg-line disabled:text-ink-2"
          >
            {ocupado === "Guardando…" ? "Guardando…" : hayCambios ? "Guardar cambios" : "Sin cambios"}
          </button>
          {hayCambios && !ocupado && (
            <button type="button" onClick={deshacer} className="text-[15px] text-ink-2 hover:text-ink">Deshacer</button>
          )}
          {aviso && <p role="status" className="text-[15px] leading-snug text-ink-2">{aviso}</p>}
        </div>
      </div>
    </div>
  );
}
