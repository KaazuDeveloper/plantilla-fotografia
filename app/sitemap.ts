import type { MetadataRoute } from "next";
import { sitio } from "@/contenido/sitio";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  if (sitio.demo) return [];
  return [
    { url: sitio.url, lastModified: new Date(), priority: 1 },
    { url: `${sitio.url}/aviso-legal`, lastModified: new Date(), priority: 0.2 },
  ];
}
