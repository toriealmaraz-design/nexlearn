import { MarketingPage } from "@/components/marketing-page"

export default function PrivacyPage() {
  return <MarketingPage eyebrow="Legal" title="Privacy, explained clearly." description="Nexlearn respects your information and aims to be transparent about what we collect, why we use it, and how you control it." sections={[{ title: "What we collect", body: "Account details and learning activity needed to provide the Nexlearn experience." }, { title: "How we use it", body: "To operate the platform, improve learning tools, and keep your account secure." }, { title: "Your choices", body: "You can contact us with questions about your information or request account help." }]} />
}
