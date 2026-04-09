import { describe, it, expect, vi, afterEach } from "vitest";
import { isPasswordPwned } from "./hibp";

// SHA-1 de "password" (contraseña muy común, aparece en HIBP)
// 5BAA61E4C9B93F3F0682250B6CF8331B7EE68FD8
const PASSWORD_HASH_PREFIX = "5BAA6";
const PASSWORD_HASH_SUFFIX = "1E4C9B93F3F0682250B6CF8331B7EE68FD8";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("isPasswordPwned", () => {
  it("retorna true si el sufijo aparece en la respuesta de HIBP", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: () =>
          Promise.resolve(
            `${PASSWORD_HASH_SUFFIX}:12345\nABCDE12345678901234567890123456789:1\n`
          ),
      })
    );

    expect(await isPasswordPwned("password")).toBe(true);
  });

  it("retorna false si el sufijo NO aparece en la respuesta de HIBP", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve("ABCDE12345678901234567890123456789:1\n"),
      })
    );

    expect(await isPasswordPwned("password")).toBe(false);
  });

  it("retorna false si la API devuelve un error HTTP", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false })
    );

    expect(await isPasswordPwned("password")).toBe(false);
  });

  it("retorna false si fetch lanza una excepción (sin conexión)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("Network error"))
    );

    expect(await isPasswordPwned("password")).toBe(false);
  });

  it("envía solo el prefijo de 5 caracteres a la API", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(""),
    });
    vi.stubGlobal("fetch", mockFetch);

    await isPasswordPwned("password");

    const url: string = mockFetch.mock.calls[0][0];
    const prefix = url.split("/range/")[1];
    expect(prefix).toBe(PASSWORD_HASH_PREFIX);
    expect(prefix).toHaveLength(5);
  });
});
