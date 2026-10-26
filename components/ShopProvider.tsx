"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type CartLine = { productId: string; quantity: number };
type ShopState = {
  cart: CartLine[];
  wishlist: string[];
  cartCount: number;
  addToCart: (productId: string, quantity?: number) => void;
  setCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  toggleWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
};

const ShopContext = createContext<ShopState | null>(null);
const STORAGE_KEY = "saj-shop-state-v1";

export function ShopProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as { cart?: CartLine[]; wishlist?: string[] };
        setCart(Array.isArray(parsed.cart) ? parsed.cart.filter(line => line && typeof line.productId === "string" && Number.isFinite(line.quantity) && line.quantity > 0) : []);
        setWishlist(Array.isArray(parsed.wishlist) ? parsed.wishlist.filter(id => typeof id === "string") : []);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify({ cart, wishlist }));
  }, [cart, wishlist, loaded]);

  const value = useMemo<ShopState>(() => ({
    cart,
    wishlist,
    cartCount: cart.reduce((total, line) => total + line.quantity, 0),
    addToCart: (productId, quantity = 1) => setCart(current => {
      const existing = current.find(line => line.productId === productId);
      return existing
        ? current.map(line => line.productId === productId ? { ...line, quantity: line.quantity + quantity } : line)
        : [...current, { productId, quantity }];
    }),
    setCartQuantity: (productId, quantity) => setCart(current => quantity <= 0
      ? current.filter(line => line.productId !== productId)
      : current.map(line => line.productId === productId ? { ...line, quantity } : line)),
    removeFromCart: productId => setCart(current => current.filter(line => line.productId !== productId)),
    toggleWishlist: productId => setWishlist(current => current.includes(productId) ? current.filter(id => id !== productId) : [...current, productId]),
    removeFromWishlist: productId => setWishlist(current => current.filter(id => id !== productId)),
  }), [cart, wishlist]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const value = useContext(ShopContext);
  if (!value) throw new Error("useShop must be used within ShopProvider");
  return value;
}
