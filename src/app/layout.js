import { Manrope } from "next/font/google";
import localFont from "next/font/local";
import SiteChrome from "@/components/SiteChrome";
import "./globals.css";
import { DEFAULT_SHARE_IMAGE, SITE_URL } from "@/lib/site";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

// agatho-regular.woff2 is a subset of agatho-regular.otf (kept as the
// source): only the 88 glyphs that are real letterforms. The other 128 in
// that file -- : ; ( ) / _ # % — … © and every accented letter, among
// others -- are "buy font" watermark shapes and made up nearly all of its
// 1.5MB. Characters outside the subset fall back to serif instead of
// painting a watermark. Regenerate with fonttools:
//   pyftsubset agatho-regular.otf --flavor=woff2 --layout-features='*'
//     --unicodes="U+0020-0022,U+0024,U+0026-0027,U+002C-002E,U+0030-0039,U+003F-005A,U+0060-007A,U+00A0,U+00AB,U+00AD,U+00B4,U+00BB,U+2013,U+2018-201E"
//     --output-file=agatho-regular.woff2
const agatho = localFont({
  src: "../fonts/agatho-regular.woff2",
  weight: "400",
  style: "normal",
  variable: "--font-agatho",
});

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Studio SP_ACE | Architecture & Interior Design",
  description:
    "Studio SP_ACE is an architecture and interior design studio crafting spaces that feel like you.",
  openGraph: {
    title: "Studio SP_ACE | Architecture & Interior Design",
    description:
      "Studio SP_ACE is an architecture and interior design studio crafting spaces that feel like you.",
    siteName: "Studio SP_ACE",
    images: [{ url: DEFAULT_SHARE_IMAGE }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Studio SP_ACE | Architecture & Interior Design",
    description:
      "Studio SP_ACE is an architecture and interior design studio crafting spaces that feel like you.",
    images: [DEFAULT_SHARE_IMAGE],
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${agatho.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-manrope">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
