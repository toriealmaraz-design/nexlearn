import { MarketingPage } from "@/components/marketing-page"

export default function MissionPage() {
  return <MarketingPage eyebrow="Our mission" title="Make meaningful learning feel possible." description="Nexlearn exists to make high-quality learning more focused, more human, and easier to carry into everyday life." sections={[{ title: "Clarity over noise", body: "We remove friction so your attention stays on the ideas that matter." }, { title: "Progress over perfection", body: "A durable learning habit is built one honest step at a time." }, { title: "People at the center", body: "Technology should support curiosity, confidence, and connection." }]} />
}
