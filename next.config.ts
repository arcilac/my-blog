/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/my-blog',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  assetPrefix: '/my-blog',
}

module.exports = nextConfig
