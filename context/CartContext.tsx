"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, ProductVariation } from "@/data/products";

export interface CartItem {
  id: string; // Unique composite key e.g. `${product.id}-${variation.color}`
  product: Product;
  quantity: number;
  selectedVariation?: ProductVariation;
  unitPrice: number; // Base product.price + extraCost
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (
    product: Product,
    quantity?: number,
    selectedVariation?: ProductVariation
  ) => void;
  removeFromCart: (identifier: string) => void;
  updateQuantity: (identifier: string, quantity: number) => void;
  clearCart: () => void;
  totalCount: number;
  subtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("uniquehub_cart");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            return parsed.map((item) => ({
              id:
                item.id ||
                (item.selectedVariation
                  ? `${item.product.id}-${item.selectedVariation.color}`
                  : item.product.id),
              product: item.product,
              quantity: item.quantity || 1,
              selectedVariation: item.selectedVariation,
              unitPrice:
                item.unitPrice ||
                item.product.price + (item.selectedVariation?.extraCost || 0),
            }));
          }
        }
      } catch {
        // ignore parse errors
      }
    }
    return [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sync to localStorage when cart items change
  useEffect(() => {
    try {
      localStorage.setItem("uniquehub_cart", JSON.stringify(cartItems));
    } catch {
      // ignore
    }
  }, [cartItems]);

  const addToCart = (
    product: Product,
    quantity: number = 1,
    selectedVariation?: ProductVariation
  ) => {
    // If no variation provided, pick the first available variation if one exists
    const effectiveVariation =
      selectedVariation ||
      (product.variation && product.variation.find((v) => v.isAvailable)) ||
      product.variation?.[0];

    const unitPrice =
      product.price + (effectiveVariation?.extraCost || 0);

    const itemId = effectiveVariation
      ? `${product.id}-${effectiveVariation.color}`
      : product.id;

    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === itemId);
      if (existing) {
        return prev.map((item) =>
          item.id === itemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          id: itemId,
          product,
          quantity,
          selectedVariation: effectiveVariation,
          unitPrice,
        },
      ];
    });
  };

  const removeFromCart = (identifier: string) => {
    setCartItems((prev) =>
      prev.filter(
        (item) => item.id !== identifier && item.product.id !== identifier
      )
    );
  };

  const updateQuantity = (identifier: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(identifier);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === identifier || item.product.id === identifier
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce(
    (acc, item) =>
      acc + (item.unitPrice || item.product.price) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalCount,
        subtotal,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
