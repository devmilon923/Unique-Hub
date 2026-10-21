import React from "react";
import Link from "next/link";
import { PRODUCTS } from "@/data/products";
import { ProductCard } from "@/components/shared/ProductCard";
import { LuArrowRight } from "react-icons/lu";

export function PreOrderSection() {
  const preOrderProducts = PRODUCTS.filter((item) => item.isPreOrder).slice(0, 4);

  return (
    <section id="pre-order" className="py-16 sm:py-24 bg-white border-b border-neutral-200/80 scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Harmonized Editorial Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Upcoming Shipments • Batch 07
            </span>
            <h2 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900">
              Pre-Order Drops
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              Reserve upcoming international shipments before departure with fixed doorstep delivery.
            </p>
          </div>

          <Link
            href="/products?filter=preorder"
            className="group inline-flex items-center text-sm font-medium text-neutral-900 hover:text-neutral-600 transition-colors duration-150 cursor-pointer"
          >
            <span>More</span>
            <LuArrowRight className="size-4 ml-1 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Clean Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {preOrderProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
