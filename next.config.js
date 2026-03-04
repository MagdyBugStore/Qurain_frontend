/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // ده السطر المهم
  reactStrictMode: true,
  images: {
    domains: ['lh3.googleusercontent.com'],
    unoptimized: true,
  },
}

module.exports = nextConfig
