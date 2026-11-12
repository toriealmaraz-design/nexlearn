"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";

interface UserInfo {
  name?: string | null;
  email?: string | null;
}

export default function NavUser() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((response) => response.json())
      .then((data) => {
        setUser(data?.user ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return null;

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <Link href="/admin" className="text-[var(--muted)] transition hover:text-[var(--foreground)]">Presentation Engine</Link>
        <span className="hidden max-w-40 truncate text-xs text-[var(--muted-2)] sm:inline">{user.name || user.email}</span>
        <button type="button" onClick={() => signOut({ callbackUrl: "/" })} className="text-xs text-[var(--muted-2)] transition hover:text-[var(--foreground)]">
          Sign out
        </button>
      </div>
    );
  }

  return (
    <Link href="/login" className="inline-flex min-h-9 items-center rounded-full border border-[rgba(93,240,168,.25)] px-4 text-sm font-medium text-[var(--accent)] transition hover:bg-[rgba(93,240,168,.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]">
      Sign in
    </Link>
  );
}
