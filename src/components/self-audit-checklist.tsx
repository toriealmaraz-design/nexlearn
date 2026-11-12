"use client";

import { useState } from "react";

const auditItems = [
  "Private keys and tokens stay on the server, not in browser code.",
  "Every data write checks who is signed in and what they are allowed to change.",
  "Database permissions prevent one user from reading another user’s records.",
  "Production environment variables are set separately from local development.",
  "The deployed app works with a keyboard and on a narrow mobile screen.",
];

export default function SelfAuditChecklist() {
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;

  return (
    <section className="rounded-2xl border border-[rgba(93,240,168,.22)] bg-[rgba(93,240,168,.04)] p-5 sm:p-6" aria-labelledby="self-audit-heading">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.14em] text-[var(--accent)]">Before you ship</p>
          <h2 id="self-audit-heading" className="mt-2 text-xl font-semibold">A quick project self-audit</h2>
        </div>
        <span className="text-sm tabular-nums text-[var(--muted)]">{checkedCount} / {auditItems.length} checked</span>
      </div>
      <fieldset className="mt-5 flex flex-col gap-3">
        <legend className="sr-only">Project launch checks</legend>
        {auditItems.map((item, index) => (
          <label key={item} className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-[var(--muted)]">
            <input
              type="checkbox"
              checked={Boolean(checkedItems[index])}
              onChange={(event) => setCheckedItems((current) => ({ ...current, [index]: event.target.checked }))}
              className="mt-1 size-4 shrink-0 accent-[var(--accent)]"
            />
            <span>{item}</span>
          </label>
        ))}
      </fieldset>
      <p className="mt-4 text-xs leading-5 text-[var(--muted-2)]">Use the checks as a final pass; selections stay in this page and are not saved to your account.</p>
    </section>
  );
}
