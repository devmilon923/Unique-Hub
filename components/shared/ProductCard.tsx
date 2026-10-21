"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <Link
      href={`/products/${product.id}`}
      className={cn(
        "group flex flex-col transition-all duration-200 cursor-pointer block",
        className
      )}
    >
      {/* 1. Image / Minimal Product Visual (4:3 Ratio) */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-neutral-100 border border-neutral-200/70 flex items-center justify-center transition-all duration-300 ease-out group-hover:border-neutral-300 group-hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
        {/* Transparent Frosted Pre-Order Badge */}
        {product.isPreOrder && (
          <span className="absolute top-2 left-2 z-10 inline-flex items-center gap-1.5 rounded-full bg-white/70 backdrop-blur-md border border-white/80 px-2 py-0.5 text-[9px] sm:text-[10px] font-medium tracking-wide text-neutral-800 shadow-[0_1px_4px_rgba(0,0,0,0.04)] pointer-events-none">
            <span className="size-1 rounded-full bg-neutral-700" />
            <span>Pre-Order</span>
          </span>
        )}

        {/* Real Product Image with Next.js Image optimization */}
        <Image
          src={product.image || product.variation?.[0]?.imagePath || "/placeholder-product.svg"}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />
      </div>

      {/* 2. Title, Price & Professional + Add to Cart Button */}
      <div className="mt-3 flex items-end justify-between gap-2">
        <div className="flex flex-col flex-1 min-w-0">
          <h3 className="text-sm font-medium text-neutral-900 line-clamp-1 group-hover:text-neutral-600 transition-colors duration-150">
            {product.name}
          </h3>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-sm font-semibold text-neutral-900">
              ৳{product.price.toLocaleString("en-BD")}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-neutral-400 line-through">
                ৳{product.originalPrice.toLocaleString("en-BD")}
              </span>
            )}
          </div>
        </div>

        {/* Subtle, Professional Add to Cart Action */}
        <button
          type="button"
          onClick={handleAddToCart}
          className={cn(
            "shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium cursor-pointer transition-all duration-200 ease-out shadow-[0_1px_2px_rgba(0,0,0,0.03)] active:scale-95",
            added
              ? "bg-emerald-600 text-white"
              : "bg-neutral-900 text-white hover:bg-neutral-800 hover:shadow-xs"
          )}
          aria-label={`Add ${product.name} to cart`}
        >
          {added ? "✓ Added" : "+ Add"}
        </button>
      </div>
    </Link>
  );
}
