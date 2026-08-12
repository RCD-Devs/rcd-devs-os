import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // El cliente Prisma se genera en app/generated/prisma (output custom, no
  // node_modules/.prisma). El file tracer de Vercel no siempre detecta que
  // el motor nativo (query_engine-*.node) hay que empaquetarlo en la funcion
  // serverless; sin esto, en produccion las queries fallan al primer request
  // real (funciona en local porque ahi no hay tracing de bundle).
  outputFileTracingIncludes: {
    "/*": ["./app/generated/prisma/**/*"],
  },
};

export default nextConfig;
