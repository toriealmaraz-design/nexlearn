import { MarketingPage } from "@/components/marketing-page"

export default function TermsPage() {
  return <MarketingPage eyebrow="Legal" title="Clear terms for a focused learning space." description="These terms describe the fair, responsible use of Nexlearn and the responsibilities we share as a learning community." sections={[{ title: "Your account", body: "Keep your account information accurate and protect your sign-in details." }, { title: "Your content", body: "You retain responsibility for the material and conversations you contribute." }, { title: "Using Nexlearn", body: "Use the platform lawfully and help keep it useful, respectful, and secure." }]} />
}
