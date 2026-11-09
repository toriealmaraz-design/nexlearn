import { MarketingPage } from "@/components/marketing-page"

export default function CommunityPage() {
  return <MarketingPage eyebrow="Community" title="Learn together, not alone." description="Share progress, ask better questions, and find the encouragement to keep going with a community built around meaningful growth." sections={[{ title: "Share progress", body: "Celebrate milestones and make your learning visible to the people supporting you." }, { title: "Ask and answer", body: "Turn stuck moments into useful conversations with peers on a similar path." }, { title: "Keep momentum", body: "Small, consistent steps become easier when you are part of something bigger." }]} />
}
