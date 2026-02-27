import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const rootDir = fileURLToPath(new URL('.', import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ignore static checks to save resources/time
  typescript: {
    ignoreBuildErrors: true,
  },

  // Disable source maps to save large amounts of memory
  productionBrowserSourceMaps: false,

  // Disable compression to save CPU/Memory
  compress: false,

  // Experimental flags for constrained environments
  experimental: {
    // Force serial processing
    workerThreads: false,
    cpus: 1,
    // Disable expensive optimizations
    optimizeCss: false,
    // Help tree-shaking for large libs
    optimizePackageImports: ['lucide-react', 'framer-motion', 'date-fns'],
  },
  
  // Image optimization uses memory; disable it if using external storage or low resources
  images: {
    unoptimized: true,
  },

  // Standalone output for Docker/Container environments
  output: 'standalone',
  
  // Ensure Turbopack uses this folder as root (avoid cross-root lockfile issues)
  turbopack: { root: rootDir },
  
  // Webpack fallback config (used by some pipelines like CSS resolution)
  webpack: (config) => {
    config.resolve = config.resolve || {}
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      tailwindcss: require.resolve('tailwindcss'),
      '@tailwindcss/postcss': require.resolve('@tailwindcss/postcss'),
    }
    config.resolve.modules = [
      ...(config.resolve.modules || []),
      rootDir + 'node_modules',
    ]
    return config
  },
}

export default nextConfig
