"use client";

import type { MouseEvent, KeyboardEvent, ReactNode } from "react";
import { useRouter } from "next/navigation";

export default function ProductCardLink({ productId, productName, children }: { productId: string; productName: string; children: ReactNode }) {
  const router = useRouter();
  const openProduct = (event: MouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button, a, input, select")) return;
    router.push(`/products/${productId}`);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      router.push(`/products/${productId}`);
    }
  };
  return <div className="sa-product-card-link" role="link" tabIndex={0} aria-label={`View ${productName}`} onClick={openProduct} onKeyDown={onKeyDown}>{children}</div>;
}
