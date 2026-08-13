import type { NextConfig } from "next";

const SUPABASE_ORIGIN = "https://*.supabase.co";

// Satoshi (tipografia principal, ver app/layout.tsx) se sirve desde
// Fontshare, no self-hosteada: el <link> trae el CSS desde api.fontshare.com
// y ese CSS apunta a archivos .woff2 en cdn.fontshare.com. Si alguna vez se
// migra a self-host (next/font/local), estos dos origenes se pueden sacar.
const FONTSHARE_CSS_ORIGIN = "https://api.fontshare.com";
const FONTSHARE_FILES_ORIGIN = "https://cdn.fontshare.com";

// Desplegado en Vercel, Speed Insights/Analytics se sirven desde el mismo
// origen (Vercel inyecta scriptSrc/endpoint same-origin en build time). Este
// dominio externo es el fallback que usan fuera de la plataforma Vercel (ej.
// en `next dev` local) — se permite igual por si alguna vez no aplica el
// build-time config.
const VERCEL_SCRIPTS_ORIGIN = "https://va.vercel-scripts.com";

function buildCsp() {
  const scriptSrc = ["'self'", "'unsafe-inline'", VERCEL_SCRIPTS_ORIGIN];
  // React usa eval() en modo dev para reconstruir stack traces (HMR); nunca
  // en produccion (confirmado por el propio warning de React). Sin esto,
  // `next dev` rompe con la CSP puesta.
  if (process.env.NODE_ENV !== "production") {
    scriptSrc.push("'unsafe-eval'");
  }

  return [
    "default-src 'self'",
    `img-src 'self' data: blob: ${SUPABASE_ORIGIN}`,
    `connect-src 'self' ${SUPABASE_ORIGIN} ${VERCEL_SCRIPTS_ORIGIN}`,
    `script-src ${scriptSrc.join(" ")}`,
    `style-src 'self' 'unsafe-inline' ${FONTSHARE_CSS_ORIGIN}`,
    `font-src 'self' ${FONTSHARE_FILES_ORIGIN}`,
    "frame-ancestors 'none'",
  ].join("; ");
}

const SECURITY_HEADERS = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Content-Security-Policy", value: buildCsp() },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
    ];
  },
};

export default nextConfig;
