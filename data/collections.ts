export type Collection = {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  image: string;
  intro: string;
};

export const collections: Collection[] = [
  {
    slug: "everyday-edit", title: "The Everyday Edit",
    tagline: "Your everyday, made extraordinary.",
    description: "Light, versatile silver pieces that move effortlessly from morning plans to evening moments.",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1400&q=85",
    intro: "Discover your everyday favourites: delicate chains, subtle hoops, and rings made to become part of your signature."
  },
  {
    slug: "celebration-edit", title: "The Celebration Edit",
    tagline: "For moments worth remembering.",
    description: "Expressive silver designs for festivals, dinners, celebrations, and milestones.",
    image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=1400&q=85",
    intro: "Find pieces with a little extra presence for the moments you want to remember."
  },
  {
    slug: "gifting-edit", title: "The Gifting Edit",
    tagline: "Give something meaningful.",
    description: "Thoughtful jewellery for birthdays, anniversaries, graduations, and just-because moments.",
    image: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=1400&q=85",
    intro: "Choose a keepsake for someone special, with options across styles and budgets."
  },
  {
    slug: "statement-edit", title: "The Statement Edit",
    tagline: "Designed to stand out.",
    description: "Sculptural rings and distinctive earrings for a look that feels unmistakably yours.",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1400&q=85",
    intro: "Explore standout silhouettes and modern details that bring personality to your look."
  },
  {
    slug: "silver-wardrobe", title: "The Silver Wardrobe",
    tagline: "Pieces that belong together.",
    description: "Coordinated jewellery combinations that make building a complete look simple.",
    image: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=1400&q=85",
    intro: "Mix, match, and build a jewellery wardrobe that feels cohesive without being too coordinated."
  },
  {
    slug: "timeless-collection", title: "The Timeless Collection",
    tagline: "Made to be worn, loved, and worn again.",
    description: "Classic silver essentials designed to feel relevant season after season.",
    image: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1400&q=85",
    intro: "Meet enduring shapes and versatile details you can return to for years to come."
  }
];
