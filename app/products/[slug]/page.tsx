import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import ProductDetailView from "@/components/ProductDetailView";
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
  const product = products.find(item => item.id === slug);
  if (!product) notFound();
  return <main className="sa-page"><SiteHeader/><div className="sa-product-breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/jewellery">Jewellery</Link><span>/</span><Link href={`/jewellery/${product.category.toLowerCase()}`}>{product.category}</Link><span>/</span><span>{product.name}</span></div><ProductDetailView product={product}/><section className="sa-product-bottom-note"><p>Silver Beyond Occasions</p><Link href="/jewellery">DISCOVER MORE JEWELLERY</Link></section><SiteFooter/></main>;
}
