/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: [process.env.S3_BUCKET_DOMAIN],
    },
};

export default nextConfig;
