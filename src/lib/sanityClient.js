// src/lib/sanityClient.js
import { createClient } from "@sanity/client";

export const client = createClient({
  projectId: "ik92gukm",
  dataset: "production",
  apiVersion: "2024-08-22",
  useCdn: false,
});