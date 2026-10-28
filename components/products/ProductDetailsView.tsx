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
  LuSparkles,
} from "react-icons/lu";

interface ProductDetailsViewProps {
  product: Product;
  relatedProducts: Product[];
}

export function ProductDetailsView({
  product,
  relatedProducts,
}: ProductDetailsViewProps) {
  const { addToCart, buyNow } = useCart();

  // Variations
  const variations: ProductVariation[] = product.variation || [];
  const defaultVariation =
    variations.find((v) => v.isAvailable) || variations[0];

  const [selectedVariation, setSelectedVariation] =
    useState<ProductVariation | undefined>(defaultVariation);
  const [activeImage, setActiveImage] = useState<string>(
    defaultVariation?.imagePath || product.image || "/placeholder-product.svg"
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [addedToast, setAddedToast] = useState(false);

  // Dynamic price calculation
  const extraCost = selectedVariation?.extraCost || 0;
  const isPreOrder = Boolean(product.isPreOrder) || product.status === "pre";
  const fullUnitPrice = product.price + extraCost;
  const unitPrice = isPreOrder
    ? Math.round(fullUnitPrice * 0.5)
    : fullUnitPrice;
  const totalPrice = unitPrice * quantity;
  const originalUnitPrice = product.originalPrice
    ? product.originalPrice + extraCost
    : undefined;
  const discountPercent =
    !isPreOrder && originalUnitPrice && originalUnitPrice > fullUnitPrice
      ? Math.round(((originalUnitPrice - fullUnitPrice) / originalUnitPrice) * 100)
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
    buyNow(product, quantity, selectedVariation);
  };

  const galleryImages = React.useMemo(() => {
    if (product.images && product.images.length > 0) {
      return product.images;
    }
    const fromVars = (product.variation || [])
      .map((v) => v.imagePath)
      .filter(Boolean);
    if (fromVars.length > 0) return fromVars;
    return [product.image || "/placeholder-product.svg"];
  }, [product]);

  return (
    <div className="bg-white">
      {/* 1. Main Product Section (Balanced 6 / 6 Column Grid) */}
      <div className="mx-auto max-w-7xl px-4 pt-4 sm:pt-6 lg:pt-8 pb-12 sm:px-6 lg:px-8 lg:pb-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12 items-start">
          {/* Left Column: Visual Showcase & Gallery (6 cols) */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            {/* Main 4:3 Image Showcase */}
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border/80 bg-secondary shadow-xs">
              {/* Clean Pre-Order / In-Stock Badge (Top-Left Only) */}
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 flex items-center gap-2 pointer-events-none">
                {product.isPreOrder ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-md border border-commerce-subtle-border px-2.5 py-1 text-[10px] font-medium tracking-wide text-commerce-subtle-text shadow-xs">
                    <span className="size-1.5 rounded-full bg-commerce animate-pulse" />
                    <span>Pre-Order • {product.preOrderBatch || "Batch 08"}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-md border border-border px-2.5 py-1 text-[10px] font-medium tracking-wide text-foreground shadow-xs">
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

            {/* Gallery Thumbnail Row (Harmonized 4:3 Thumbnails) */}
            {galleryImages.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
                {galleryImages.map((img, idx) => {
                  const isSelected = activeImage === img;
                  return (
                    <button
                      key={img || idx}
                      type="button"
                      onClick={() => setActiveImage(img)}
                      className={cn(
                        "relative aspect-[4/3] w-full overflow-hidden rounded-xl border p-0.5 transition-all duration-150 ease-out cursor-pointer active:scale-95",
                        isSelected
                          ? "border-blue-bell-600 ring-2 ring-blue-bell-500/25 shadow-xs"
                          : "border-border hover:border-blue-bell-300 opacity-80 hover:opacity-100"
                      )}
                      aria-label={`Product image view ${idx + 1}`}
                    >
                      <Image
                        src={img || "/placeholder-product.svg"}
                        alt={`${product.name} thumbnail ${idx + 1}`}
                        fill
                        sizes="120px"
                        className="object-cover rounded-lg"
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
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {product.category}
              </p>

              <h1 className="mt-1 text-2xl sm:text-3xl lg:text-[2rem] font-semibold tracking-tight text-foreground leading-snug">
                {product.name}
              </h1>

              {/* Logistics & Trust Origin Pill (Blue Bell Channel) */}
              <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg border border-logistics-subtle-border bg-logistics-subtle px-2.5 py-1 text-xs text-logistics-subtle-text">
                <LuShieldCheck className="size-3.5 text-logistics shrink-0" />
                <span>
                  Direct Import from <strong className="font-semibold">{product.origin}</strong> • Customs Cleared
                </span>
              </div>
            </div>

            {/* Price Section with Integrated Savings Badge & Pre-Order 50% Policy */}
            <div className="border-t border-border/80 pt-5">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground font-mono">
                  ৳{unitPrice.toLocaleString("en-BD")}
                </span>

                {isPreOrder && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-commerce text-white px-2.5 py-0.5 text-[11px] font-medium shadow-xs">
                    <span className="size-1.5 rounded-full bg-white animate-pulse" />
                    <span>Pay 50% Advance</span>
                  </span>
                )}

                {isPreOrder ? (
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    Full Price:{" "}
                    <strong className="text-foreground font-semibold font-mono">
                      ৳{fullUnitPrice.toLocaleString("en-BD")}
                    </strong>
                  </span>
                ) : (
                  originalUnitPrice && originalUnitPrice > unitPrice && (
                    <span className="text-base sm:text-lg text-muted-foreground line-through">
                      ৳{originalUnitPrice.toLocaleString("en-BD")}
                    </span>
                  )
                )}

                {!isPreOrder && discountPercent && (
                  <span className="rounded-md bg-commerce-subtle border border-commerce-subtle-border px-2.5 py-0.5 text-xs font-semibold text-commerce-subtle-text">
                    Save {discountPercent}%
                  </span>
                )}
              </div>

              {/* Polished Pre-Order Payment Breakdown */}
              {isPreOrder && (
                <div className="mt-3.5 rounded-2xl border border-neutral-200/90 bg-neutral-50/70 p-3 sm:p-3.5 space-y-3">
                  <div className="grid grid-cols-2 divide-x divide-neutral-200">
                    {/* 1. Pay Today */}
                    <div className="pr-3">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                        1. Pay Today (50%)
                      </span>
                      <div className="mt-0.5 font-mono text-base sm:text-lg font-bold text-neutral-900">
                        ৳{unitPrice.toLocaleString("en-BD")}
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        Advance to reserve
                      </p>
                    </div>

                    {/* 2. On Delivery */}
                    <div className="pl-3">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                        2. On Delivery (50%)
                      </span>
                      <div className="mt-0.5 font-mono text-base sm:text-lg font-bold text-neutral-900">
                        ৳{(fullUnitPrice - unitPrice).toLocaleString("en-BD")}
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        Cash on Delivery (COD)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-200/70 text-xs">
                    <span className="inline-flex items-center gap-1.5 text-neutral-600 font-medium text-[11px]">
                      <LuTruck className="size-3.5 text-emerald-600 shrink-0" />
                      <span>Nationwide Doorstep Delivery</span>
                    </span>
                    <span className="font-semibold text-emerald-700 uppercase tracking-wider text-[10px] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80">
                      Free
                    </span>
                  </div>
                </div>
              )}
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
                            ? "ring-2 ring-blue-bell-600 ring-offset-2 scale-105 cursor-pointer shadow-xs"
                            : "hover:scale-110 hover:ring-2 hover:ring-blue-bell-300 hover:ring-offset-1 opacity-85 hover:opacity-100 cursor-pointer active:scale-95"
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
                <div className="flex items-center justify-between rounded-xl border border-border bg-card p-1 h-12 w-full sm:w-auto shrink-0 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1 || !isCurrentVariationAvailable}
                    className="rounded-lg p-2 text-muted-foreground hover:bg-blue-bell-50 hover:text-blue-bell-800 disabled:opacity-30 disabled:hover:bg-transparent transition-all duration-150 cursor-pointer active:scale-90 active:bg-blue-bell-100"
                    aria-label="Decrease quantity"
                  >
                    <LuMinus className="size-3.5" />
                  </button>

                  <span className="min-w-9 text-center text-sm font-semibold text-foreground font-mono select-none">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= 10 || !isCurrentVariationAvailable}
                    className="rounded-lg p-2 text-muted-foreground hover:bg-blue-bell-50 hover:text-blue-bell-800 disabled:opacity-30 disabled:hover:bg-transparent transition-all duration-150 cursor-pointer active:scale-90 active:bg-blue-bell-100"
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
                    "flex-1 rounded-xl h-12 text-sm font-semibold cursor-pointer transition-all duration-150 ease-out border-border bg-card hover:bg-blue-bell-50/70 hover:border-blue-bell-200 hover:text-blue-bell-800 text-foreground shadow-2xs gap-2 active:scale-[0.98] active:bg-blue-bell-100",
                    addedToast &&
                      "bg-emerald-50 border-emerald-400 text-emerald-800"
                  )}
                >
                  {addedToast ? (
                    <>
                      <LuCheck className="size-4 text-emerald-600 animate-in zoom-in-50 duration-200" />
                      <span>Added to Bucket</span>
                    </>
                  ) : (
                    <>
                      <LuShoppingBag className="size-4 text-muted-foreground" />
                      <span>Add to Bucket</span>
                    </>
                  )}
                </Button>

                {/* Primary Buy / Pre-Order CTA */}
                <Button
                  type="button"
                  size="lg"
                  onClick={handleBuyNow}
                  disabled={!isCurrentVariationAvailable}
                  className={cn(
                    "flex-1 rounded-xl h-12 text-sm font-semibold cursor-pointer transition-all duration-200 ease-out text-white shadow-xs gap-2 active:scale-[0.98]",
                    isPreOrder
                      ? "bg-commerce hover:bg-commerce-hover shadow-sm"
                      : "bg-primary hover:bg-primary-hover shadow-xs"
                  )}
                >
                  <LuZap className={cn("size-4", isPreOrder ? "text-white fill-white" : "text-amber-400 fill-amber-400")} />
                  <span>
                    {isPreOrder
                      ? `Pre-Order Now • Pay ৳${totalPrice.toLocaleString("en-BD")}`
                      : "Buy Now"}
                  </span>
                </Button>
              </div>

              {/* Minimal Trust & Logistics Guarantee */}
              <div className="flex items-center justify-between flex-wrap gap-2 pt-1 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1.5 text-logistics-subtle-text">
                  <LuCheck className="size-3.5 text-logistics shrink-0" />
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
              </div>

              <br />
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
