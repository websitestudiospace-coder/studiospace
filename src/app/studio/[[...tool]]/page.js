import StudioClient from "./StudioClient";

// A search engine has no business indexing the editor UI.
export const metadata = { robots: { index: false, follow: false } };

// The Studio is a client-rendered SPA that does its own routing under
// /studio/* -- Next.js just needs to serve one static shell for every path
// under this catch-all, not prerender per-segment pages.
export const dynamic = "force-static";

export default function StudioPage() {
  return <StudioClient />;
}
