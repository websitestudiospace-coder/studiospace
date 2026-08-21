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

export const metadata = {
  title: "Studio SP_ACE | Architecture & Interior Design",
  description:
    "Studio SP_ACE is an architecture and interior design studio crafting spaces that feel like you.",
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
