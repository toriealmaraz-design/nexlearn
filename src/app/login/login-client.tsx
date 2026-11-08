"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function LoginClient() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/tracks";

  return (
    <div className="max-w-sm mx-auto px-4 py-20">
      <h1 className="text-3xl font-bold mb-2 text-center">Welcome to NexLearn</h1>
      <p className="text-[#9aa6c4] text-center mb-8 text-sm">
        Sign in to access courses, track progress, and join the community.
      </p>

      <button
        onClick={() => signIn("google", { callbackUrl })}
        className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border border-[rgba(150,175,230,.22)] text-sm font-semibold hover:bg-[rgba(255,255,255,.04)] transition cursor-pointer"
        style={{ background: 'rgba(255,255,255,.02)' }}
      >
        <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
        Continue with Google
      </button>

      <div className="mt-8 p-4 rounded-xl border border-[rgba(150,175,230,.12)]" style={{ background: 'rgba(12,18,38,.55)' }}>
        <p className="text-xs text-[#6b7796] text-center leading-relaxed">
          🔒 NexLearn is 100% free. We only use Google to verify your identity — no passwords to remember, no data sold.
        </p>
      </div>
    </div>
  );
}
