/**
 * Verifica si una contraseña aparece en filtraciones de datos conocidas
 * usando la API de HaveIBeenPwned con k-anonymity.
 *
 * Solo se envían los primeros 5 caracteres del hash SHA-1 — nunca la contraseña completa.
 * Si la API falla, retorna false para no bloquear el registro por un servicio externo.
 */
export async function isPasswordPwned(password: string): Promise<boolean> {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-1", msgBuffer);
  const hashHex = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
  const prefix = hashHex.slice(0, 5);
  const suffix = hashHex.slice(5);
  try {
    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { "Add-Padding": "true" },
    });
    if (!res.ok) return false;
    const text = await res.text();
    return text.split("\n").some((line) => line.split(":")[0] === suffix);
  } catch {
    return false;
  }
}
