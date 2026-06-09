import withPWA from "next-pwa";
import runtimeCaching from "next-pwa/cache.js";

const isProd = process.env.NODE_ENV === "production";

/** @type {import('next').NextConfig} */
const pwaOptions = {
  dest: "public",
  disable: !isProd,
  register: true,
  skipWaiting: true,
  runtimeCaching,
};

const nextConfig = withPWA(pwaOptions)({
  reactStrictMode: true,
  turbopack: {},
});

export default nextConfig;
