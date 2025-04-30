/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/my-blog',
  assetPrefix: '/my-blog/',
  trailingSlash: true,
}

module.exports = nextConfig
