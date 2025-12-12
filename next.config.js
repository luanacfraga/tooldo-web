/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
    // Otimização de imagens para produção
    formats: ['image/avif', 'image/webp'],
  },
  // Configurações de produção
  compress: true,
  poweredByHeader: false,
  // Garantir que o Fast Refresh funcione corretamente (apenas em dev)
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }
    }
    return config
  },
  // Configuração para AWS Amplify
  output: 'standalone', // Otimiza o build para produção
}

module.exports = nextConfig
