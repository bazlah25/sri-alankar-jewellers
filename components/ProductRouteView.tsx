"use client";

import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import ProductDetailView from "@/components/ProductDetailView";
import { useProductCatalog } from "@/components/ProductCatalogProvider";

export default function ProductRouteView({ slug }: { slug: string }) {
  const { products, loaded } = useProductCatalog();
  const product = products.find(item => item.id === slug);

  if (!product && !loaded) return <main className="sa-page"><SiteHeader/><div className="sa-empty"><p>Loading product…</p></div><SiteFooter/></main>;
  if (!product) return <main className="sa-page"><SiteHeader/><div className="sa-empty"><h1>Product not found</h1><p>This piece may have been removed from the catalogue.</p><Link className="sa-button sa-button-dark" href="/jewellery">SHOP JEWELLERY</Link></div><SiteFooter/></main>;

  return <main className="sa-page"><SiteHeader/><div className="sa-product-breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/jewellery">Jewellery</Link><span>/</span><Link href={`/jewellery/${product.category.toLowerCase()}`}>{product.category}</Link><span>/</span><span>{product.name}</span></div><ProductDetailView product={product}/><section className="sa-product-bottom-note"><p>Silver Beyond Occasions</p><Link href="/jewellery">DISCOVER MORE JEWELLERY</Link></section><SiteFooter/></main>;
}
