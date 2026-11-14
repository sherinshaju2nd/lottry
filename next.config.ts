import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@mui/material", "@mui/icons-material", "@mui/system"],
  serverExternalPackages: ["pdfkit"],
  async redirects() {
    return [
      // Canonical host: keralalotteryresultstoday.in → www. Done here (not as a Vercel domain
      // redirect) so /.well-known/* (assetlinks.json, apple-app-site-association) is served
      // directly on the bare domain: Android App Link / iOS Universal Link verification does
      // not follow redirects. Requires the bare domain in Vercel to be "Connect to Production".
      {
        source: "/:path((?!\\.well-known/).*)",
        has: [{ type: "host", value: "keralalotteryresultstoday.in" }],
        destination: "https://www.keralalotteryresultstoday.in/:path",
        permanent: true,
      },
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
      // Blog and News were merged into one "Articles & News" listing at /blog.
      // Article pages keep their /news/{slug} URLs; only the bare listing moves.
      {
        source: "/news",
        destination: "/blog",
        permanent: true,
      },
      {
        source: "/buy-me-a-coffee",
        destination: "/support",
        permanent: true,
      },
      // /lottery, /lottery/:code and /lottery/:code/:date are canonicalised in proxy.ts
      // (single 308 hop straight to the canonical slug, real 404 for unknown codes).
    ];
  },
  async headers() {
    return [
      {
        // iOS Universal Links require the extension-less AASA file to be served as JSON.
        source: "/.well-known/apple-app-site-association",
        headers: [{ key: "Content-Type", value: "application/json" }],
      },
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
        // Static images in /public (logos, icons, hero, blog covers). File names are reused when an
        // image is replaced, so no "immutable": browsers keep them a week and refresh in the background.
        source: "/:path*\\.(png|jpg|jpeg|webp|avif|svg|ico)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, stale-while-revalidate=86400",
          },
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
