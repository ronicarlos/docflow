
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // Removendo redirect automático para permitir lógica condicional na página inicial
};

export default nextConfig;
