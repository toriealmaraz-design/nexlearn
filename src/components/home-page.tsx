import Link from "next/link";
import { CURRICULUM_PHASES } from "@/lib/curriculum-phases";
import type { TrackWithLessons } from "@/lib/learning";
import TrackCard from "@/components/track-card";

type HomePageProps = {
  curriculum: TrackWithLessons[] | null;
};

export default function HomePage({ curriculum }: HomePageProps) {
  const publishedTracks = curriculum?.filter((item) => item.lessons.length > 0) ?? [];
  const moduleCount = curriculum === null ? null : publishedTracks.reduce((total, item) => total + item.lessons.length, 0);

  return (
    <div>
      <section className="mx-auto grid max-w-6xl gap-12 px-4 pb-20 pt-16 sm:pt-24 lg:grid-cols-[1.1fr_.9fr] lg:items-end lg:pb-24">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-[var(--accent)]">
            Free, practical learning · No signup wall
          </p>
          <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl lg:text-6xl">
            Go from first build to a safer launch.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-[var(--muted)] sm:text-lg">
            Build useful things with AI, learn to debug them, and understand the security and deployment steps that make them ready for the real world.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="#tracks"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--accent)] px-6 text-sm font-semibold text-[var(--accent-ink)] transition hover:bg-[var(--accent-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--foreground)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
            >
              Browse open lessons <span className="ml-2" aria-hidden="true">→</span>
            </Link>
            <Link
              href="/login"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--line-strong)] px-5 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              Sign in to save progress
            </Link>
          </div>
        </div>

        <aside className="rounded-2xl border border-[var(--line)] bg-[var(--glass)] p-6 sm:p-7" aria-label="NexLearn at a glance">
          <p className="text-xs font-semibold uppercase tracking-[.15em] text-[var(--muted-2)]">The short version</p>
          <ul className="mt-5 divide-y divide-[var(--line)]">
            <li className="flex items-baseline justify-between gap-4 py-4 first:pt-0">
              <span className="text-sm text-[var(--muted)]">Published learning tracks</span>
              <span className="text-2xl font-semibold tabular-nums text-[var(--foreground)]">{curriculum === null ? "—" : publishedTracks.length}</span>
            </li>
            <li className="flex items-baseline justify-between gap-4 py-4">
              <span className="text-sm text-[var(--muted)]">Open modules</span>
              <span className="text-2xl font-semibold tabular-nums text-[var(--foreground)]">{moduleCount ?? "—"}</span>
            </li>
            <li className="flex items-baseline justify-between gap-4 py-4 last:pb-0">
              <span className="text-sm text-[var(--muted)]">Progress tracking</span>
              <span className="text-sm font-medium text-[var(--accent)]">Optional</span>
            </li>
          </ul>
          <p className="mt-5 border-t border-[var(--line)] pt-4 text-xs leading-5 text-[var(--muted-2)]">
            NexLearn lessons are open to read. Some linked resources may be hosted by third parties.
          </p>
        </aside>
      </section>

      <section className="border-y border-[var(--line)] bg-[rgba(12,18,38,.3)]" aria-labelledby="route-heading">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:py-16">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.16em] text-[var(--accent)]">A useful route, not a gate</p>
              <h2 id="route-heading" className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Five stages. Learn what you need next.</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-[var(--muted)]">
              Modules are grouped by phase and released from the Presentation Engine. Start anywhere; there is no locked sequence.
            </p>
          </div>
          <ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {CURRICULUM_PHASES.map((phase, index) => (
              <li key={phase.id} className="rounded-xl border border-[var(--line)] bg-[var(--background)]/70 p-4">
                <span className="text-xs font-medium tabular-nums text-[var(--accent)]">0{index + 1}</span>
                <h3 className="mt-3 text-sm font-semibold text-[var(--foreground)]">{phase.label}</h3>
                <p className="mt-2 text-xs leading-5 text-[var(--muted-2)]">{phase.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="tracks" className="mx-auto max-w-6xl px-4 py-16 sm:py-20" aria-labelledby="tracks-heading">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.16em] text-[var(--accent)]">Open curriculum</p>
            <h2 id="tracks-heading" className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Choose a path. Start with a real lesson.</h2>
          </div>
          <Link href="/tracks" className="text-sm font-medium text-[var(--muted)] underline decoration-[var(--line-strong)] underline-offset-4 transition hover:text-[var(--accent)]">
            View all tracks
          </Link>
        </div>

        {curriculum === null ? (
          <div className="mt-8 rounded-2xl border border-dashed border-[var(--line-strong)] px-6 py-10 text-center">
            <p className="font-medium text-[var(--foreground)]">The curriculum is temporarily unavailable.</p>
            <p className="mt-2 text-sm text-[var(--muted)]">Please try again in a moment.</p>
          </div>
        ) : publishedTracks.length > 0 ? (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {publishedTracks.map((item) => <TrackCard key={item.track.id} item={item} />)}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-[var(--line-strong)] px-6 py-10 text-center">
            <p className="font-medium text-[var(--foreground)]">No public modules are published yet.</p>
            <p className="mt-2 text-sm text-[var(--muted)]">New lessons will appear here as soon as they are published.</p>
          </div>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20" aria-labelledby="audit-heading">
        <div className="flex flex-col gap-4 rounded-2xl border border-[var(--line)] bg-[var(--glass)] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.16em] text-[var(--accent)]">The part most tutorials skip</p>
            <h2 id="audit-heading" className="mt-3 text-xl font-semibold tracking-tight sm:text-2xl">Build it. Then check what you shipped.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Technical modules finish with a short project audit: secrets, access rules, deployment settings, and the mobile experience.
            </p>
          </div>
          <Link href="#tracks" className="inline-flex min-h-10 shrink-0 items-center text-sm font-semibold text-[var(--accent)] underline decoration-[rgba(93,240,168,.35)] underline-offset-4">
            Explore the curriculum <span className="ml-2" aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
