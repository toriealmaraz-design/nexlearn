"use client";

import { useEffect, useState } from "react";

interface UserInfo {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export default function NavUser() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/session")
      .then(r => r.json())
      .then(data => {
        setUser(data?.user ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return null;

  if (user) {
    return (
      <>
        <a href="/admin" className="hover:text-white transition">Admin</a>
        <div className="flex items-center gap-3">
          {user.image && (
            <img src={user.image} alt="" className="w-7 h-7 rounded-full border border-[rgba(150,175,230,.22)]" />
          )}
          <span className="text-xs hidden sm:inline" style={{ color: '#6b7796' }}>{user.name || user.email}</span>
          <a href="/api/auth/signout" className="text-xs hover:text-white transition" style={{ color: '#6b7796' }}>
            Sign Out
          </a>
        </div>
      </>
    );
  }

  return (
    <a
      href="/login"
      className="px-4 py-2 rounded-full transition"
      style={{ background: 'rgba(93,240,168,.05)', border: '1px solid rgba(93,240,168,.2)', color: '#5df0a8' }}
    >
      Sign In
    </a>
  );
}
