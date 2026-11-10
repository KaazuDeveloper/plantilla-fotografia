import type { MetadataRoute } from "next";
import { sitio } from "@/contenido/sitio";

export const dynamic = "force-static";

/* La demo no bloquea el rastreo: sus páginas llevan noindex y Google tiene que poder leerlo. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: sitio.demo ? undefined : `${sitio.url}/sitemap.xml`,
  };
}
