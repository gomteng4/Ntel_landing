/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/Ntel_landing',
  assetPrefix: '/Ntel_landing/',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  distDir: 'out',
  images: {
    unoptimized: true,
    domains: ['localhost', 'supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
}

module.exports = nextConfig 