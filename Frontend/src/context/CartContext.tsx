// src/context/CartContext.tsx
//
// Strategy:
//  - Guests:        cart is EMPTY — must log in to use cart
//  - Logged-in:     cart is synced to /api/cart on every meaningful change
//                   and loaded from the server on mount / login
//  - On logout:     clear in-memory cart (server copy is preserved for next login)

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface CartItem {
  _id:      string; // product mongo ID
  name:     string;
  price:    string; // "₹1,200" format
  img:      string;
  size:     string;
  quantity: number;
}

interface CartContextValue {
  cart:           CartItem[];
  addToCart:      (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeFromCart: (id: string, size: string) => void;
  updateQty:      (id: string, size: string, qty: number) => void;
  clearCart:      () => Promise<void>;
  cartLoading:    boolean;
}

// ── Context ───────────────────────────────────────────────────────────────────
const CartContext = createContext<CartContextValue | null>(null);

export const useCart = (): CartContextValue => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};

// ── Provider ──────────────────────────────────────────────────────────────────
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  const API_BASE   = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const [cart, setCartRaw]     = useState<CartItem[]>([]);
  const [cartLoading, setCartLoading] = useState(false);

  // Ref so sync callbacks always see the latest token without causing re-renders
  const tokenRef = useRef(token);
  useEffect(() => { tokenRef.current = token; }, [token]);

  // ── Server helpers ───────────────────────────────────────────────────────
  const serverFetch = useCallback(async (): Promise<CartItem[]> => {
    const res  = await fetch(`${API_BASE}/api/cart`, {
      headers: { Authorization: `Bearer ${tokenRef.current}` },
    });
    const data = await res.json() as { items: CartItem[] };
    return data.items ?? [];
  }, [API_BASE]);

  const serverSync = useCallback(async (items: CartItem[]) => {
    if (!tokenRef.current) return;
    const payload = items.map(({ _id, name, price, img, size, quantity }) => ({
      productId: _id, name, price, img, size, quantity,
    }));
    await fetch(`${API_BASE}/api/cart`, {
      method:  "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenRef.current}`,
      },
      body: JSON.stringify({ items: payload }),
    });
  }, [API_BASE]);

  // ── On mount / token change ──────────────────────────────────────────────
  useEffect(() => {
    if (!token) {
      // Guest: cart is always empty — login required
      setCartRaw([]);
      return;
    }

    // Logged in: fetch server cart
    setCartLoading(true);
    serverFetch()
      .then((serverItems) => {
        setCartRaw(serverItems);
      })
      .catch(() => {
        setCartRaw([]);
      })
      .finally(() => setCartLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // ── Debounced server sync on cart changes ────────────────────────────────
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setCart = useCallback((updater: CartItem[] | ((prev: CartItem[]) => CartItem[])) => {
    setCartRaw((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;

      if (tokenRef.current) {
        // Debounce to avoid hammering the API on rapid qty changes
        if (syncTimer.current) clearTimeout(syncTimer.current);
        syncTimer.current = setTimeout(() => {
          serverSync(next).catch(console.error);
        }, 600);
      }
      // Guests: no-op (cart stays empty, no localStorage)

      return next;
    });
  }, [serverSync]);

  // ── Actions ──────────────────────────────────────────────────────────────
  const addToCart = useCallback(
    (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
      // Silently ignore if not logged in — callers should check token first
      if (!tokenRef.current) return;

      setCart((prev) => {
        const existing = prev.find(
          (i) => i._id === item._id && i.size === item.size
        );
        if (existing) {
          return prev.map((i) =>
            i._id === item._id && i.size === item.size
              ? { ...i, quantity: i.quantity + (item.quantity ?? 1) }
              : i
          );
        }
        return [...prev, { ...item, quantity: item.quantity ?? 1 }];
      });
    },
    [setCart]
  );

  const removeFromCart = useCallback(
    (id: string, size: string) => {
      setCart((prev) => prev.filter((i) => !(i._id === id && i.size === size)));
    },
    [setCart]
  );

  const updateQty = useCallback(
    (id: string, size: string, qty: number) => {
      if (qty <= 0) {
        removeFromCart(id, size);
        return;
      }
      setCart((prev) =>
        prev.map((i) =>
          i._id === id && i.size === size ? { ...i, quantity: qty } : i
        )
      );
    },
    [setCart, removeFromCart]
  );

  const clearCart = useCallback(async () => {
    setCartRaw([]);
    if (tokenRef.current) {
      await fetch(`${API_BASE}/api/cart`, {
        method:  "DELETE",
        headers: { Authorization: `Bearer ${tokenRef.current}` },
      }).catch(console.error);
    }
  }, [API_BASE]);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQty, clearCart, cartLoading }}
    >
      {children}
    </CartContext.Provider>
  );
};