"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Heart, Minus, Plus, ShoppingBag } from "lucide-react";
import type { Product } from "@/data/products";
import { formatPrice } from "@/data/products";
import { useShop } from "@/components/ShopProvider";
import VirtualTryOnExperience from "@/components/VirtualTryOnExperience";

const descriptions: Record<Product["category"], string> = {
  Necklaces: "A considered silver necklace designed to bring meaning to everyday moments and special occasions alike.",
  Earrings: "Thoughtfully finished silver earrings made to feel effortless from day to evening.",
  Rings: "A timeless silver ring with a considered shape and an easy, comfortable feel.",
  Bracelets: "A delicate silver bracelet made to be worn on its own or layered with your favourites.",
  Bangles: "A silver bangle designed to add a graceful finishing touch to your look.",
  Chains: "A versatile silver chain made for everyday wear and personal styling.",
  Kadas: "A distinctive silver kada with a confident, timeless finish.",
  "Photo Frames": "A silver photo frame made to keep a favourite memory close and beautifully displayed.",
  "Pooja Essentials": "Silver pooja essentials, thoughtfully crafted for meaningful rituals and celebrations.",
};

export default function ProductDetailView({ product }: { product: Product }) {
  const descriptionPoints = (product.description || descriptions[product.category])
    .split(/\r?\n/)
    .map(point => point.replace(/^\s*[-•]\s*/, "").trim())
    .filter(Boolean);
  const uploadedGallery = (product.images || []).filter(Boolean);
  const gallery = uploadedGallery.length ? uploadedGallery : [product.image];
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedRingSize, setSelectedRingSize] = useState("");
  const [notice, setNotice] = useState("");
  const { wishlist, toggleWishlist, addToCart } = useShop();
  const saved = wishlist.includes(product.id);
  const [pincode, setPincode] = useState("");
  const [pincodeMessage, setPincodeMessage] = useState("");
  const [reviewName, setReviewName] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState("5");
  const [reviews, setReviews] = useState<Array<{ name: string; text: string; rating: number }>>([]);

  useEffect(() => { setActiveImage(0); setSelectedRingSize(""); }, [product.id]);
  const ringSizes = product.category === "Rings" ? product.ringSizes || [] : [];
  const requiresRingSize = ringSizes.length > 0;

  const checkPincode = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPincodeMessage(/^\d{6}$/.test(pincode.trim())
      ? "This looks like a valid 6-digit pincode. Live delivery availability and dates are not connected yet."
      : "Enter a valid 6-digit pincode.");
  };

  const submitReview = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setReviews(current => [{ name: reviewName.trim(), text: reviewText.trim(), rating: Number(reviewRating) }, ...current]);
    setReviewName("");
    setReviewText("");
  };

  return <>
  <section className="sa-product-detail">
    <div className="sa-product-gallery">
      <div className="sa-product-main-image"><Image src={gallery[activeImage]} alt={`${product.name}, view ${activeImage + 1}`} fill priority sizes="(max-width: 700px) 100vw, 52vw" unoptimized/></div>
      <div className="sa-product-thumbnails" aria-label="More product images">{gallery.map((src, index) => <button key={`${product.id}-${index}`} type="button" className={activeImage === index ? "active" : ""} aria-label={`Show product image ${index + 1}`} aria-pressed={activeImage === index} onClick={() => setActiveImage(index)}><Image src={src} alt="" fill sizes="90px" unoptimized/></button>)}</div>
    </div>
    <div className="sa-product-detail-copy">
      <span className="sa-eyebrow">{product.category} · {product.material}</span>
      <h1>{product.name}</h1>
      <p className="sa-product-detail-price">{formatPrice(product.price)}</p>
      <p className="sa-product-material-detail">{product.material === "925 Sterling Silver" ? "925 Sterling Silver · Solid sterling silver" : "Silver plated"}</p>
      <VirtualTryOnExperience product={product}/>
      {requiresRingSize && <fieldset className="sa-ring-size-picker"><legend>Choose ring size</legend><div>{ringSizes.map(size => <button key={size} type="button" className={selectedRingSize === size ? "selected" : ""} aria-pressed={selectedRingSize === size} onClick={() => setSelectedRingSize(size)}>{size}</button>)}</div>{!selectedRingSize && <small>Select a size to add this ring to your bag.</small>}</fieldset>}
      <div className="sa-product-purchase-row"><div className="sa-quantity-control" aria-label="Quantity"><button type="button" aria-label="Decrease quantity" disabled={quantity <= 1} onClick={() => setQuantity(value => Math.max(1, value - 1))}><Minus size={14}/></button><span>{quantity}</span><button type="button" aria-label="Increase quantity" onClick={() => setQuantity(value => value + 1)}><Plus size={14}/></button></div><button type="button" className="sa-product-add" disabled={!product.available || (requiresRingSize && !selectedRingSize)} onClick={() => { addToCart(product.id, quantity, selectedRingSize || undefined); setNotice(`${quantity} × ${product.name}${selectedRingSize ? ` (size ${selectedRingSize})` : ""} added to your demo bag.`); }}><ShoppingBag size={16}/>{product.available ? "ADD TO BAG" : "SOLD OUT"}</button><button type="button" className={`sa-product-wishlist ${saved ? "active" : ""}`} aria-label={saved ? "Remove from wishlist" : "Add to wishlist"} aria-pressed={saved} onClick={() => toggleWishlist(product.id)}><Heart size={18} fill={saved ? "currentColor" : "none"}/></button></div>
      {notice && <p className="sa-product-notice" role="status">{notice}</p>}
      <form className="sa-pincode-check" onSubmit={checkPincode}>
        <label htmlFor="delivery-pincode">Check delivery availability</label>
        <div><input id="delivery-pincode" inputMode="numeric" autoComplete="postal-code" maxLength={6} value={pincode} onChange={event => { setPincode(event.target.value.replace(/\D/g, "")); setPincodeMessage(""); }} placeholder="Enter 6-digit pincode"/><button type="submit">CHECK</button></div>
        {pincodeMessage && <p role="status">{pincodeMessage}</p>}
      </form>
      <div className="sa-product-promises"><p>925 silver craftsmanship</p><p>Gift-ready packaging</p><p>Easy returns</p></div>
      <details className="sa-product-information"><summary>Product details</summary><ul className="sa-product-detail-points">{descriptionPoints.map((point, index) => <li key={`${index}-${point}`}>{point}</li>)}</ul></details>
      <details className="sa-product-information"><summary>Shipping & returns</summary><p>Shipping and return policies can be confirmed at checkout once the store is connected to an ecommerce service.</p></details>
      <p className="sa-demo-disclaimer">Demo storefront: bag, wishlist, inventory, and checkout are not connected to a live store.</p>
    </div>
  </section>
  <section className="sa-customer-reviews">
    <div className="sa-review-heading"><span className="sa-eyebrow">YOUR EXPERIENCE MATTERS</span><h2>Customer reviews</h2><p>Reviews for {product.name}</p></div>
    <div className="sa-review-content">
      <div className="sa-review-list">{reviews.length ? reviews.map((review, index) => <article className="sa-review-card" key={`${review.name}-${index}`}><div className="sa-review-stars" aria-label={`${review.rating} out of 5 stars`}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</div><h3>{review.name}</h3><p>{review.text}</p><small>Demo review · visible only in this session</small></article>) : <p className="sa-no-reviews">No reviews yet. Be the first to share your experience.</p>}</div>
      <form className="sa-review-form" onSubmit={submitReview}><h3>Write a review</h3><label>Your name<input required value={reviewName} onChange={event => setReviewName(event.target.value)} maxLength={60}/></label><label>Rating<select value={reviewRating} onChange={event => setReviewRating(event.target.value)}><option value="5">5 — Excellent</option><option value="4">4 — Very good</option><option value="3">3 — Good</option><option value="2">2 — Fair</option><option value="1">1 — Poor</option></select></label><label>Your review<textarea required rows={4} value={reviewText} onChange={event => setReviewText(event.target.value)} maxLength={1000}/></label><button type="submit">SUBMIT REVIEW</button><small>Demo only: reviews are not saved or published.</small></form>
    </div>
  </section>
  </>;
}
