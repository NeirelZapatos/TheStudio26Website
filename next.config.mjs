/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
      domains: [
          process.env.S3_BUCKET_DOMAIN || 'fallback-domain.com', 
          'picsum.photos', 
          'www.stockvault.net', 
          'images.freeimages.com', 
          'media.istockphoto.com'
      ],
  },
};

export default nextConfig;
