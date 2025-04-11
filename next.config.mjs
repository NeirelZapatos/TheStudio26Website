/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
      domains: ['tests26bucket.s3.us-east-2.amazonaws.com'],
      remotePatterns: [
          {
              protocol: 'https',
              hostname: process.env.S3_BUCKET_DOMAIN || 'fallback-domain.com',
              pathname: '/**',
          },
          {
              protocol: 'https',
              hostname: 'tests26bucket.s3.us-east-2.amazonaws.com',
              pathname: '/**',
          },
          {
              protocol: 'https',
              hostname: 'picsum.photos',
              pathname: '/**',
          },
          {
              protocol: 'https',
              hostname: 'www.stockvault.net',
              pathname: '/**',
          },
          {
              protocol: 'https',
              hostname: 'images.freeimages.com',
              pathname: '/**',
          },
          {
              protocol: 'https',
              hostname: 'media.istockphoto.com',
              pathname: '/**',
          },
          {
              protocol: 'https',
              hostname: 'example.com',
              pathname: '/**',
          },
      ],
  },
};

export default nextConfig;
