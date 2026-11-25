import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { JetBrains_Mono, Manrope, Sora } from "next/font/google";
import SiteHeader from "@/components/site-header";
import "./globals.css";

const bodyFont = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

const headingFont = Sora({
  variable: "--font-head",
  subsets: ["latin"],
});

const codeFont = JetBrains_Mono({
  variable: "--font-code",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NexLearn — Learn. Build. Not Earn.",
  description: "Free vibe coding classes, digital marketing literacy, and curated pathways to real income in one immersive learning platform.",
};

export const viewport: Viewport = {
  themeColor: "#04060f",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${bodyFont.variable} ${headingFont.variable} ${codeFont.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col" style={{ background: '#04060f', color: '#f3f6ff' }}>
        <Suspense fallback={null}>
          <SiteHeader />
        </Suspense>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
