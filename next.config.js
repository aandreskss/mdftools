/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Evita que la app sea embebida en iframes (clickjacking)
          { key: "X-Frame-Options", value: "DENY" },
          // Evita que el browser infiera el tipo MIME (MIME sniffing attacks)
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Controla qué información de referrer se envía
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Desactiva features del browser que no se usan
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // Fuerza HTTPS por 1 año (solo efectivo en producción sobre HTTPS)
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          // Content Security Policy
          // unsafe-inline requerido: Next.js App Router inyecta scripts/estilos inline para hidratación
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://*.supabase.co",
              "font-src 'self'",
              "connect-src 'self' https://*.supabase.co https://api.anthropic.com https://generativelanguage.googleapis.com https://www.googleapis.com https://api.pwnedpasswords.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
