const withNextra = require('nextra')({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
})

// Add any Next.js config options here
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
}

// Export the combined configuration
module.exports = withNextra(nextConfig)
