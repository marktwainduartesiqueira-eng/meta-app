import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // O relatório em PDF lê a logo e o QR Code de public/brand em tempo de execução;
  // sem isso, hospedagens serverless não incluem esses arquivos na função.
  outputFileTracingIncludes: {
    "/api/relatorio": ["./public/brand/**/*"],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
