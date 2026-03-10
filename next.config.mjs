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
      {
        protocol: "http",
        hostname: "192.168.29.196",
        port: "8000",
      },
    ],
  },
};

export default nextConfig;