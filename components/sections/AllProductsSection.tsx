import React from "react";
import Link from "next/link";
import { Product } from "@/data/products";
import { ProductCard } from "@/components/shared/ProductCard";
import { Button } from "@/components/ui/button";
import { LuArrowRight } from "react-icons/lu";

interface AllProductsSectionProps {
  products?: Product[];
}

export function AllProductsSection({ products = [] }: AllProductsSectionProps) {
  const initialProducts = products.slice(0, 8);

  if (initialProducts.length === 0) {
    return null;
  }

  return (
    <section
      id="all-products"
      className="py-16 sm:py-24 bg-white border-b border-neutral-200/80 scroll-mt-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Harmonized Editorial Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Full Collection
            </span>
            <h2 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900">
              Handpicked Collection
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              Recent arrivals and imported innovations ready for dispatch across
              Bangladesh.
            </p>
          </div>

          <Link
            href="/products"
            className="group inline-flex items-center text-sm font-medium text-neutral-900 hover:text-neutral-600 transition-colors duration-150 cursor-pointer"
          >
            <span>View All</span>
            <LuArrowRight className="size-4 ml-1 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {initialProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Clean See More Button Leading to Separate Page */}
        <div className="mt-12 text-center">
          <Link href="/products">
            <Button
              size="lg"
              variant="outline"
              className="rounded-xl border-neutral-300 bg-white px-8 font-medium text-neutral-900 hover:bg-neutral-50 shadow-none gap-2 text-sm cursor-pointer transition-all duration-200 ease-out active:scale-[0.98]"
            >
              <span>See More Products</span>
              <LuArrowRight className="size-4" />
            </Button>
          </Link>
          <p className="mt-2 text-xs text-neutral-400">
            Visit full collection with category filters and instant search
          </p>
        </div>
      </div>
    </section>
  );
}
