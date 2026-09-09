// Simple in-memory, fixed-window rate limiter. Deliberately not backed by
// Redis/an external service -- this app runs as a single persistent Node
// process (Hostinger, not serverless edge functions with cold starts that
// would wipe this Map), so in-memory state is enough at this project's
// traffic scale. If this ever runs across multiple processes/instances,
// this would need a shared store instead.
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS = 5; // per IP, per window

const hits = new Map(); // ip -> array of request timestamps (ms)

function prune(now) {
  for (const [ip, timestamps] of hits) {
    const recent = timestamps.filter((t) => now - t < WINDOW_MS);
    if (recent.length === 0) hits.delete(ip);
    else hits.set(ip, recent);
  }
}

// Returns { limited: boolean, retryAfterSeconds: number }.
export function checkRateLimit(ip) {
  const now = Date.now();
  // Opportunistic cleanup so this Map never grows unbounded -- cheap at
  // this traffic scale, no need for a separate timer/cron.
  if (Math.random() < 0.1) prune(now);

  const key = ip || "unknown";
  const timestamps = (hits.get(key) || []).filter((t) => now - t < WINDOW_MS);

  if (timestamps.length >= MAX_REQUESTS) {
    const retryAfterSeconds = Math.ceil((timestamps[0] + WINDOW_MS - now) / 1000);
    return { limited: true, retryAfterSeconds: Math.max(retryAfterSeconds, 1) };
  }

  timestamps.push(now);
  hits.set(key, timestamps);
  return { limited: false, retryAfterSeconds: 0 };
}

// Hostinger (like most non-edge Node hosts) sits behind a reverse proxy,
// so the real visitor IP arrives via x-forwarded-for, not the raw socket.
export function getClientIp(request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}
