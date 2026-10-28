import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import CustomerAccount from "@/components/CustomerAccount";

export const metadata = { title: "My account | Sri Alankar Jewellers" };

export default function CustomerAccountPage() {
  return <main className="sa-page sa-customer-page"><SiteHeader/><header className="sa-basket-heading"><span className="sa-eyebrow">MEMBER DETAILS</span><h1>My account</h1><p>Manage your details and revisit your purchases.</p></header><CustomerAccount/><p className="sa-account-create-prompt">New here? <Link href="/account/signup">Create an account</Link></p><SiteFooter/></main>;
}
