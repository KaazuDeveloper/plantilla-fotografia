import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import type { CSSProperties } from "react";
import { sitio } from "@/contenido/sitio";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(sitio.url),
  title: `${sitio.nombre} | ${sitio.lema}`,
  description: sitio.descripcion,
  openGraph: {
    title: sitio.nombre,
    description: sitio.descripcion,
    locale: "es_ES",
    type: "website",
    images: [{ url: sitio.portada[0].src }],
  },
  robots: sitio.demo ? { index: false, follow: false } : undefined,
};

export const viewport: Viewport = { themeColor: "#0c0c0d" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${inter.variable} antialiased`} style={{ "--accent": sitio.colorAcento } as CSSProperties}>
      <body>{children}</body>
    </html>
  );
}
