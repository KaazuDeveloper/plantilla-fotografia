# Plantilla web para fotógrafos

Web de una página para vender servicios de fotografía: portada a pantalla completa, galería por categorías con visor,
servicios y precios, fechas disponibles, sobre mí, opiniones, preguntas frecuentes y contacto por WhatsApp o correo.
El fotógrafo gestiona desde `/acceso` su calendario y sus fotos, y ve las estadísticas de visitas. El enlace está discreto en el pie.

Hecha con Next.js, TypeScript y Tailwind. Se exporta como web estática y la gestión usa Cloudflare Pages Functions, KV y D1,
todo en el plan gratuito. Las estadísticas no usan cookies ni guardan datos personales.

**Demo:** https://plantilla-fotografia.vercel.app

## Adaptarla a un cliente

Lo que hay que pedirle está en [PEDIR-AL-CLIENTE.md](PEDIR-AL-CLIENTE.md).

1. **Textos y datos.** Todo está en [`contenido/sitio.ts`](contenido/sitio.ts).
2. **Galería.** Copia las fotos en `fotos-cliente/<Categoría>/`. Cada carpeta es una categoría. Después:

   ```bash
   npm run fotos
   ```

   Las reduce a tamaño web y actualiza la galería sola.
3. **Portada, servicios y retrato.** Copia en `fotos-cliente/_web/` las fotos `portada-1.jpg`, `servicio-1.jpg`,
   `equipo-1.jpg`, etc. y vuelve a ejecutar `npm run fotos`. Después el cliente las puede cambiar desde `/acceso`.
4. **Color.** Cambia `colorAcento` en `contenido/sitio.ts`.
5. **Publicar.** Sigue [ALTA-CLIENTE.md](ALTA-CLIENTE.md). `npm run build` crea la demo y `npm run build:real` la web
   del cliente, con el formulario y la gestión de verdad.

## Desarrollo

```bash
npm install
npm run dev
```

Las fotos de la demo son de [Unsplash](https://unsplash.com) y hay que sustituirlas por las del cliente.
