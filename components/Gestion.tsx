"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { GestionAyuda } from "./GestionAyuda";
import { GestionEstadisticas } from "./GestionEstadisticas";
import { GestionFechas } from "./GestionFechas";
import { GestionFotos } from "./GestionFotos";
import { sitio } from "@/contenido/sitio";
import { entrar, haySesion, salir } from "@/lib/fechas";

type Estado = "cargando" | "fuera" | "dentro";
type Seccion = "fechas" | "fotos" | "estadisticas" | "ayuda";

const SECCIONES: { id: Seccion; texto: string }[] = [
  { id: "fechas", texto: "Fechas" },
  { id: "fotos", texto: "Fotos" },
  { id: "estadisticas", texto: "Estadísticas" },
  { id: "ayuda", texto: "Ayuda" },
];

export function Gestion() {
  const [estado, setEstado] = useState<Estado>("cargando");
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");
  const [seccion, setSeccion] = useState<Seccion>("fechas");
  /* Si la sesión caduca, los paneles siguen montados para no perder lo que no se ha guardado. */
  const [paneles, setPaneles] = useState(false);
  const [generacion, setGeneracion] = useState(0);

  const abrir = () => {
    setPaneles(true);
    setEstado("dentro");
  };

  useEffect(() => {
    haySesion().then((activa) => {
      if (activa) abrir();
      else setEstado("fuera");
    });
  }, []);

  const alCaducar = useCallback(() => {
    setEstado("fuera");
    setError("La sesión ha caducado. Vuelve a entrar; tus cambios siguen sin guardar.");
  }, []);

  const iniciar = async (evento: FormEvent) => {
    evento.preventDefault();
    setError("");
    const codigo = await entrar(clave).catch(() => 0);
    if (codigo === 200) {
      setClave("");
      abrir();
    } else {
      setError(
        codigo === 401 ? "Esa contraseña no es correcta." : codigo === 429 ? "Demasiados intentos. Prueba dentro de 15 minutos." : "No se ha podido entrar. Inténtalo de nuevo.",
      );
    }
  };

  const cerrar = async () => {
    await salir();
    setPaneles(false);
    setGeneracion((g) => g + 1);
    setSeccion("fechas");
    setEstado("fuera");
  };

  if (estado === "cargando") return <p className="text-ink-2">Cargando…</p>;

  return (
    <>
      {estado === "fuera" && (
        <form onSubmit={iniciar} className="max-w-[380px]">
          <h1 className="text-[clamp(2.5rem,6vw,4rem)] font-semibold leading-none tracking-[-0.04em]">Acceso</h1>
          <p className="mt-4 text-[17px] text-ink-2">
            {sitio.demo ? "Esto es una demo: entra sin contraseña y prueba a cambiar lo que quieras." : "Entra para gestionar tu web."}
          </p>
          {!sitio.demo && (
            <label className="mt-7 block">
              <span className="mb-1.5 block text-[14px] font-medium">Contraseña</span>
              <input
                type="password"
                required
                autoFocus
                autoComplete="current-password"
                value={clave}
                onChange={(e) => setClave(e.target.value)}
                className="h-12 w-full rounded-xl border border-line px-3.5 text-[17px] outline-none focus:border-ink"
              />
            </label>
          )}
          {error && <p role="alert" className="mt-3 text-[15px] text-[#c0271d]">{error}</p>}
          <button type="submit" className="mt-5 w-full rounded-full bg-ink py-3 text-[17px] text-white transition-colors hover:bg-ink/80">
            Entrar
          </button>
        </form>
      )}

      {paneles && (
        <div hidden={estado !== "dentro"} key={generacion}>
          <h1 className="text-[clamp(2.25rem,5vw,3.5rem)] font-semibold leading-none tracking-[-0.04em]">Gestión</h1>
          <div className="mb-10 mt-6 flex items-center justify-between gap-4 border-b border-line">
            <div className="flex gap-4 text-[17px] sm:gap-6" role="tablist">
              {SECCIONES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={s.id === seccion}
                  onClick={() => setSeccion(s.id)}
                  className={`-mb-px border-b pb-3 transition-colors ${s.id === seccion ? "border-ink text-ink" : "border-transparent text-ink-2 hover:text-ink"}`}
                >
                  {s.texto}
                </button>
              ))}
            </div>
            <button type="button" onClick={cerrar} className="hidden pb-3 text-[15px] text-ink-2 hover:text-ink sm:block">Cerrar sesión</button>
          </div>

          <div hidden={seccion !== "fechas"}><GestionFechas alCaducar={alCaducar} /></div>
          <div hidden={seccion !== "fotos"}><GestionFotos alCaducar={alCaducar} /></div>
          <div hidden={seccion !== "estadisticas"}><GestionEstadisticas activa={seccion === "estadisticas" && estado === "dentro"} alCaducar={alCaducar} /></div>
          <div hidden={seccion !== "ayuda"}><GestionAyuda activa={seccion === "ayuda" && estado === "dentro"} alCaducar={alCaducar} /></div>

          <button type="button" onClick={cerrar} className="mt-12 text-[15px] text-ink-2 hover:text-ink sm:hidden">Cerrar sesión</button>
        </div>
      )}
    </>
  );
}
