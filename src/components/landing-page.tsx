import { landingMarkup } from "@/components/landing-markup";

export default function LandingPage() {
  return <div dangerouslySetInnerHTML={{ __html: landingMarkup }} />;
}
