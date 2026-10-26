import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SAJ — Silver for Every You",
  description: "Timeless silver jewellery for everyday moments and special milestones.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
