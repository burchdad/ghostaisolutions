/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    // Resolve the legacy privacy alias before rendering, including for non-JS crawlers.
    return [{ source: "/privacy", destination: "/privacy-policy", permanent: true }];
  },
};
module.exports = nextConfig;

