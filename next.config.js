/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    AIRTABLE_API_KEY: 'keyGV8CtuvpBRjIJ0',
    AIRTABLE_BASE_ID: 'appNlE7nWcgfXGBii',
  }
}

module.exports = nextConfig