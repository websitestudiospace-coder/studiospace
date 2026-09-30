import { NextResponse } from "next/server";

// TEMPORARY (pre-launch holding page): send every page except the home page
// and the Sanity Studio to "/". 307 (temporary) so browsers and search
// engines don't cache the redirect. Delete this file at launch.
export function proxy(request) {
  return NextResponse.redirect(new URL("/", request.url), 307);
}

export const config = {
  // Everything except: "/" itself, /studio (Sanity admin), Next.js internals,
  // and files with an extension (logo, fonts, icons, robots.txt).
  matcher: ["/((?!studio|_next|.*\\..*).+)"],
};
