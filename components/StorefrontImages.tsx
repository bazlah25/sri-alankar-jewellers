"use client";

import Image from "next/image";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

type HeroAsset = { desktop?: string; mobile?: string };
type ImageMap = Record<string, HeroAsset | string>;
type StorefrontImagesState = { images: ImageMap; updateImage: (key: string, viewport: "desktop" | "mobile", image: string) => Promise<void> };
const StorefrontImagesContext = createContext<StorefrontImagesState | null>(null);

export function StorefrontImagesProvider({ children }: { children: ReactNode }) {
  const [images, setImages] = useState<ImageMap>({});
  const pathname = usePathname();
  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const response = await fetch("/api/storefront-images", { cache: "no-store" });
        const result = response.ok ? await response.json() : null;
        if (active) setImages(result?.configured && result.images ? result.images : {});
      } catch { /* Keep the last successfully loaded image settings during a temporary network error. */ }
    };
    const refreshWhenVisible = () => { if (document.visibilityState === "visible") void refresh(); };
    void refresh();
    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      active = false;
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [pathname]);
  const updateImage = async (key: string, viewport: "desktop" | "mobile", image: string) => {
    const response = await fetch("/api/storefront-images", {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key, viewport, image }),
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

export function StorefrontHeroImage({ imageKey, alt, fallbackSrc, priority = false, className = "", sizes = "100vw" }: {
  imageKey: string; alt: string; fallbackSrc?: string; priority?: boolean; className?: string; sizes?: string;
}) {
  const { images } = useStorefrontImages();
  const saved = images[imageKey];
  const desktop = typeof saved === "string" ? saved : saved?.desktop;
  const mobile = typeof saved === "string" ? saved : saved?.mobile;
  const src = desktop || mobile || fallbackSrc;
  if (!src) return null;
  return <picture className={`sa-managed-hero-picture ${className}`}>
    {mobile && <source media="(max-width: 700px)" srcSet={mobile} />}
    <Image src={src} alt={alt} fill priority={priority} sizes={sizes} unoptimized className="sa-managed-hero-image" />
  </picture>;
}
