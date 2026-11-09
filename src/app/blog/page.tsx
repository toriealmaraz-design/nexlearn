import { MarketingPage } from "@/components/marketing-page"

export default function BlogPage() {
  return <MarketingPage eyebrow="Blog" title="Ideas for learning with intention." description="Notes on building better learning habits, choosing useful practice, and making steady progress." sections={[{ title: "Learning habits", body: "Simple systems for making learning a consistent part of your week." }, { title: "Skill building", body: "Practical guidance for turning curiosity into capability." }, { title: "Nexlearn notes", body: "Product updates and stories from the people building and using Nexlearn." }]} />
}
