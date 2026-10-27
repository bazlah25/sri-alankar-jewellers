import Image from "next/image";
import Link from "next/link";

const categories = [
  { name: "Necklaces", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=700&q=85" },
  { name: "Earrings", image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=700&q=85" },
  { name: "Rings", image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=700&q=85" },
  { name: "Bracelets", image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=700&q=85" },
  { name: "Photo Frames", image: "/categories/photo-frames-category.jpg" },
  { name: "Pooja Essentials", image: "/categories/pooja-essentials-category.jpg" }
];

export default function CategoryCard({ category }: { category: string }) {
  const item = categories.find(c => c.name === category);
  if (!item) return null;
  const href = category === "Photo Frames" ? "/jewellery/photo-frames" : category === "Pooja Essentials" ? "/jewellery/pooja-essentials" : `/jewellery?category=${encodeURIComponent(category)}`;
  return (
    <Link href={href} className="sa-category-card">
      <div className="sa-category-image"><Image src={item.image} alt={item.name} fill sizes="(max-width: 650px) 30vw, 16vw" unoptimized /></div>
      <span>{item.name}</span>
    </Link>
  );
}
