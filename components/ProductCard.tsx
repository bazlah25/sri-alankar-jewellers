"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, ScanFace } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/data/products";
import { formatPrice } from "@/data/products";
import { useShop } from "@/components/ShopProvider";

export default function ProductCard({ product }: { product: Product }) {
  const [added, setAdded] = useState(false);
  const { wishlist, toggleWishlist, addToCart } = useShop();
  const favorite = wishlist.includes(product.id);

  return (
    <article className="sa-product-card">
      <div className="sa-product-photo">
        <Link href={`/products/${product.id}`} className="sa-product-photo-link" aria-label={`View ${product.name}`}><Image src={product.image} alt={product.name} fill sizes="(max-width: 650px) 48vw, (max-width: 1000px) 30vw, 22vw" unoptimized /></Link>
        {product.isBestseller && <span className="sa-product-badge">Bestseller</span>}
        {product.isNew && <span className="sa-product-badge sa-new-badge">New In</span>}
        {product.tryOn && <span className="sa-tryon-badge"><ScanFace size={13}/> Virtual Try-On</span>}
        <button className={`sa-heart ${favorite ? "active" : ""}`} onClick={() => toggleWishlist(product.id)} aria-pressed={favorite} aria-label={favorite ? "Remove from wishlist" : "Add to wishlist"}>
          <Heart size={18} fill={favorite ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="sa-product-info">
        <div><h3><Link href={`/products/${product.id}`}>{product.name}</Link></h3><p>{formatPrice(product.price)}</p></div>
        <button className="sa-add" disabled={!product.available} onClick={() => { addToCart(product.id); setAdded(true); window.setTimeout(() => setAdded(false), 1800); }} aria-label={`Add ${product.name} to bag`}>
          <ShoppingBag size={16}/><span>{!product.available ? "Sold out" : added ? "Added" : "Add"}</span>
        </button>
      </div>
      <p className="sa-product-material">{product.material}</p>
    </article>
  );
}
