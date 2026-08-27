import { Manrope } from "next/font/google";
import localFont from "next/font/local";
import Preloader from "@/components/Preloader";
import SmoothScroll from "@/components/SmoothScroll";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const agatho = localFont({
  src: "../fonts/agatho-regular.otf",
  weight: "400",
  style: "normal",
  variable: "--font-agatho",
});

// TODO: placeholder production domain -- swap for the real studio-splace
// domain before launch (kept in sync with src/app/sitemap.js and robots.js).
const BASE_URL = "https://studiospace.example.com";

// TODO: placeholder OG/Twitter share image -- using an existing project
// cover photo since no dedicated 1200x630 social-share image exists yet.
// Swap for a purpose-made image from the client before launch.
const DEFAULT_OG_IMAGE = "/images/projects/the-modern-eclectic-home/3H4A2226-1.webp";

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Studio SP_ACE | Architecture & Interior Design",
  description:
    "Studio SP_ACE is an architecture and interior design studio crafting spaces that feel like you.",
  openGraph: {
    title: "Studio SP_ACE | Architecture & Interior Design",
    description:
      "Studio SP_ACE is an architecture and interior design studio crafting spaces that feel like you.",
    siteName: "Studio SP_ACE",
    images: [{ url: DEFAULT_OG_IMAGE }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Studio SP_ACE | Architecture & Interior Design",
    description:
      "Studio SP_ACE is an architecture and interior design studio crafting spaces that feel like you.",
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${agatho.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-manrope">
        <Preloader />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
