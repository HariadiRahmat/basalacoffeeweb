import type { NextConfig } from "next";

const firebaseCsp = [
  "default-src 'self'",
  [
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "https://apis.google.com",
    "https://www.gstatic.com",
    "https://www.google.com",
  ].join(" "),
  [
    "script-src-elem 'self' 'unsafe-inline'",
    "https://apis.google.com",
    "https://www.gstatic.com",
    "https://www.google.com",
  ].join(" "),
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https://www.gstatic.com https://www.google.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  [
    "connect-src 'self'",
    "https:",
    "wss:",
    "blob:",
    "data:",
  ].join(" "),
  [
    "frame-src 'self'",
    "https://accounts.google.com",
    "https://apis.google.com",
    "https://*.firebaseapp.com",
  ].join(" "),
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  {
    key: "Content-Security-Policy",
    value: firebaseCsp,
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
