import Link from "next/link"

type MarketingPageProps = {
  eyebrow: string
  title: string
  description: string
  sections: { title: string; body: string }[]
}

export function MarketingPage({ eyebrow, title, description, sections }: MarketingPageProps) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-lg font-semibold tracking-tight">Nexlearn</Link>
          <nav className="flex items-center gap-5 text-sm text-nex-muted">
            <Link href="/features" className="hover:text-foreground">Features</Link>
            <Link href="/tracks" className="hover:text-foreground">Tracks</Link>
            <Link href="/community" className="hover:text-foreground">Community</Link>
            <Link href="/login" className="rounded-full border border-accent/40 px-4 py-2 text-accent hover:bg-accent/10">Sign in</Link>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-6 py-20">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-accent">{eyebrow}</p>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">{title}</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-nex-muted">{description}</p>
        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {sections.map((section) => (
            <section key={section.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="text-lg font-semibold">{section.title}</h2>
              <p className="mt-3 text-sm leading-6 text-nex-muted">{section.body}</p>
            </section>
          ))}
        </div>
        <Link href="/tracks" className="mt-12 inline-flex rounded-full bg-accent px-5 py-3 font-semibold text-accent-ink hover:bg-accent/90">Explore learning tracks</Link>
      </div>
    </main>
  )
}
