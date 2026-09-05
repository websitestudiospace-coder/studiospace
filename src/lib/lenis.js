// Shared access to this app's one global Lenis instance (created in
// SmoothScroll.jsx, which wraps the whole page). Nothing outside
// SmoothScroll itself should ever call `new Lenis(...)` -- two instances
// both trying to smooth the same window scroll fight each other (competing
// raf loops, double-smoothing, janky scroll). Any component that needs to
// read scroll position/events (e.g. a manual scroll-driven effect that
// isn't a plain ScrollTrigger) should subscribe to the instance exposed
// here instead.
//
// Plain module-level variable, not React context -- nothing in this
// codebase reads it during render (only inside effects, after mount), so
// there's no need for it to participate in React's render tree.
let lenisInstance = null;

export function setLenis(instance) {
  lenisInstance = instance;
}

export function getLenis() {
  return lenisInstance;
}
