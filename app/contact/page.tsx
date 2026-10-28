import { MapPin, Phone } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

export const metadata = {
  title: "Contact Us | Sri Alankar Jewellers",
  description: "Contact Sri Alankar Jewellers by phone or visit us at Gandhi Bazaar, Hassan.",
};

export default function ContactPage() {
  return <main className="sa-page sa-contact-page">
    <SiteHeader />
    <section className="sa-contact-heading">
      <span className="sa-eyebrow">WE’RE HERE TO HELP</span>
      <h1>Contact us</h1>
      <p>Questions about an order or a piece? We’d be glad to hear from you.</p>
    </section>
    <section className="sa-contact-details" aria-label="Contact information">
      <article>
        <span className="sa-contact-icon"><Phone size={20}/></span>
        <span className="sa-eyebrow">CALL US</span>
        <h2>Speak with our team</h2>
        <a href="tel:+919955067766">+91 99550 67766</a>
      </article>
      <article>
        <span className="sa-contact-icon"><MapPin size={20}/></span>
        <span className="sa-eyebrow">VISIT US</span>
        <h2>Find our store</h2>
        <address><strong>Sri Alankar Jewellers</strong><br/>Gandhi Bazaar, Near Anjaneya Temple,<br/>Opposite Lalitha Bakery,<br/>Hassan – 573201</address>
      </article>
    </section>
    <SiteFooter />
  </main>;
}
