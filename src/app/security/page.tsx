import { MarketingPage } from "@/components/marketing-page"

export default function SecurityPage() {
  return <MarketingPage eyebrow="Legal" title="Built with care for your learning space." description="Security is part of the Nexlearn foundation. We work to protect accounts, learning activity, and the trust behind the platform." sections={[{ title: "Account protection", body: "Authentication and access controls help keep your learning activity private." }, { title: "Responsible operations", body: "We monitor the platform and address issues with care and urgency." }, { title: "Report a concern", body: "Contact the team if you discover a security issue or need assistance." }]} />
}
