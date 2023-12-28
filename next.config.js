/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  modularizeImports: {
    '@mui/icons-material': {
      transform: '@mui/icons-material/{{member}}'
    }
  }
};

module.exports = nextConfig;
