/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Add empty turbopack config to silence the warning
  turbopack: {},
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        path: false,
        child_process: false,
        net: false,
        tls: false,
        dns: false,
        os: false,
        constants: false,
        stream: false,
        crypto: false,
        "timers/promises": false,
        async_hooks: false,
        "mongodb-client-encryption": false,
        kerberos: false,
        "@mongodb-js/zstd": false,
        snappy: false,
        aws4: false,
      };
    }
    return config;
  },
};

export default nextConfig;