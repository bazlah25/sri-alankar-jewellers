import ProductRouteView from "@/components/ProductRouteView";
import { products } from "@/data/products";

export function generateStaticParams() {
  return products.map(product => ({ slug: product.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = products.find(item => item.id === slug);
  return { title: product ? `${product.name} | Sri Alankar Jewellers` : "Silver Jewellery | Sri Alankar Jewellers" };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ProductRouteView slug={slug}/>;
}
