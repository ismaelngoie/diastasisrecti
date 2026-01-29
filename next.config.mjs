/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ This makes "next build" generate the /out folder (static export)
  output: "export",

  // ✅ Helps static hosting handle sub-routes like /onboarding and /dashboard reliably
  trailingSlash: true,

  // ✅ Required when using static export (even if we don't use next/image yet)
  images: { unoptimized: true },

  reactStrictMode: true
};

export default nextConfig;
