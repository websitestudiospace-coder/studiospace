import { PRESS_ITEMS } from "@/data/press";
import { client } from "@/sanity/lib/client";

const SANITY_PRESS_QUERY = `*[_type == "pressMention"] | order(coalesce(order, 9999) asc, _createdAt desc) {
  publication,
  date,
  headline,
  url,
}`;

// Press mentions added through /studio. Returns [] if Sanity is unreachable
// so the carousel/grid still show the static mentions.
async function fetchSanityPressItems() {
  try {
    const docs = await client.fetch(SANITY_PRESS_QUERY);
    return docs
      .filter((doc) => doc.publication && doc.date && doc.headline && doc.url)
      .map((doc) => ({
        publication: doc.publication,
        date: doc.date,
        headline: doc.headline,
        url: doc.url,
      }));
  } catch (err) {
    console.error("[press] Sanity fetch failed, showing static press items only:", err);
    return [];
  }
}

export async function getAllPressItems() {
  const sanityPressItems = await fetchSanityPressItems();
  return [...PRESS_ITEMS, ...sanityPressItems];
}
