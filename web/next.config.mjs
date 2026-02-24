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
}

export default nextConfig
