import type { Metadata } from "next";
import "./globals.css";
import { ShopProvider } from "@/components/ShopProvider";
import { ProductCatalogProvider } from "@/components/ProductCatalogProvider";
import { StorefrontImagesProvider } from "@/components/StorefrontImages";

export const metadata: Metadata = {
  title: "Sri Alankar Jewellers — Silver for Every You",
  description: "Timeless silver jewellery for everyday moments and special milestones.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><StorefrontImagesProvider><ProductCatalogProvider><ShopProvider>{children}</ShopProvider></ProductCatalogProvider></StorefrontImagesProvider></body>
    </html>
  );
}
