import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import CustomerAccountForm from "@/components/CustomerAccountForm";

export const metadata = { title: "Create an account | Sri Alankar Jewellers" };

export default function CustomerSignupPage() {
  return <main className="sa-page sa-customer-page"><SiteHeader/><header className="sa-basket-heading"><span className="sa-eyebrow">A MORE PERSONAL EXPERIENCE</span><h1>Create your account</h1><p>Save your details and keep your order history together.</p></header><section className="sa-customer-card"><CustomerAccountForm mode="signup"/><Link className="sa-customer-back" href="/">Back to the store</Link></section><SiteFooter/></main>;
}
