const fs = require('fs');
const path = require('path');

const withNextra = require('nextra')({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
  defaultShowCopyCode: true,
});

// Add any Next.js config options here
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config, { dev, isServer }) => {
    // Fix for flexsearch module errors
    if (!dev && !isServer) {
      // Replace native implementations with pure JS
      config.resolve.fallback = { 
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    
    // Handle ESM modules issues
    config.module = {
      ...config.module,
      exprContextCritical: false,
    };
    
    // Suppress warnings about package builds
    config.infrastructureLogging = {
      level: 'error',
    };
    
    return config;
  },
  // Add experimental features for better ESM support
  experimental: {
    esmExternals: 'loose',
  },
};

// Export the combined configuration
module.exports = withNextra(nextConfig)
