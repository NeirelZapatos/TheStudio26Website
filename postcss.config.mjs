/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
  },
  images: {
    domains: ['tests26bucket.s3.us-east-2.amazonaws.com'],
  }
};

export default config;
