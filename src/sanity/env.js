// Project ID and dataset aren't secrets (they're in every browser request to
// Sanity), so they're defaulted here and a missing env var can't break the
// site. Env vars still override them.
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "aw3xm618";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

// Pinned API version so a Sanity API change can't alter query behaviour.
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-09-22";
