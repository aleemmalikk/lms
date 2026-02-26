/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "wikinapi.gssmart.in",
      },
    ],
  },
};

export default nextConfig;