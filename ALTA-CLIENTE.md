# Dar de alta a un cliente real

La demo vive en Vercel, pero **las webs de clientes no pueden ir en el plan gratuito de Vercel**, porque solo admite uso
personal y no comercial. Van en Cloudflare Pages, con su plan gratuito.

| Qué | Dónde se guarda | Límite gratuito |
| --- | --- | --- |
| Web | Cloudflare Pages | Archivos estáticos sin límite de visitas |
| Gestión, fotos subidas y contador | Pages Functions | 100.000 peticiones al día |
| Fechas y fotos | KV | 1 GB, 100.000 lecturas y 1.000 escrituras al día |
| Estadísticas | D1 | 5 GB, 5 millones de lecturas y 100.000 escrituras al día |

La galería admite 120 fotos, unos 150 MB. Si se supera el límite diario, lo dinámico deja de responder hasta las 00:00 UTC.

Los límites son por cuenta, así que lo mejor es **una cuenta de Cloudflare para cada cliente**, creada con su correo.

## Preparar la cuenta

1. Crea una cuenta gratuita en [cloudflare.com](https://dash.cloudflare.com/sign-up).
2. Conecta esta máquina con esa cuenta:

   ```bash
   npx wrangler login
   ```

## Publicar la web

Haz una copia del repositorio para cada cliente. En los comandos, sustituye `nombre-cliente` por su nombre, sin espacios.

1. **Contenido.** Rellena `contenido/sitio.ts` y prepara las fotos como explica el [README](README.md). Tiene que haber una
   foto por cada hueco fijo: `portada-1.jpg`, `portada-2.jpg`, `portada-3.jpg`, `servicio-1.jpg` y siguientes, `equipo-1.jpg` y siguientes, y `video-1.jpg` si hay vídeo.
2. **Proyecto.** Pon `nombre-cliente` en `name`, dentro de `wrangler.toml`, y crea el proyecto:

   ```bash
   npx wrangler pages project create nombre-cliente --production-branch main
   ```

3. **Datos.** Crea los dos almacenes y copia en `wrangler.toml` el `id` que devuelve cada uno. Después crea la tabla:

   ```bash
   npx wrangler kv namespace create datos-nombre-cliente
   ```

   ```bash
   npx wrangler d1 create estadisticas
   ```

   ```bash
   npm run preparar-bd
   ```

4. **Contraseña.** Genera la contraseña del cliente y apúntala, porque no se puede recuperar:

   ```bash
   npm run clave
   ```

5. **Publicar.** La primera vez hay que publicar, subir las claves y volver a publicar para que se apliquen:

   ```bash
   npm run publicar
   ```

   ```bash
   npm run subir-claves
   ```

   ```bash
   npm run publicar
   ```

6. **Dominio.** La web queda en `nombre-cliente.pages.dev`. Si tiene dominio propio, añádelo en Cloudflare, en
   Workers & Pages, dentro del proyecto, en Custom domains. Cambia también `url` en `contenido/sitio.ts`.
7. **Comprobar.** Entra en `/acceso`, marca una fecha, cambia una foto y mira que aparezcan en la web. Puede tardar unos minutos.

## Para salir en Google

La web sale preparada: título, descripción, datos estructurados, `sitemap.xml` y `robots.txt`. Cuando esté en su dominio definitivo:

1. Comprueba que `url` en `contenido/sitio.ts` es ese dominio y vuelve a publicar.
2. Da de alta el dominio en [Google Search Console](https://search.google.com/search-console) y envía `sitemap.xml`.
3. Crea su [Perfil de Empresa en Google](https://www.google.com/business/), con la misma web, zona y teléfono. Es lo que más ayuda en búsquedas locales.
4. Pon el enlace de la web en su Instagram y pide reseñas en Google a sus parejas.

La demo y las vistas previas no se indexan a propósito.

## Mantenimiento

- **Cambiar la contraseña:** `npm run clave`, `npm run subir-claves` y `npm run publicar`. Se cierran las sesiones abiertas.
- **Tras varios intentos fallidos** el acceso se bloquea 15 minutos para esa conexión.
- **Las fechas pasadas** se borran solas al guardar.
- **Cookies:** la web muestra un aviso solo si tiene vídeos de YouTube, que no se cargan sin aceptarlo. Si se añade Google
  Analytics, Meta Pixel o un mapa de Google, habrá que ampliar el aviso y actualizar `/aviso-legal`.

## Probar en local

No necesita cuenta. Genera una contraseña con `npm run clave` y arranca la versión real en `http://localhost:8788`:

```bash
npm run probar:real
```
