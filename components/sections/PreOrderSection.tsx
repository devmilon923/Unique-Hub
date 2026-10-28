import React from "react";
import Link from "next/link";
import { Product } from "@/data/products";
import { ProductCard } from "@/components/shared/ProductCard";
import { LuArrowRight, LuCalendarClock } from "react-icons/lu";

interface PreOrderSectionProps {
  products?: Product[];
}

export function PreOrderSection({ products = [] }: PreOrderSectionProps) {
  const preOrderProducts = products.filter(
    (item) => item.isPreOrder || item.status === "pre",
  );

  return (
    <section
      id="pre-order"
      className="py-16 sm:py-24 bg-white border-b border-border scroll-mt-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Harmonized Editorial Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-commerce-subtle-border bg-commerce-subtle px-2.5 py-0.5 text-[11px] font-semibold text-commerce-subtle-text mb-2">
              <span className="size-1.5 rounded-full bg-commerce animate-pulse" />
              <span>International Air Cargo Batch</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
              Pre-Order Drops
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Reserve upcoming international shipments before departure with
              fixed doorstep delivery.
            </p>
          </div>

          <Link
            href="/products?filter=preorder"
            className="group inline-flex items-center text-sm font-medium text-foreground hover:text-commerce transition-colors duration-150 cursor-pointer"
          >
            <span>View All</span>
            <LuArrowRight className="size-4 ml-1 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Clean Product Grid or Next Batch Card */}
        {preOrderProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {preOrderProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/50 p-8 sm:p-12 text-center max-w-xl mx-auto">
            <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-white border border-neutral-200 text-neutral-700 shadow-2xs mb-3">
              <LuCalendarClock className="size-6 stroke-[1.8]" />
            </div>
            <h3 className="text-sm font-semibold text-neutral-900">
              Next Air Cargo Drop In Preparation
            </h3>
            <p className="mt-1 text-xs text-neutral-500 leading-relaxed">
              Our sourcing team is curating the next scheduled shipment from
              overseas labs. Pre-order slots will open once flight cargo
              manifests are locked.
            </p>
            <div className="mt-4">
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-900 hover:text-neutral-600"
              >
                <span>Browse Ready Stock</span>
                <LuArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
