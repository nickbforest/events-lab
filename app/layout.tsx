import type { Metadata } from "next";
import {
  Bricolage_Grotesque,
  Instrument_Serif,
  Inter,
  JetBrains_Mono,
} from "next/font/google";
import { QueryProvider } from "@/components/providers/query-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Display: headings and the logo. The optical-size axis gives large text
// its tighter, more characterful cut.
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  axes: ["opsz"],
});

// Accent: one highlighted phrase per headline, in italic.
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "Eventail — Publish events without the noise",
    template: "%s — Eventail",
  },
  description:
    "The publishing toolkit for artists, venues, and organizers to share upcoming events with their audience.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // Smooth scrolling for in-page anchors only: the attribute tells Next to
    // switch it off during route changes, so navigations still jump.
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${bricolage.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
