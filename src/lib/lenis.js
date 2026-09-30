// Access to the app's single Lenis instance (created in SmoothScroll.jsx).
// Never call `new Lenis()` anywhere else -- two instances fight over the
// same window scroll. Components that need scroll events subscribe here.
let lenisInstance = null;

export function setLenis(instance) {
  lenisInstance = instance;
}

export function getLenis() {
  return lenisInstance;
}
