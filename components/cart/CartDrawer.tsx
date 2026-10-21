"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import {
  LuX,
  LuTrash2,
  LuShoppingBag,
  LuMinus,
  LuPlus,
  LuArrowRight,
  LuCheck,
  LuPhone,
  LuPackageCheck,
} from "react-icons/lu";
import { Button } from "@/components/ui/button";

export function CartDrawer() {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    totalCount,
    clearCart,
  } = useCart();

  const [placedOrder, setPlacedOrder] = useState<{
    orderNumber: string;
    total: number;
    itemCount: number;
  } | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsCartOpen(false);
        setPlacedOrder(null);
      }
    };
    if (isCartOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isCartOpen, setIsCartOpen]);

  if (!isCartOpen) return null;

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) return;
    const orderRef = "UH-" + Math.floor(100000 + Math.random() * 900000);
    setPlacedOrder({
      orderNumber: orderRef,
      total: subtotal,
      itemCount: totalCount,
    });
    clearCart();
  };

  const handleClose = () => {
    setIsCartOpen(false);
    setPlacedOrder(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={handleClose}
      />

      {/* Drawer Panel */}
      <div className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-neutral-900">
              {placedOrder ? "Order Confirmation" : "Shopping Cart"}
            </h2>
            {!placedOrder && totalCount > 0 && (
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-neutral-600">
                {totalCount}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors duration-150 cursor-pointer active:scale-95"
            aria-label="Close cart"
          >
            <LuX className="size-5" />
          </button>
        </div>

        {/* Drawer Content */}
        {placedOrder ? (
          /* Order Confirmation Screen */
          <div className="flex flex-1 flex-col justify-between p-6 overflow-y-auto">
            <div className="flex flex-col items-center text-center pt-4 sm:pt-6">
              {/* Celebratory Checkmark Icon */}
              <div className="flex size-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/90 mb-5 shadow-xs">
                <LuCheck className="size-8 stroke-[2.5]" />
              </div>

              {/* Status Badge */}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/70 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-800">
                <span className="size-1.5 rounded-full bg-emerald-600 animate-pulse" />
                <span>Order Placed</span>
              </span>

              {/* Order Reference */}
              <h3 className="mt-3 text-xl font-bold tracking-tight text-neutral-900 font-mono">
                #{placedOrder.orderNumber}
              </h3>

              {/* Primary Follow-up Message */}
              <p className="mt-2 text-sm text-neutral-600 leading-relaxed max-w-xs font-normal">
                Your order has been placed. <strong className="font-semibold text-neutral-900">Our team will contact you soon for confirmation</strong> and dispatch details.
              </p>

              {/* Summary Card with Logistics Reassurance */}
              <div className="mt-6 w-full rounded-2xl border border-neutral-200/90 bg-neutral-50/70 p-4 text-left space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-500">Total Payable:</span>
                  <span className="font-bold text-neutral-900 font-mono text-sm">
                    ৳{placedOrder.total.toLocaleString("en-BD")}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-500">Items Ordered:</span>
                  <span className="font-medium text-neutral-800">
                    {placedOrder.itemCount} {placedOrder.itemCount === 1 ? "item" : "items"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-500">Payment Method:</span>
                  <span className="font-medium text-neutral-800">
                    Cash on Delivery (COD) / Mobile Banking
                  </span>
                </div>

                <div className="pt-2.5 border-t border-neutral-200/80 flex items-start gap-2 text-[11px] text-neutral-600">
                  <LuPhone className="size-3.5 text-neutral-700 shrink-0 mt-0.5" />
                  <span>
                    Our customer support agent will call or message you on WhatsApp shortly to confirm your delivery address.
                  </span>
                </div>

                <div className="flex items-start gap-2 text-[11px] text-neutral-600">
                  <LuPackageCheck className="size-3.5 text-neutral-700 shrink-0 mt-0.5" />
                  <span>
                    Estimated delivery: 2-3 business days in Dhaka, 3-5 days across all 64 districts.
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-neutral-200 space-y-2.5">
              <Button
                size="lg"
                onClick={handleClose}
                className="w-full rounded-xl bg-neutral-900 text-xs font-semibold text-white shadow-none hover:bg-neutral-800 transition-all duration-200 cursor-pointer active:scale-[0.99]"
              >
                Continue Shopping
              </Button>

              <a
                href="https://wa.me/8801811987654"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-xs text-neutral-500 hover:text-neutral-900 transition-colors py-1 cursor-pointer"
              >
                Have questions? Chat with our team on WhatsApp
              </a>
            </div>
          </div>
        ) : cartItems.length === 0 ? (
          /* Empty Cart State */
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400 mb-4">
              <LuShoppingBag className="size-7" />
            </div>
            <h3 className="text-base font-semibold text-neutral-900">
              Your cart is empty
            </h3>
            <p className="mt-1 text-xs text-neutral-500 max-w-xs leading-relaxed">
              Explore our curated international collection and add products to
              your bag.
            </p>
            <Link
              href="/products"
              onClick={handleClose}
              className="mt-6"
            >
              <Button
                size="sm"
                className="rounded-xl bg-neutral-900 text-xs px-5 cursor-pointer active:scale-[0.98]"
              >
                <span>Browse Products</span>
                <LuArrowRight className="size-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        ) : (
          /* Active Cart State */
          <>
            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-5 divide-y divide-neutral-100">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="py-4 first:pt-0 last:pb-0 flex gap-4"
                >
                  {/* Thumbnail */}
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-neutral-200/70 bg-neutral-100">
                    <Image
                      src={
                        item.selectedVariation?.imagePath ||
                        item.product.image ||
                        "/placeholder-product.svg"
                      }
                      alt={item.product.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                    {item.selectedVariation && (
                      <span
                        className="absolute bottom-1 right-1 size-3 rounded-full border border-white shadow-xs"
                        style={{
                          backgroundColor: item.selectedVariation.color,
                        }}
                        title={item.selectedVariation.name}
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-semibold text-neutral-900 line-clamp-1">
                          {item.product.name}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="rounded-md p-1 text-neutral-400 hover:bg-rose-50 hover:text-rose-600 transition-colors duration-150 cursor-pointer active:scale-90"
                          aria-label="Remove item"
                        >
                          <LuTrash2 className="size-3.5" />
                        </button>
                      </div>

                      {/* Variation & Category */}
                      <div className="mt-1 flex items-center flex-wrap gap-1.5">
                        {item.selectedVariation && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-700 bg-neutral-100 rounded px-1.5 py-0.5">
                            <span
                              className="size-2 rounded-full border border-black/15 shrink-0"
                              style={{
                                backgroundColor: item.selectedVariation.color,
                              }}
                            />
                            {item.selectedVariation.name}
                            {item.selectedVariation.extraCost > 0 && (
                              <span className="text-neutral-400 text-[10px]">
                                +৳
                                {item.selectedVariation.extraCost.toLocaleString(
                                  "en-BD",
                                )}
                              </span>
                            )}
                          </span>
                        )}
                        <span className="text-[11px] text-neutral-400">
                          {item.product.category}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-900 font-mono">
                        ৳
                        {(
                          (item.unitPrice || item.product.price) * item.quantity
                        ).toLocaleString("en-BD")}
                      </span>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50 px-1.5 py-0.5">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="rounded p-0.5 text-neutral-500 hover:bg-white hover:text-neutral-900 transition-colors duration-150 cursor-pointer active:scale-90"
                          aria-label="Decrease quantity"
                        >
                          <LuMinus className="size-3" />
                        </button>
                        <span className="text-xs font-semibold text-neutral-900 min-w-4 text-center select-none font-mono">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="rounded p-0.5 text-neutral-500 hover:bg-white hover:text-neutral-900 transition-colors duration-150 cursor-pointer active:scale-90"
                          aria-label="Increase quantity"
                        >
                          <LuPlus className="size-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Summary & Place Order */}
            <div className="border-t border-neutral-200 p-5 bg-neutral-50/50 space-y-3">
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span>Subtotal</span>
                <span className="text-base font-bold text-neutral-900 font-mono">
                  ৳{subtotal.toLocaleString("en-BD")}
                </span>
              </div>

              <p className="text-[11px] text-neutral-400 leading-normal">
                All customs, air freight duties & Bangladesh doorstep delivery
                included.
              </p>

              <Button
                size="lg"
                onClick={handlePlaceOrder}
                className="w-full rounded-xl bg-neutral-900 text-xs font-semibold text-white shadow-none hover:bg-neutral-800 transition-all duration-200 ease-out cursor-pointer active:scale-[0.99] gap-1.5"
              >
                <span>Place Order • ৳{subtotal.toLocaleString("en-BD")}</span>
                <LuArrowRight className="size-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
              </Button>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-[11px] text-neutral-400 hover:text-neutral-700 underline transition-colors duration-150 cursor-pointer"
                >
                  Clear all items
                </button>
                <span className="text-[11px] text-neutral-400 select-none">
                  bKash • Nagad • Cards • COD
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

