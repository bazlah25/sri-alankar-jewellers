import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import OrderTracking from "@/components/OrderTracking";

export const metadata = {
  title: "Track your order | Sri Alankar Jewellers",
  description: "Check the latest status of your Sri Alankar Jewellers order.",
};

export default async function TrackOrderPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order = "" } = await searchParams;
  return <main className="sa-page sa-track-page">
    <SiteHeader />
    <header className="sa-basket-heading"><span className="sa-eyebrow">HERE FOR THE JOURNEY</span><h1>Track your order</h1><p>See the latest update on your Sri Alankar Jewellers order.</p></header>
    <OrderTracking initialOrderId={order}/>
    <SiteFooter />
  </main>;
}
