import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@mui/material", "@mui/icons-material", "@mui/system"],
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
      {
        source: "/buy-me-a-coffee",
        destination: "/support",
        permanent: true,
      },
      {
        source: "/lottery/:code",
        destination: "/:code",
        permanent: true,
      },
      {
        source: "/lottery/:code/:date",
        destination: "/:code/:date",
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
      {
        source: "/(feed.xml|sitemap.xml)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=300, s-maxage=300, stale-while-revalidate=600",
          },
        ],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(self), microphone=(self), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
