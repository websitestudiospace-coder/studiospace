import StudioClient from "./StudioClient";

// A search engine has no business indexing the editor UI.
export const metadata = { robots: { index: false, follow: false } };

// The Studio does its own client-side routing, so one static shell serves
// every /studio/* path.
export const dynamic = "force-static";

export default function StudioPage() {
  return <StudioClient />;
}
