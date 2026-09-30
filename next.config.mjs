// Content-Security-Policy for the public site. External origins, and why:
//   res.cloudinary.com  project photos, videos and posters
//   www.google.com + *.gstatic.com  press-outlet favicons (Google's favicon
//     service redirects to gstatic for the actual bytes)
// No third-party scripts load, so script-src is 'self' plus 'unsafe-inline'
// (Next.js's hydration scripts are inline; see the nonce note below).
// Dev mode also needs 'unsafe-eval' for HMR -- never added in production.
const isDev = process.env.NODE_ENV !== "production";

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""};
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https://res.cloudinary.com https://www.google.com https://*.gstatic.com;
  media-src 'self' https://res.cloudinary.com;
  font-src 'self';
  frame-src 'none';
  connect-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'self';
  upgrade-insecure-requests;
`
  .replace(/\s{2,}/g, " ")
  .trim();

// A nonce-based CSP (no 'unsafe-inline') would force every page into dynamic
// rendering (see node_modules/next/dist/docs/01-app/02-guides/
// content-security-policy.md). This site is statically generated and never
// renders user-submitted content, so that tradeoff isn't worth it.
const securityHeaders = [
  { key: "Content-Security-Policy", value: cspHeader },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
];

// Sanity Studio (/studio) loads scripts, fonts and API calls from several
// Sanity-owned origins, so it gets its own permissive policy.
const studioCspHeader = `
  default-src 'self' https: wss:;
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https:;
  style-src 'self' 'unsafe-inline' https:;
  img-src 'self' data: blob: https:;
  font-src 'self' data: https:;
  connect-src 'self' https: wss:;
  worker-src 'self' blob:;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
`
  .replace(/\s{2,}/g, " ")
  .trim();

/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      // A later match overrides the same header key, so /studio only swaps
      // the CSP and keeps every other security header.
      {
        source: "/studio",
        headers: [{ key: "Content-Security-Policy", value: studioCspHeader }],
      },
      {
        source: "/studio/:path*",
        headers: [{ key: "Content-Security-Policy", value: studioCspHeader }],
      },
    ];
  },
};

export default nextConfig;
