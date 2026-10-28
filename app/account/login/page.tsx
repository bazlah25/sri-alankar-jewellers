import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import CustomerAccountForm from "@/components/CustomerAccountForm";

export const metadata = { title: "Sign in | Sri Alankar Jewellers" };

export default function CustomerLoginPage() {
  return <main className="sa-page sa-customer-page"><SiteHeader/><header className="sa-basket-heading"><span className="sa-eyebrow">WELCOME BACK</span><h1>Sign in</h1><p>Access your details and order updates.</p></header><section className="sa-customer-card"><CustomerAccountForm mode="login"/><Link className="sa-customer-back" href="/">Back to the store</Link></section><SiteFooter/></main>;
}
