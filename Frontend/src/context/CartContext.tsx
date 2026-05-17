// src/context/CartContext.tsx

import { createContext, useContext, useEffect, useState } from "react";

export interface CartItem {
  _id: string;
  name: string;
  price: string;
  img: string;
  size: string;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string, size: string) => void;
  updateQty: (id: string, size: string, quantity: number) => void;
  cartCount: number;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("lumielle-cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("lumielle-cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find(
        (p) => p._id === item._id && p.size === item.size
      );
      if (existing) {
        return prev.map((p) =>
          p._id === item._id && p.size === item.size
            ? { ...p, quantity: p.quantity + item.quantity }
            : p
        );
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (id: string, size: string) => {
    setCart((prev) => prev.filter((p) => !(p._id === id && p.size === size)));
  };

  const updateQty = (id: string, size: string, quantity: number) => {
    if (quantity < 1) return;
    setCart((prev) =>
      prev.map((p) =>
        p._id === id && p.size === size ? { ...p, quantity } : p
      )
    );
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};