import Link from "next/link";
import type { TrackWithLessons } from "@/lib/learning";
import { getCurriculumPhase } from "@/lib/curriculum-phases";

type TrackCardProps = {
  item: TrackWithLessons;
};

export default function TrackCard({ item }: TrackCardProps) {
  const firstLesson = item.lessons[0];
  const phaseCount = new Set(item.lessons.map((lesson) => lesson.phase)).size;
  const href = firstLesson
    ? `/tracks/${item.track.id}/lessons/${firstLesson.id}`
    : `/tracks/${item.track.id}`;
  const firstPhase = firstLesson ? getCurriculumPhase(firstLesson.phase) : null;

  return (
    <Link
      href={href}
      className="group flex min-h-64 flex-col rounded-2xl border border-[var(--line)] bg-[var(--glass)] p-6 transition hover:border-[rgba(93,240,168,.38)] hover:bg-[var(--glass-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full border border-[var(--line-strong)] px-3 py-1 text-xs font-medium text-[var(--muted)]">
          {item.track.trackType === "internal" ? "Technical & AI" : "Marketing & growth"}
        </span>
        <span className="text-xs text-[var(--muted-2)]">
          {item.lessons.length} {item.lessons.length === 1 ? "module" : "modules"}
        </span>
      </div>

      <h3 className="mt-6 text-xl font-semibold tracking-tight text-[var(--foreground)] transition group-hover:text-[var(--accent)]">
        {item.track.title}
      </h3>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-[var(--muted)]">
        {item.track.description || "A practical, self-paced path. Open any published module and learn at your own pace."}
      </p>

      <div className="mt-auto flex items-end justify-between gap-4 pt-6">
        <div className="min-w-0">
          {firstLesson ? (
            <>
              <span className="block text-xs text-[var(--muted-2)]">
                Start with · {firstPhase?.label}
              </span>
              <span className="mt-1 block truncate text-sm font-medium text-[var(--foreground)]">
                {firstLesson.title}
              </span>
            </>
          ) : (
            <span className="text-xs text-[var(--muted-2)]">No published modules yet</span>
          )}
        </div>
        <span className="shrink-0 text-xs text-[var(--muted-2)]">
          {phaseCount} {phaseCount === 1 ? "phase" : "phases"} <span aria-hidden="true">→</span>
        </span>
      </div>
    </Link>
  );
}
