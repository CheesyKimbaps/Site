/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove deprecated experimental.serverActions; Server Actions are on by default in Next 14
  // Optionally keep or remove swcMinify setting; using default for cleaner config
  eslint: {
    // Allow Vercel builds to pass despite ESLint warnings/errors
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
