import type { NextConfig } from 'next';

const config: NextConfig = {
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'mdx'],
  images: {
    unoptimized: true,
  },
};

export default config;
