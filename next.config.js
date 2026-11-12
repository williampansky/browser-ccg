const withSvgr = require('next-svgr');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // A second dev server (e.g. for browser checks while the author playtests on 3000) sets NEXT_DIST_DIR so the two do not share `.next`.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  productionBrowserSourceMaps: true,
  reactStrictMode: true,
  swcMinify: true,
};

module.exports = withSvgr(nextConfig);
