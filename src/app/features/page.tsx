import { MarketingPage } from "@/components/marketing-page"

export default function FeaturesPage() {
  return <MarketingPage eyebrow="Platform" title="Everything you need to keep learning moving." description="Nexlearn brings focused tracks, practical lessons, and progress visibility into one calm learning experience." sections={[{ title: "Focused tracks", body: "Follow a clear path from first concept to confident practice without losing the thread." }, { title: "Practical lessons", body: "Build momentum with concise lessons designed to turn ideas into useful skills." }, { title: "Progress that matters", body: "See what you have completed and choose the next best step with confidence." }]} />
}
