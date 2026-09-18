import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdfkit"],
  async redirects() {
    return [
      {
        source: "/pages",
        destination: "/",
        permanent: true,
      },
      {
        source: "/pages/:path*",
        destination: "/",
        permanent: true,
      },
      {
        source: "/app",
        destination: "/kerala-lottery-app",
        permanent: true,
      },
      {
        source: "/download",
        destination: "/kerala-lottery-app",
        permanent: true,
      },
      {
        source: "/download-app",
        destination: "/kerala-lottery-app",
        permanent: true,
      },
      {
        source: "/mobile-app",
        destination: "/kerala-lottery-app",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization" },
        ],
      },
    ];
  },
};

export default nextConfig;
