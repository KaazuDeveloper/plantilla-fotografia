# Plantilla web para fotógrafos

Web de una página para vender servicios de fotografía: portada a pantalla completa, galería por categorías con visor,
servicios y precios, sobre mí, opiniones, preguntas frecuentes y contacto por WhatsApp o correo.

Hecha con Next.js, TypeScript y Tailwind. No necesita servidor ni base de datos.

**Demo:** https://plantilla-fotografia.vercel.app

## Adaptarla a un cliente

Lo que hay que pedirle está en [PEDIR-AL-CLIENTE.md](PEDIR-AL-CLIENTE.md).

1. **Textos y datos.** Todo está en [`contenido/sitio.ts`](contenido/sitio.ts). Pon `demo: false` para que el formulario
   envíe de verdad y desaparezcan los avisos de contenido de ejemplo.
2. **Galería.** Copia las fotos en `fotos-cliente/<Categoría>/`. Cada carpeta es una categoría. Después:

   ```bash
   npm run fotos
   ```

   Las reduce a tamaño web y actualiza la galería sola.
3. **Portada, servicios y retrato.** Copia las fotos en `public/` y pon su ruta en `contenido/sitio.ts`,
   por ejemplo `src: "/portada/1.jpg"`.
4. **Color.** Cambia `colorAcento` en `contenido/sitio.ts`.
5. **Dominio.** Cambia `url` en `contenido/sitio.ts` por el dominio definitivo.

## Desarrollo

```bash
npm install
npm run dev
```

Las fotos de la demo son de [Unsplash](https://unsplash.com) y hay que sustituirlas por las del cliente.
