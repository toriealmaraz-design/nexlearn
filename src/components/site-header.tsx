"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import NavUser from "@/components/nav-user";

export default function SiteHeader() {
  const pathname = usePathname();

  // The captured landing design provides its own navigation.
  if (pathname === "/") return null;

  return (
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
  );
}
