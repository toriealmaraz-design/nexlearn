"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { setChapterCompleted } from "./actions";

type ProgressControlProps = {
  chapterId: string;
  completed: boolean;
  isSignedIn: boolean;
  loginHref: string;
};

export default function ProgressControl({ chapterId, completed: initialCompleted, isSignedIn, loginHref }: ProgressControlProps) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function toggleCompletion() {
    const nextCompleted = !completed;
    setCompleted(nextCompleted);
    setError(null);

    startTransition(async () => {
      try {
        await setChapterCompleted(chapterId, nextCompleted);
        router.refresh();
      } catch (saveError) {
        setCompleted(!nextCompleted);
        setError(saveError instanceof Error ? saveError.message : "Unable to save progress.");
      }
    });
  }

  if (!isSignedIn) {
    return (
      <div className="flex flex-col gap-3 rounded-xl border border-[var(--line)] bg-[var(--glass)] p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-[var(--muted)]">This lesson is open to everyone. Sign in only if you want your progress saved.</p>
        <Link href={loginHref} className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-full border border-[rgba(93,240,168,.28)] px-4 text-sm font-medium text-[var(--accent)] transition hover:bg-[rgba(93,240,168,.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]">
          Sign in to save
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[var(--line)] bg-[var(--glass)] p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-[var(--muted)]">{completed ? "This section is marked complete." : "Finished this section? Save your progress."}</p>
      <button type="button" onClick={toggleCompletion} disabled={isPending} aria-pressed={completed} className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent-ink)] transition hover:bg-[var(--accent-2)] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--foreground)]">
        {isPending ? "Saving…" : completed ? "Mark as incomplete" : "Mark complete"}
      </button>
      {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
    </div>
  );
}
