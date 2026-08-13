import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // El cliente Prisma se genera en app/generated/prisma (output custom, no
  // node_modules/.prisma). El file tracer de Vercel no siempre detecta que
  // el motor nativo (query_engine-*.node) hay que empaquetarlo en la funcion
  // serverless; sin esto, en produccion las queries fallan al primer request
  // real (funciona en local porque ahi no hay tracing de bundle).
  // "/*" solo matchea un nivel de ruta (no cubre "/" ni rutas anidadas como
  // /proyectos/[slug]/protocolos/[id]) — confirmado en logs de Vercel: el
  // motor seguia sin encontrarse incluso con build fresco sin cache. "/**/*"
  // matchea a cualquier profundidad; "/" se agrega aparte porque el patron
  // recursivo no siempre cubre la raiz exacta.
  outputFileTracingIncludes: {
    "/": ["./app/generated/prisma/**/*"],
    "/**/*": ["./app/generated/prisma/**/*"],
  },
};

export default nextConfig;
