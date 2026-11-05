"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    // TODO: Wire up auth API routes backed by Neon profiles table
    setMessage("Auth coming soon — Neon backend is being configured!");
    setLoading(false);
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-20">
      <h1 className="text-3xl font-bold mb-2 text-center">{mode === "login" ? "Welcome Back" : "Join NexLearn"}</h1>
      <p className="text-[#9aa6c4] text-center mb-8 text-sm">
        {mode === "login" ? "Sign in to access your courses." : "Create a free account to start learning."}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl bg-[#060a18] border border-[rgba(150,175,230,.22)] text-sm focus:border-[#5df0a8] focus:outline-none transition"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl bg-[#060a18] border border-[rgba(150,175,230,.22)] text-sm focus:border-[#5df0a8] focus:outline-none transition"
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        {message && <p className="text-[#5df0a8] text-sm">{message}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-[#5df0a8] text-[#032018] font-bold text-sm hover:bg-[#2fd38a] transition disabled:opacity-50"
        >
          {loading ? "..." : mode === "login" ? "Sign In" : "Create Account"}
        </button>
      </form>

      <p className="text-center text-sm text-[#6b7796] mt-6">
        {mode === "login" ? "Don't have an account? " : "Already have an account? "}
        <button onClick={() => setMode(mode === "login" ? "signup" : "login")} className="text-[#5df0a8] hover:underline">
          {mode === "login" ? "Sign up" : "Sign in"}
        </button>
      </p>
    </div>
  );
}
