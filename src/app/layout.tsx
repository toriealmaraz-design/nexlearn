import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Manrope, Sora } from "next/font/google";
import Link from "next/link";
import NavUser from "@/components/nav-user";
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
        <header className="site-header sticky top-0 z-50 border-b border-[var(--line)] bg-[rgba(4,6,15,.88)] backdrop-blur-md">
          <nav aria-label="Primary navigation" className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
            <Link href="/" className="text-lg font-semibold tracking-tight text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]">
              <span aria-hidden="true" className="mr-2 text-[var(--accent)]">▲</span>NexLearn
            </Link>
            <div className="flex items-center gap-4 text-sm sm:gap-6">
              <Link href="/#route-heading" className="hidden text-[var(--muted)] transition hover:text-[var(--foreground)] sm:inline">How it works</Link>
              <Link href="/tracks" className="text-[var(--muted)] transition hover:text-[var(--foreground)]">Tracks</Link>
              <NavUser />
            </div>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
