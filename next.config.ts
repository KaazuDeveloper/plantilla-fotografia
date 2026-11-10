import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* La web es estática: se puede alojar gratis en cualquier sitio. */
  output: "export",
  images: { loader: "custom", loaderFile: "./lib/cargador-imagen.ts", qualities: [75, 85] },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
