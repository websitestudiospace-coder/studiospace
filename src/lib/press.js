import { PRESS_ITEMS } from "@/data/press";
import { client } from "@/sanity/lib/client";

const SANITY_PRESS_QUERY = `*[_type == "pressMention"] | order(coalesce(order, 9999) asc, _createdAt desc) {
  publication,
  date,
  headline,
  url,
}`;

// Client-added press mentions (via /studio) live entirely in Sanity -- see
// the module comment in pressMention.js for why the original 5 mentions
// keep using the static @/data/press array instead of also being migrated
// in. Fails soft (empty array) rather than breaking the Press carousel/grid
// if Sanity is briefly unreachable, same as fetchSanityProjects().
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
