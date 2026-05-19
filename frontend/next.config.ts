import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  distDir: ".next",
  outputFileTracingRoot: __dirname,
  typescript: {
    // Ignorar errores de tipo durante el build
    // Necesario debido a bug conocido de tRPC con NestJS (#5614)
    ignoreBuildErrors: true,
  },
  eslint: {
    // También ignorar errores de ESLint durante el build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
