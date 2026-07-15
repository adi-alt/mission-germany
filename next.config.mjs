/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // static export so Capacitor can wrap the same build for iOS
  images: { unoptimized: true },
};
export default nextConfig;
