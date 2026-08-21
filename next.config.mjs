/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  devIndicators: false,
  images: {
    // Next.js 16 requires this allowlist explicitly -- AboutHero.jsx
    // requests quality={90} for its hero founder photos (S.png/P.png,
    // scaled up to ~3x via CSS transform), so 75 (the framework default)
    // alone isn't enough.
    qualities: [75, 90],
  },
};

export default nextConfig;
