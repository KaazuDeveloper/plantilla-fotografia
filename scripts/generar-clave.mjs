/*
 * Genera la contraseña de acceso del cliente y los valores que necesita el servidor.
 * Uso: npm run clave
 */
import { createHash, randomBytes } from "node:crypto";
import { writeFile } from "node:fs/promises";

const ALFABETO = "abcdefghjkmnpqrstuvwxyz23456789";
const bytes = randomBytes(16);
const grupos = [...bytes].map((b) => ALFABETO[b % ALFABETO.length]).join("").match(/.{4}/g);
const clave = grupos.join("-");
const sal = randomBytes(16).toString("hex");
const resumen = createHash("sha256").update(`${sal}:${clave}`).digest("hex");
const secreto = randomBytes(32).toString("hex");

await writeFile(".dev.vars", `CLAVE_SAL=${sal}\nCLAVE_RESUMEN=${resumen}\nSECRETO_SESION=${secreto}\n`);

console.log(`\nContraseña para el cliente (guárdala, no se puede recuperar):\n\n  ${clave}\n`);
console.log("Valores guardados en .dev.vars, que git ignora. Súbelos con: npm run subir-claves\n");
