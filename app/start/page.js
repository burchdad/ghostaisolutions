import { pageMetadata } from "@/lib/seo.mjs";
import Contact from "@/app/contact/page";

export const metadata = pageMetadata("/start", { title: "Website Audit and Project Intake - Ghost AI Solutions", description: "Request a free website audit or tell Ghost AI Solutions about your website, CRM, automation, or custom AI project." });

export default function StartPage() {
  return <Contact />;
}
