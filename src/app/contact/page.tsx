import { MarketingPage } from "@/components/marketing-page"

export default function ContactPage() {
  return <MarketingPage eyebrow="Contact" title="We would love to hear from you." description="Have a question, idea, or partnership in mind? Reach out and the Nexlearn team will help point you in the right direction." sections={[{ title: "Learner support", body: "Get help choosing a track or making the most of your learning plan." }, { title: "Partnerships", body: "Talk with us about bringing focused learning to your community or team." }, { title: "Feedback", body: "Tell us what would make Nexlearn more useful for your goals." }]} />
}
