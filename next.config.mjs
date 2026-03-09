/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,

  images: {
    domains: ["api.townzfin.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "wikinapi.gssmart.in",
      },
    ],
  },
};

export default nextConfig;