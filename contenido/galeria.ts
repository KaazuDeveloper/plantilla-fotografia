import generada from "./galeria.generada.json";
import { galeriaEjemplo } from "./galeria-ejemplo";
import type { Foto } from "./sitio";

export const galeria: Foto[] = (generada as Foto[]).length > 0 ? (generada as Foto[]) : galeriaEjemplo;
