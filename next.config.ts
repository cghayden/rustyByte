import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['@libsql/client', 'dockerode', 'ssh2'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // For client-side, ignore server-only packages completely
      config.resolve.alias = {
        ...config.resolve.alias,
        'dockerode': false,
        'ssh2': false,
      };
    }

    // Ignore .node files completely - they're native modules
    config.module.rules.push({
      test: /\.node$/,
      loader: 'node-loader',
    });

    return config;
  },
};

export default nextConfig;
