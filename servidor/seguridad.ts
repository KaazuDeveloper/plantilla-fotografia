export interface Env {
  DATOS: KVNamespace;
  ASSETS: Fetcher;
  ESTADISTICAS: D1Database;
  CLAVE_SAL: string;
  CLAVE_RESUMEN: string;
  SECRETO_SESION: string;
}

const COOKIE = "sesion";
const DURACION_SEGUNDOS = 12 * 60 * 60;
const VENTANA_INTENTOS = 15 * 60;
const MAX_INTENTOS = 10;

const codificador = new TextEncoder();
const hex = (buffer: ArrayBuffer) => [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");

const firma = async (secreto: string, texto: string) => {
  const llave = await crypto.subtle.importKey("raw", codificador.encode(secreto), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hex(await crypto.subtle.sign("HMAC", llave, codificador.encode(texto)));
};

/* Compara sin revelar por el tiempo de respuesta cuánto coinciden. */
const iguales = (a: string, b: string) => {
  const x = codificador.encode(a);
  const y = codificador.encode(b);
  return x.byteLength === y.byteLength && crypto.subtle.timingSafeEqual(x, y);
};

export const json = (cuerpo: unknown, status = 200, cabeceras: Record<string, string> = {}) =>
  new Response(JSON.stringify(cuerpo), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...cabeceras },
  });

/* Las peticiones que cambian algo solo se aceptan desde la propia web. */
export const mismoOrigen = (request: Request) => {
  const origen = request.headers.get("Origin");
  return origen !== null && new URL(origen).host === new URL(request.url).host;
};

export const claveCorrecta = async (env: Env, clave: string) => {
  /* La contraseña se genera al azar (80 bits): no hace falta un hash lento. */
  const resumen = hex(await crypto.subtle.digest("SHA-256", codificador.encode(`${env.CLAVE_SAL}:${clave}`)));
  return iguales(resumen, env.CLAVE_RESUMEN);
};

export const crearCookie = async (env: Env) => {
  const expira = String(Math.floor(Date.now() / 1000) + DURACION_SEGUNDOS);
  const valor = `${expira}.${await firma(env.SECRETO_SESION, expira)}`;
  return `${COOKIE}=${valor}; Path=/api; HttpOnly; Secure; SameSite=Strict; Max-Age=${DURACION_SEGUNDOS}`;
};

export const borrarCookie = () => `${COOKIE}=; Path=/api; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;

export const sesionValida = async (request: Request, env: Env) => {
  const valor = (request.headers.get("Cookie") ?? "").match(new RegExp(`(?:^|; )${COOKIE}=([0-9]+)\\.([0-9a-f]+)`));
  if (!valor) return false;
  const [, expira, recibida] = valor;
  return Number(expira) > Date.now() / 1000 && iguales(recibida, await firma(env.SECRETO_SESION, expira));
};

const claveIntentos = (request: Request) => `intentos:${request.headers.get("CF-Connecting-IP") ?? "local"}`;

export const bloqueado = async (request: Request, env: Env) =>
  Number((await env.DATOS.get(claveIntentos(request))) ?? 0) >= MAX_INTENTOS;

export const anotarFallo = async (request: Request, env: Env) => {
  const clave = claveIntentos(request);
  const intentos = Number((await env.DATOS.get(clave)) ?? 0) + 1;
  await env.DATOS.put(clave, String(intentos), { expirationTtl: VENTANA_INTENTOS });
  await contarUso(env, "escrituras");
};

export const limpiarFallos = (request: Request, env: Env) => env.DATOS.delete(claveIntentos(request));

const FOTO = /^((portada|servicio|equipo|video)-\d{1,2}|g-[0-9a-f-]{36})(-900)?\.jpg$/;
export const archivoValido = (archivo: string) => FOTO.test(archivo);

export const hoyEnEspana = (fecha = new Date()) => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(fecha);

/* Cloudflare renueva sus límites gratuitos a medianoche UTC. */
export const hoyUtc = () => new Date().toISOString().slice(0, 10);

export const contarUso = (env: Env, detalle: "peticiones" | "escrituras") =>
  env.ESTADISTICAS.prepare(
    `INSERT INTO eventos (dia, tipo, detalle, dispositivo, total) VALUES (?, 'uso', ?, '-', 1)
     ON CONFLICT (dia, tipo, detalle, dispositivo) DO UPDATE SET total = total + 1`,
  )
    .bind(hoyUtc(), detalle)
    .run()
    .catch(() => null);
