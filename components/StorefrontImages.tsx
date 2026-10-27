"use client";

import Image from "next/image";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type ImageMap = Record<string, string>;
type StorefrontImagesState = { images: ImageMap; updateImage: (key: string, image: string) => Promise<void> };
const StorefrontImagesContext = createContext<StorefrontImagesState | null>(null);

export function StorefrontImagesProvider({ children }: { children: ReactNode }) {
  const [images, setImages] = useState<ImageMap>({});
  useEffect(() => {
    fetch("/api/storefront-images", { cache: "no-store" })
      .then(async response => response.ok ? response.json() : null)
      .then(result => { if (result?.configured && result.images) setImages(result.images); })
      .catch(() => undefined);
  }, []);
  const updateImage = async (key: string, image: string) => {
    const response = await fetch("/api/storefront-images", {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key, image }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Could not save this image.");
    setImages(result.images || {});
  };
  return <StorefrontImagesContext.Provider value={{ images, updateImage }}>{children}</StorefrontImagesContext.Provider>;
}

export function useStorefrontImages() {
  const value = useContext(StorefrontImagesContext);
  if (!value) throw new Error("useStorefrontImages must be used within StorefrontImagesProvider");
  return value;
}

export function StorefrontHeroImage({ imageKey, fallbackSrc, alt, priority = false }: {
  imageKey: string; fallbackSrc: string; alt: string; priority?: boolean;
}) {
  const { images } = useStorefrontImages();
  return <Image src={images[imageKey] || fallbackSrc} alt={alt} fill priority={priority} sizes="100vw" unoptimized className="sa-managed-hero-image" />;
}
