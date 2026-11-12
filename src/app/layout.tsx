import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import NavUser from "@/components/nav-user";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NexLearn — Build with AI. Ship with confidence.",
  description: "Free, self-paced technical and growth lessons—from building with AI to security, deployment, and product growth.",
};

export const viewport: Viewport = {
  themeColor: "#04060f",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col" style={{ background: '#04060f', color: '#f3f6ff' }}>
        <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[rgba(4,6,15,.88)] backdrop-blur-md">
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
