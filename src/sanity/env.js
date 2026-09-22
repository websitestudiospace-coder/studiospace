// Project ID and dataset are not secrets (they're visible in every request
// the browser makes to Sanity's API anyway), so they're hardcoded as the
// default here rather than only living in an environment variable -- a
// missing env var on a new host (Vercel/Hostinger) should never be able to
// silently break the site the way the SMTP env vars did. An env var still
// overrides these if ever needed (e.g. pointing at a different dataset).
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "aw3xm618";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

// Sanity API versions are date-locked snapshots of the API shape -- pin to
// today rather than "latest" so a future Sanity API change can't silently
// alter query behavior on this site.
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-09-22";
