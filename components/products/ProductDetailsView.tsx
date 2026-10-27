"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Product, ProductVariation } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { ProductCard } from "@/components/shared/ProductCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ProductDescriptionPreview } from "@/components/products/ProductDescriptionPreview";
import {
  LuMinus,
  LuPlus,
  LuShoppingBag,
  LuZap,
  LuPlane,
  LuPackageCheck,
  LuClock,
  LuCheck,
  LuShieldCheck,
  LuTruck,
  LuArrowRight,
} from "react-icons/lu";

interface ProductDetailsViewProps {
  product: Product;
  relatedProducts: Product[];
}

export function ProductDetailsView({
  product,
  relatedProducts,
}: ProductDetailsViewProps) {
  const { addToCart, setIsCartOpen } = useCart();

  // Variations
  const variations: ProductVariation[] = product.variation || [];
  const defaultVariation =
    variations.find((v) => v.isAvailable) || variations[0];

  const [selectedVariation, setSelectedVariation] =
    useState<ProductVariation | undefined>(defaultVariation);
  const [activeImage, setActiveImage] = useState<string>(
    defaultVariation?.imagePath || product.image || "/images/product/1.jpg"
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [addedToast, setAddedToast] = useState(false);

  // Dynamic price calculation
  const extraCost = selectedVariation?.extraCost || 0;
  const unitPrice = product.price + extraCost;
  const totalPrice = unitPrice * quantity;
  const originalUnitPrice = product.originalPrice
    ? product.originalPrice + extraCost
    : undefined;
  const discountPercent = originalUnitPrice
    ? Math.round(((originalUnitPrice - unitPrice) / originalUnitPrice) * 100)
    : null;

  const isCurrentVariationAvailable = selectedVariation
    ? selectedVariation.isAvailable
    : true;

  // Sync active image when variation changes
  const handleSelectVariation = (v: ProductVariation) => {
    setSelectedVariation(v);
    if (v.imagePath) {
      setActiveImage(v.imagePath);
    }
  };

  // Quantity controls
  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(10, prev + delta)));
  };

  const handleAddToCart = () => {
    if (!isCurrentVariationAvailable) return;
    addToCart(product, quantity, selectedVariation);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2000);
  };

  const handleBuyNow = () => {
    if (!isCurrentVariationAvailable) return;
    addToCart(product, quantity, selectedVariation);
    setIsCartOpen(true);
  };

  return (
    <div className="bg-white">
      {/* 1. Main Product Section (Balanced 6 / 6 Column Grid) */}
      <div className="mx-auto max-w-7xl px-4 pt-4 sm:pt-6 lg:pt-8 pb-12 sm:px-6 lg:px-8 lg:pb-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12 items-start">
          {/* Left Column: Visual Showcase & Gallery (6 cols) */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            {/* Main 4:3 Image Showcase */}
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-neutral-200/90 bg-neutral-100/80 shadow-xs">
              {/* Clean Pre-Order / In-Stock Badge (Top-Left Only) */}
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 flex items-center gap-2 pointer-events-none">
                {product.isPreOrder ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/75 backdrop-blur-md border border-white/80 px-2.5 py-1 text-[10px] font-medium tracking-wide text-neutral-800 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                    <span className="size-1.5 rounded-full bg-neutral-800" />
                    <span>Pre-Order • {product.preOrderBatch || "Batch 08"}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/75 backdrop-blur-md border border-white/80 px-2.5 py-1 text-[10px] font-medium tracking-wide text-neutral-800 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                    <span className="size-1.5 rounded-full bg-emerald-600" />
                    <span>Ready Stock • Dhaka</span>
                  </span>
                )}
              </div>

              {/* Product Photography */}
              <Image
                src={activeImage}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-opacity duration-300"
              />
            </div>

            {/* Thumbnail Row (Harmonized 4:3 Thumbnails) */}
            {variations.length > 0 && (
              <div className="grid grid-cols-4 gap-3">
                {variations.map((v, idx) => {
                  const isSelected = selectedVariation?.color === v.color;
                  return (
                    <button
                      key={v.color || idx}
                      type="button"
                      disabled={!v.isAvailable}
                      onClick={() => {
                        if (!v.isAvailable) return;
                        handleSelectVariation(v);
                      }}
                      className={cn(
                        "relative aspect-[4/3] w-full overflow-hidden rounded-xl border p-0.5 transition-all duration-200 ease-out",
                        isSelected
                          ? "border-neutral-900 ring-2 ring-neutral-900/10 shadow-xs"
                          : v.isAvailable
                          ? "border-neutral-200 hover:border-neutral-400 opacity-80 hover:opacity-100 cursor-pointer active:scale-95"
                          : "border-neutral-200 opacity-30 cursor-not-allowed"
                      )}
                      aria-label="Color variation thumbnail"
                    >
                      <Image
                        src={v.imagePath || product.image || "/placeholder-product.svg"}
                        alt={product.name}
                        fill
                        sizes="120px"
                        className="object-cover rounded-lg"
                      />
                      {/* Subtle Color Dot on Corner */}
                      <span
                        className="absolute bottom-1.5 right-1.5 size-2.5 rounded-full border border-white shadow-xs"
                        style={{ backgroundColor: v.color }}
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Title, Pricing, Variations & Purchase Controls (6 cols) */}
          <div className="lg:col-span-6 flex flex-col justify-start space-y-6">
            {/* Header: Category, Title & Origin */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                {product.category}
              </p>

              <h1 className="mt-1 text-2xl sm:text-3xl lg:text-[2rem] font-semibold tracking-tight text-neutral-900 leading-snug">
                {product.name}
              </h1>

              <p className="mt-2 text-xs text-neutral-500 flex items-center gap-1.5">
                <LuShieldCheck className="size-3.5 text-neutral-600 shrink-0" />
                <span>
                  Direct Import from{" "}
                  <strong className="text-neutral-700 font-medium">
                    {product.origin}
                  </strong>
                </span>
              </p>
            </div>

            {/* Price Section with Integrated Savings Badge */}
            <div className="border-t border-neutral-200/80 pt-5">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900">
                  ৳{unitPrice.toLocaleString("en-BD")}
                </span>

                {originalUnitPrice && originalUnitPrice > unitPrice && (
                  <span className="text-base sm:text-lg text-neutral-400 line-through">
                    ৳{originalUnitPrice.toLocaleString("en-BD")}
                  </span>
                )}

                {discountPercent && (
                  <span className="rounded-md bg-rose-50 border border-rose-200/80 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
                    Save {discountPercent}%
                  </span>
                )}
              </div>
            </div>

            {/* Color Variation Swatches */}
            {variations.length > 0 && (
              <div className="border-t border-neutral-200/80 pt-5">
                <div className="text-xs font-semibold uppercase tracking-wider text-neutral-900">
                  Color
                </div>

                {/* Swatches Row */}
                <div className="mt-3 flex items-center gap-3">
                  {variations.map((v) => {
                    const isSelected = selectedVariation?.color === v.color;
                    return (
                      <button
                        key={v.color}
                        type="button"
                        disabled={!v.isAvailable}
                        onClick={() => {
                          if (!v.isAvailable) return;
                          handleSelectVariation(v);
                        }}
                        className={cn(
                          "relative size-9 rounded-full p-0.5 flex items-center justify-center transition-all duration-200 ease-out",
                          !v.isAvailable
                            ? "opacity-35 cursor-not-allowed"
                            : isSelected
                            ? "ring-2 ring-neutral-900 ring-offset-2 scale-105 cursor-pointer"
                            : "hover:scale-110 opacity-85 hover:opacity-100 cursor-pointer active:scale-95"
                        )}
                        aria-label="Color option"
                        aria-disabled={!v.isAvailable}
                      >
                        <span
                          className="relative block size-full rounded-full border border-black/15 shadow-2xs overflow-hidden"
                          style={{ backgroundColor: v.color }}
                        >
                          {/* Diagonal line for unavailable variation */}
                          {!v.isAvailable && (
                            <svg
                              className="absolute inset-0 size-full text-neutral-500/80 pointer-events-none"
                              viewBox="0 0 36 36"
                              fill="none"
                              stroke="currentColor"
                            >
                              <line
                                x1="2"
                                y1="34"
                                x2="34"
                                y2="2"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                            </svg>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Pre-Order or Delivery Schedule Card */}
            <div className="border-t border-neutral-200/80 pt-5">
              {product.isPreOrder ? (
                <div className="rounded-xl border border-neutral-200/90 bg-neutral-50/80 p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-semibold text-neutral-900">
                      <LuPlane className="size-4 text-neutral-700" />
                      <span>Pre-Order Window • {product.preOrderBatch || "Batch 08"}</span>
                    </span>
                    <span className="text-[11px] font-medium text-neutral-500 font-mono">
                      {product.preOrderSlots
                        ? `${product.preOrderSlots.booked} / ${product.preOrderSlots.total} Slots Booked`
                        : "Limited Batch"}
                    </span>
                  </div>

                  {product.preOrderSlots && (
                    <div className="h-1.5 w-full rounded-full bg-neutral-200 overflow-hidden">
                      <div
                        className="h-full bg-neutral-900 rounded-full transition-all duration-500"
                        style={{
                          width: `${(product.preOrderSlots.booked / product.preOrderSlots.total) * 100}%`,
                        }}
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-neutral-600 pt-0.5">
                    <span className="flex items-center gap-1.5">
                      <LuClock className="size-3.5 text-neutral-400" />
                      <span>Estimated Arrival:</span>
                    </span>
                    <span className="font-semibold text-neutral-900">
                      {product.preOrderEta
                        ? product.preOrderEta.replace("Arrives in Dhaka: ", "")
                        : "Nov 22 - 27 (Dhaka Hub)"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-neutral-200/90 bg-neutral-50/80 p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-neutral-900">
                    <LuPackageCheck className="size-4 text-neutral-700" />
                    <span>In Stock • Ready for Dispatch</span>
                  </div>
                  <p className="mt-1 text-xs text-neutral-500 leading-relaxed">
                    2-3 business days delivery in Dhaka, 3-5 days across all 64
                    districts in Bangladesh.
                  </p>
                </div>
              )}
            </div>

            {/* Quantity & CTA Buttons Row */}
            <div className="border-t border-neutral-200/80 pt-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                {/* Quantity Counter */}
                <div className="flex items-center justify-between rounded-xl border border-neutral-300 bg-white p-1 h-12 w-full sm:w-auto shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1 || !isCurrentVariationAvailable}
                    className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-30 disabled:hover:bg-transparent transition-all duration-150 cursor-pointer active:scale-90"
                    aria-label="Decrease quantity"
                  >
                    <LuMinus className="size-3.5" />
                  </button>

                  <span className="min-w-9 text-center text-sm font-semibold text-neutral-900 font-mono select-none">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= 10 || !isCurrentVariationAvailable}
                    className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-30 disabled:hover:bg-transparent transition-all duration-150 cursor-pointer active:scale-90"
                    aria-label="Increase quantity"
                  >
                    <LuPlus className="size-3.5" />
                  </button>
                </div>

                {/* Add to Cart CTA */}
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={!isCurrentVariationAvailable}
                  className={cn(
                    "flex-1 rounded-xl h-12 text-sm font-semibold cursor-pointer transition-all duration-200 ease-out border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-900 shadow-none gap-2 active:scale-[0.98]",
                    addedToast &&
                      "bg-emerald-50 border-emerald-400 text-emerald-800"
                  )}
                >
                  {addedToast ? (
                    <>
                      <LuCheck className="size-4 text-emerald-600 animate-in zoom-in-50 duration-200" />
                      <span>Added to Cart</span>
                    </>
                  ) : (
                    <>
                      <LuShoppingBag className="size-4 text-neutral-700" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </Button>

                {/* Primary Buy / Pre-Order CTA */}
                <Button
                  type="button"
                  size="lg"
                  onClick={handleBuyNow}
                  disabled={!isCurrentVariationAvailable}
                  className="flex-1 rounded-xl h-12 text-sm font-semibold cursor-pointer transition-all duration-200 ease-out bg-neutral-900 hover:bg-neutral-800 hover:shadow-sm text-white shadow-xs gap-2 active:scale-[0.98]"
                >
                  <LuZap className="size-4 text-amber-400 fill-amber-400" />
                  <span>
                    {product.isPreOrder ? "Pre-Order Now" : "Buy Now"}
                  </span>
                </Button>
              </div>

              {/* Minimal Trust & Logistics Guarantee */}
              <div className="flex items-center justify-between flex-wrap gap-2 pt-1 text-[11px] text-neutral-400">
                <span className="flex items-center gap-1 text-neutral-500">
                  <LuCheck className="size-3 text-emerald-600" />
                  <span>All customs & import duties included</span>
                </span>
                {quantity > 1 ? (
                  <span className="font-semibold text-neutral-800 font-mono text-xs">
                    Total ({quantity} items): ৳{totalPrice.toLocaleString("en-BD")}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-neutral-500">
                    <LuTruck className="size-3 text-neutral-500" />
                    <span>Doorstep delivery across Bangladesh</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Text-Based Product Details Layout (Rich Text Editor Format Demo) */}
        <section className="mt-16 sm:mt-24 border-t border-neutral-200/80 pt-12 sm:pt-16">
          <div className="max-w-4xl mx-auto">
            {/* Section Header */}
            <div className="mb-10 text-center sm:text-left">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Product Details
              </span>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-900">
                Overview & Specifications
              </h2>
            </div>

            {/* Rich Editor Output Container */}
            <article className="space-y-8 text-neutral-700 text-sm leading-relaxed">
              {/* Introduction Paragraph */}
              <div>
                <ProductDescriptionPreview
                  content={product.description}
                  className="text-neutral-700"
                />
                {product.origin && (
                  <p className="mt-4 text-xs sm:text-sm text-neutral-500 leading-relaxed border-t border-neutral-100 pt-3">
                    Engineered and curated for individuals who value precision
                    hardware, minimal aesthetics, and reliable everyday utility.
                    Imported directly from specialized overseas boutique
                    manufacturers and electronics research laboratories in{" "}
                    <strong className="text-neutral-700 font-medium">
                      {product.origin}
                    </strong>
                    .
                  </p>
                )}
              </div>

              {/* Technical Specifications Definition List */}
              {product.specs && (
                <div className="border-t border-neutral-200/80 pt-6">
                  <h3 className="text-base font-semibold text-neutral-900 tracking-tight mb-4">
                    Technical Specifications
                  </h3>

                  <div className="rounded-xl border border-neutral-200/80 divide-y divide-neutral-200/80 overflow-hidden bg-white">
                    {Object.entries(product.specs).map(([param, detail]) => (
                      <div
                        key={param}
                        className="grid grid-cols-1 sm:grid-cols-3 p-3.5 text-xs gap-1 sm:gap-4"
                      >
                        <dt className="font-medium text-neutral-500">
                          {param}
                        </dt>
                        <dd className="sm:col-span-2 font-normal text-neutral-900 m-0">
                          {detail}
                        </dd>
                      </div>
                    ))}
                    <div className="grid grid-cols-1 sm:grid-cols-3 p-3.5 text-xs gap-1 sm:gap-4 bg-neutral-50/40">
                      <dt className="font-medium text-neutral-500">Origin Lab</dt>
                      <dd className="sm:col-span-2 font-normal text-neutral-900 m-0">
                        {product.origin}
                      </dd>
                    </div>
                  </div>
                </div>
              )}

              {/* Editorial / Sourcing Callout (Rich Blockquote Format) */}
              <div className="border-l-2 border-neutral-900 pl-4 py-1 my-6 bg-neutral-50/50 rounded-r-lg p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 mb-1">
                  UniqueHub Sourcing Standards
                </h4>
                <p className="text-xs text-neutral-600 leading-relaxed italic m-0">
                  “Every product on UniqueHub undergoes physical QA inspection
                  before departure. International air freight, NBR customs
                  duties, and statutory tariffs are fully covered in the listed
                  price with zero hidden arrival charges for customers in
                  Bangladesh.”
                </p>
              </div>
            </article>
          </div>
        </section>

        {/* 3. Related Products Recommendations */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 sm:mt-24 border-t border-neutral-200/80 pt-12 sm:pt-16">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Similar Finds
                </span>
                <h3 className="mt-1 text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">
                  You May Also Like
                </h3>
              </div>

              <Link
                href="/products"
                className="group inline-flex items-center text-xs font-medium text-neutral-900 hover:text-neutral-600 transition-colors duration-150"
              >
                <span>View Full Catalog</span>
                <LuArrowRight className="size-3.5 ml-1 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((relProduct) => (
                <ProductCard key={relProduct.id} product={relProduct} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
