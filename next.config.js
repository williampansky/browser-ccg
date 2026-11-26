const withSvgr = require('next-svgr');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // A second dev server (e.g. for browser checks while the author playtests on
  // 3000) sets NEXT_DIST_DIR so the two do not share `.next`.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  productionBrowserSourceMaps: true,
  reactStrictMode: true,
  // Next's SWC minifier (12.3) broke the Pixi spell effects in the production
  // build: the spot effect's fills came out solid instead of faint (dev and a
  // Terser build were right). Terser is the safe choice until Next is upgraded.
  swcMinify: false,
};

module.exports = withSvgr(nextConfig);
