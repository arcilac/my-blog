/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['www.notion.so', 'notion.so'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['@notionhq/client'],
  },
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/my-blog' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/my-blog/' : '',
  trailingSlash: true,
}

export default nextConfig
