import { createClient } from "next-sanity";
import { projectId, dataset, apiVersion } from "@/sanity/env";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  // Dataset is public, so published content reads with no token. `cdn: true`
  // serves through Sanity's fast, cached CDN -- fine here since a client
  // adding/editing a project isn't a page that needs to reflect instantly;
  // a normal redeploy/revalidation window is acceptable.
  useCdn: true,
});
