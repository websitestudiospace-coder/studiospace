import { createClient } from "next-sanity";
import { projectId, dataset, apiVersion } from "@/sanity/env";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  // Public dataset, so no token needed. The CDN may lag an edit by a short
  // while, which is fine for this content.
  useCdn: true,
});
