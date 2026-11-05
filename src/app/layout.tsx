import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "NexLearn — Learn. Build. Earn.",
  description: "Free technical classes & digital marketing literacy. Powered by vibe coding and curated affiliate pathways.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col" style={{ background: '#04060f', color: '#f3f6ff' }}>
        <nav className="border-b sticky top-0 z-50 backdrop-blur-md" style={{ borderColor: 'rgba(150,175,230,.12)', background: 'rgba(4,6,15,.85)' }}>
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <a href="/" className="text-xl font-bold tracking-tight" style={{ letterSpacing: '.12em' }}>
              <span style={{ color: '#5df0a8' }}>▲</span>{" "}
              <span style={{ color: '#f3f6ff' }}>NexLearn</span>
            </a>
            <div className="flex items-center gap-6 text-sm" style={{ color: '#9aa6c4' }}>
              <a href="/tracks" className="hover:text-white transition">Tracks</a>
              <a href="/admin" className="hover:text-white transition">Admin</a>
              <a
                href="/login"
                className="px-4 py-2 rounded-full transition"
                style={{ background: 'rgba(93,240,168,.05)', border: '1px solid rgba(93,240,168,.2)', color: '#5df0a8' }}
              >
                Sign In
              </a>
            </div>
          </div>
        </nav>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
