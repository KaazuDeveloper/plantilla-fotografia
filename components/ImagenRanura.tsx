"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";
import { sitio } from "@/contenido/sitio";
import { urlRanuraDemo } from "@/lib/fotos";

/* En la web real la foto se sirve siempre desde la misma dirección; en la demo hay que buscarla en el navegador. */
export function ImagenRanura({ archivo, src, alt, ...resto }: ImageProps & { archivo: string }) {
  const [propia, setPropia] = useState<string | null>(null);

  useEffect(() => {
    if (sitio.demo) urlRanuraDemo(archivo).then(setPropia).catch(() => undefined);
  }, [archivo]);

  return <Image src={propia ?? src} alt={alt} {...resto} />;
}
