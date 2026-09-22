import { createImageUrlBuilder } from "@sanity/image-url";
import { projectId, dataset } from "@/sanity/env";

const builder = createImageUrlBuilder({ projectId, dataset });

// Usage: urlFor(image).width(1200).url()
export function urlFor(source) {
  return builder.image(source);
}
