"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

function MailIcon() {
  return <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>;
}

function LockIcon() {
  return <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="4" y="10" width="16" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>;
}

function EyeIcon({ hidden }: { hidden: boolean }) {
  return hidden ? <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 3 21 21" /><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" /><path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c5 0 8.5 4 9.5 6a12.7 12.7 0 0 1-3.1 3.6M6.2 6.2C3.9 7.8 2.7 10 2.5 10c1 2 4.5 6 9.5 6 .8 0 1.6-.1 2.3-.3" /></svg> : <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.5" /></svg>;
}

function GoogleIcon() {
  return <svg aria-hidden="true" width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>;
}

export default function LoginClient({ googleAuthEnabled }: { googleAuthEnabled: boolean }) {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/tracks";
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if ((event.nativeEvent as KeyboardEvent).isComposing || (event.nativeEvent as KeyboardEvent).keyCode === 229) return;
    setError("");
    setSubmitting(true);

    try {
      if (mode === "sign-up") {
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        if (!response.ok) {
          const result = await response.json().catch(() => null);
          throw new Error(result?.error || "Unable to create your account.");
        }
      }

      const result = await signIn("credentials", { email, password, callbackUrl, redirect: false });
      if (result?.error) throw new Error("Invalid email or password.");
      window.location.assign(result?.url || callbackUrl);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to sign in right now.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-10">
      <section className="w-full max-w-[448px] rounded-[20px] border border-[rgba(150,175,230,.22)] bg-[linear-gradient(135deg,rgba(20,30,45,.94),rgba(27,20,67,.9))] px-8 py-5 shadow-[0_24px_80px_rgba(0,0,0,.28)] sm:px-8" aria-labelledby="auth-title">
        <h1 id="auth-title" className="text-center text-[23px] font-semibold tracking-[-.02em]">{mode === "sign-in" ? "Welcome back" : "Create your account"}</h1>
        <p className="mt-2 text-center text-sm text-[#9aa6c4]">{mode === "sign-in" ? "Sign in to access your workspace" : "Start learning with NexLearn"}</p>

        <div className="mt-7 grid grid-cols-2 rounded-[14px] bg-[rgba(94,96,145,.2)] p-1" role="tablist" aria-label="Account mode">
          {(["sign-in", "sign-up"] as const).map((value) => <button key={value} type="button" role="tab" aria-selected={mode === value} onClick={() => setMode(value)} className={`rounded-[11px] py-3 text-sm font-semibold transition ${mode === value ? "bg-[#12b7d4] text-white shadow-[0_0_0_3px_rgba(18,183,212,.12)]" : "text-[#9aa6c4] hover:text-white"}`}>{value === "sign-in" ? "Sign In" : "Sign Up"}</button>)}
        </div>

        {googleAuthEnabled && (
          <>
            <button type="button" onClick={() => signIn("google", { callbackUrl })} className="mt-6 flex w-full items-center justify-center gap-3 rounded-[14px] bg-white py-3.5 text-sm font-semibold text-[#182039] transition hover:bg-[#f1f3f8] focus:outline-none focus:ring-2 focus:ring-[#12b7d4] focus:ring-offset-2 focus:ring-offset-[#172131]"><GoogleIcon />Continue with Google</button>
            <div className="my-7 flex items-center gap-4 text-xs text-[#6b7796]" aria-hidden="true"><span className="h-px flex-1 bg-[rgba(150,175,230,.14)]" />OR<span className="h-px flex-1 bg-[rgba(150,175,230,.14)]" /></div>
          </>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="relative block"><span className="sr-only">Email address</span><MailIcon /><input type="email" autoComplete="email" placeholder="Email address" value={email} onChange={(event) => setEmail(event.target.value)} className="h-12 w-full rounded-[14px] border border-[rgba(150,175,230,.22)] bg-[rgba(55,62,92,.42)] pl-12 pr-4 text-sm text-white outline-none placeholder:text-[#7180a2] focus:border-[#12b7d4] focus:ring-2 focus:ring-[#12b7d4]/20" required /></label>
          <label className="relative block"><span className="sr-only">Password</span><LockIcon /><input type={showPassword ? "text" : "password"} autoComplete={mode === "sign-in" ? "current-password" : "new-password"} placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} className="h-12 w-full rounded-[14px] border border-[rgba(150,175,230,.22)] bg-[rgba(55,62,92,.42)] pl-12 pr-12 text-sm text-white outline-none placeholder:text-[#7180a2] focus:border-[#12b7d4] focus:ring-2 focus:ring-[#12b7d4]/20" required /><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((visible) => !visible)} className="absolute right-3 top-3 text-[#7180a2] hover:text-white"><EyeIcon hidden={showPassword} /></button></label>
          {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
          {mode === "sign-in" && <div className="text-right"><a href="mailto:support@nexlearn.com?subject=Sign-in%20help" className="text-xs font-medium text-[#12d7ed] hover:text-white">Forgot password? Email me a sign-in link</a></div>}
          <button type="submit" disabled={submitting} className="flex h-12 w-full disabled:cursor-wait disabled:opacity-70 items-center justify-center gap-2 rounded-[14px] bg-gradient-to-r from-[#10b8d2] via-[#087ae9] to-[#3014f2] text-sm font-semibold text-white transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[#12b7d4]">{mode === "sign-in" ? "Sign In" : "Create Account"}<span aria-hidden="true" className="text-lg">→</span></button>
        </form>

        <p className="mt-6 text-center text-xs text-[#6b7796]">Staff accounts only. Clients don&apos;t need to sign in.</p>
        <a href="/landing.html" className="mt-5 block text-center text-sm text-[#12d7ed] hover:text-white">← Back to main site</a>
      </section>
    </main>
  );
}
