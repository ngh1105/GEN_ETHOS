import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";
const isVercel = process.env.VERCEL === "1";

const scriptSrc = isDev
  ? "script-src 'self' 'unsafe-eval' 'unsafe-inline'"
  : "script-src 'self'";

const frameAncestors = isVercel
  ? "frame-ancestors 'self' https://vercel.com https://*.vercel.com"
  : "frame-ancestors 'none'";

const cspParts = [
  "default-src 'self'",
  scriptSrc,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  [
    "connect-src 'self'",
    "https://*.genlayer.com",
    "https://*.zksync.dev",
    "wss://*.zksync.dev",
    // Bradbury testnet RPC (HTTP node — dev/testnet only)
    "http://34.91.102.53:9151",
    "https://*.walletconnect.org",
    "wss://*.walletconnect.org",
    "https://*.walletconnect.com",
    "wss://*.walletconnect.com",
    "https://api.web3modal.org",
    "https://pulse.walletconnect.org",
  ].join(" "),
  frameAncestors,
];

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  {
    key: "Content-Security-Policy",
    value: cspParts.join("; "),
  },
];

if (!isVercel) {
  securityHeaders.unshift({ key: "X-Frame-Options", value: "DENY" });
}

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
