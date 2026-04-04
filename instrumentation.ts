/**
 * Next.js instrumentation hook — corre una vez al arrancar el servidor.
 * Usamos esto para validar variables de entorno antes de aceptar requests.
 * Si falta una variable crítica, el servidor falla al arrancar con mensaje claro.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./lib/env");
  }
}
