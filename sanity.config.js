"use client";

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { projectId, dataset, apiVersion } from "./src/sanity/env";
import { schema } from "./src/sanity/schemaTypes";

export default defineConfig({
  basePath: "/studio",
  projectId,
  dataset,
  schema,
  plugins: [
    structureTool(),
    // Lets whoever's logged into Sanity run raw GROQ queries from within
    // /studio -- a debugging convenience, not needed for the client's
    // day-to-day "add a project" workflow.
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
