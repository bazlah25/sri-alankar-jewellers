import Image from "next/image";
import Link from "next/link";
import type { Collection } from "@/data/collections";
import { ArrowRight } from "lucide-react";

export default function CollectionCard({ collection, featured = false }: { collection: Collection; featured?: boolean }) {
  return (
    <article className={`sa-collection-card ${featured ? "sa-collection-featured" : ""}`}>
      <Link href={`/collections/${collection.slug}`} className="sa-collection-photo">
        <Image src={collection.image} alt={collection.title} fill sizes={featured ? "100vw" : "(max-width: 650px) 90vw, 45vw"} unoptimized />
        <span className="sa-collection-photo-label">SRI ALANKAR JEWELLERS</span>
      </Link>
      <div className="sa-collection-info">
        <div><h2>{collection.title}</h2><p className="sa-collection-tagline">{collection.tagline}</p><p>{collection.description}</p></div>
        <Link className="sa-text-link" href={`/collections/${collection.slug}`}>DISCOVER COLLECTION <ArrowRight size={15}/></Link>
      </div>
    </article>
  );
}
