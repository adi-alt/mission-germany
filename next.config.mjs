/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // static export so Capacitor can wrap the same build for iOS
  images: { unoptimized: true },
  // prod builds get their own dir so `npm run build` can't corrupt the running dev server's cache
  distDir: process.env.NODE_ENV === 'production' ? '.next-build' : '.next',
};
export default nextConfig;
