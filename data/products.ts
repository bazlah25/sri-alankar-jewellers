export type Product = {
  id: string;
  name: string;
  category: "Necklaces" | "Earrings" | "Rings" | "Bracelets" | "Anklets" | "Sets";
  price: number;
  material: "925 Sterling Silver" | "Silver Plated";
  style: string;
  occasions: string[];
  available: boolean;
  image: string;
  isNew?: boolean;
  isBestseller?: boolean;
  tryOn?: boolean;
  collectionSlugs: string[];
};

export const products: Product[] = [
  {
    id: "petal-bloom-necklace", name: "Petal Bloom Necklace", category: "Necklaces",
    price: 2499, material: "925 Sterling Silver", style: "Minimal", occasions: ["Everyday", "Gifting"],
    available: true, isBestseller: true, image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=85",
    collectionSlugs: ["everyday-edit", "gifting-edit", "timeless-collection"]
  },
  {
    id: "moonlit-studs", name: "Moonlit Studs", category: "Earrings",
    price: 1899, material: "925 Sterling Silver", style: "Floral", occasions: ["Everyday", "Celebration", "Gifting"],
    available: true, isNew: true, tryOn: true, image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=900&q=85",
    collectionSlugs: ["everyday-edit", "celebration-edit", "gifting-edit"]
  },
  {
    id: "everyday-twist-ring", name: "Everyday Twist Ring", category: "Rings",
    price: 1699, material: "925 Sterling Silver", style: "Minimal", occasions: ["Everyday", "Gifting"],
    available: true, image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=85",
    collectionSlugs: ["everyday-edit", "timeless-collection"]
  },
  {
    id: "leaf-bracelet", name: "Leaf Bracelet", category: "Bracelets",
    price: 2299, material: "925 Sterling Silver", style: "Nature-inspired", occasions: ["Everyday", "Celebration"],
    available: true, image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=900&q=85",
    collectionSlugs: ["everyday-edit", "celebration-edit", "silver-wardrobe"]
  },
  {
    id: "classic-hoops", name: "Classic Hoop Earrings", category: "Earrings",
    price: 1999, material: "925 Sterling Silver", style: "Classic", occasions: ["Everyday", "Celebration"],
    available: true, isBestseller: true, tryOn: true, image: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=85",
    collectionSlugs: ["everyday-edit", "statement-edit", "timeless-collection"]
  },
  {
    id: "silver-anklet", name: "Dainty Silver Anklet", category: "Anklets",
    price: 1499, material: "925 Sterling Silver", style: "Minimal", occasions: ["Everyday", "Gifting"],
    available: true, image: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=900&q=85",
    collectionSlugs: ["everyday-edit", "gifting-edit"]
  },
  {
    id: "silver-gift-set", name: "Petal Jewellery Set", category: "Sets",
    price: 3299, material: "925 Sterling Silver", style: "Floral", occasions: ["Celebration", "Gifting"],
    available: true, isNew: true, image: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=900&q=85",
    collectionSlugs: ["celebration-edit", "gifting-edit", "silver-wardrobe"]
  },
  {
    id: "sculpted-ring", name: "Sculpted Statement Ring", category: "Rings",
    price: 2799, material: "Silver Plated", style: "Statement", occasions: ["Celebration"],
    available: true, image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=85",
    collectionSlugs: ["celebration-edit", "statement-edit"]
  },
  {
    id: "silver-chain", name: "Everyday Chain Necklace", category: "Necklaces",
    price: 2199, material: "925 Sterling Silver", style: "Classic", occasions: ["Everyday", "Gifting"],
    available: true, isNew: true, image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=900&q=85",
    collectionSlugs: ["everyday-edit", "gifting-edit", "silver-wardrobe", "timeless-collection"]
  },
  {
    id: "drop-earrings", name: "Silver Drop Earrings", category: "Earrings",
    price: 2599, material: "925 Sterling Silver", style: "Statement", occasions: ["Celebration", "Gifting"],
    available: true, tryOn: true, image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=900&q=85",
    collectionSlugs: ["celebration-edit", "statement-edit", "gifting-edit"]
  },
  {
    id: "silver-bangle", name: "Classic Silver Bangle", category: "Bracelets",
    price: 2499, material: "925 Sterling Silver", style: "Classic", occasions: ["Everyday", "Celebration"],
    available: false, image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=900&q=85",
    collectionSlugs: ["celebration-edit", "timeless-collection"]
  },
  {
    id: "stacking-ring", name: "Silver Stacking Ring", category: "Rings",
    price: 1299, material: "925 Sterling Silver", style: "Minimal", occasions: ["Everyday", "Gifting"],
    available: true, image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=85",
    collectionSlugs: ["everyday-edit", "silver-wardrobe"]
  }
];

export const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);
