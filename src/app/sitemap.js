// TEMPORARY (pre-launch holding page): serve an empty sitemap so no page
// addresses are listed. At launch, revert this commit to restore the full
// sitemap (static routes + every project).
export default function sitemap() {
  return [];
}
