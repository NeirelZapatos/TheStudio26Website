/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: [process.env.S3_BUCKET_DOMAIN,'picsum.photos'],
    },
  };
  
  export default nextConfig;