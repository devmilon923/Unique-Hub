"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/sections/Footer";
import { Product, CATEGORIES, normalizeCategory, formatCategory } from "@/data/products";
import { ProductCard } from "@/components/shared/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { productApi, ProductFilterQuery } from "@/lib/productApi";
import { adaptProductItem } from "@/lib/productAdapter";
import { cn } from "@/lib/utils";
import {
  LuSearch,
  LuX,
  LuRotateCcw,
  LuArrowDown,
} from "react-icons/lu";

const INITIAL_VISIBLE_COUNT = 8;
const LOAD_MORE_STEP = 4;

function ProductSkeleton() {
  return (
    <div className="flex flex-col animate-pulse">
      <div className="relative aspect-[4/3] w-full rounded-xl bg-neutral-200/80" />
      <div className="mt-3 space-y-2">
        <div className="h-4 w-3/4 rounded bg-neutral-200/80" />
        <div className="h-4 w-1/3 rounded bg-neutral-200/80" />
      </div>
    </div>
  );
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get("filter");
  const initialCategory = searchParams.get("category");

  const matchingCategory = initialCategory
    ? CATEGORIES.find(
        (c) => c.toLowerCase() === normalizeCategory(initialCategory).toLowerCase()
      ) || formatCategory(initialCategory)
    : "All";

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>(matchingCategory);
  const [filterPreorderOnly, setFilterPreorderOnly] = useState(
    initialFilter === "preorder",
  );
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([...CATEGORIES]);
  const [isLoading, setIsLoading] = useState(true);

  // Sync category from URL parameter if it changes
  useEffect(() => {
    if (initialCategory) {
      const match =
        CATEGORIES.find(
          (c) => c.toLowerCase() === normalizeCategory(initialCategory).toLowerCase()
        ) || formatCategory(initialCategory);
      setSelectedCategory(match);
    }
  }, [initialCategory]);

  // Debounce search query so server isn't spammed per keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Initial category list from all inventory
  useEffect(() => {
    productApi
      .getAll({ limit: 100 })
      .then((data) => {
        if (data?.result && Array.isArray(data.result)) {
          const list = Array.from(
            new Set(
              data.result
                .filter((p) => p.status !== "hidden")
                .map((p) => formatCategory(p.category))
                .filter(Boolean),
            ),
          );
          const combined = Array.from(
            new Set(["All", ...CATEGORIES.slice(1), ...list])
          );
          setCategories(combined);
        }
      })
      .catch(() => {});
  }, []);

  // Server-side product search & filtering
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const queryParams: ProductFilterQuery = {
      limit: 100,
    };

    if (debouncedSearch.trim()) {
      queryParams.search = debouncedSearch.trim();
    }
    if (selectedCategory !== "All") {
      queryParams.category = normalizeCategory(selectedCategory);
    }
    if (filterPreorderOnly) {
      queryParams.status = "pre";
    }

    productApi
      .getAll(queryParams)
      .then((data) => {
        if (!isMounted) return;
        if (data?.result && Array.isArray(data.result)) {
          const live = data.result
            .filter((item) => item.status !== "hidden")
            .map(adaptProductItem);
          setAllProducts(live);
        } else {
          setAllProducts([]);
        }
      })
      .catch((err) => {
        console.error("Failed to load products from API:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [debouncedSearch, selectedCategory, filterPreorderOnly]);

  // Client-level search logic is completely removed:
  // Products are filtered server-side via productApi.getAll({ search }).
  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      if (filterPreorderOnly && !product.isPreOrder) {
        return false;
      }
      return true;
    });
  }, [allProducts, filterPreorderOnly]);

  const displayedProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  const handleResetFilters = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setSelectedCategory("All");
    setFilterPreorderOnly(false);
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
          All Products
        </h1>
        <p className="mt-1.5 text-sm text-neutral-500">
          Discover unique international products with direct home delivery in
          Bangladesh.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-8 border-b border-neutral-200 pb-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <LuSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleCount(INITIAL_VISIBLE_COUNT);
              }}
              placeholder="Search products..."
              className="pl-9 pr-9 h-10 rounded-xl border-border bg-card text-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground transition-colors duration-150 cursor-pointer active:scale-90"
              >
                <LuX className="size-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="mt-4 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const isSelected =
              cat === "All"
                ? selectedCategory === "All"
                : normalizeCategory(selectedCategory) === normalizeCategory(cat);
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  setVisibleCount(INITIAL_VISIBLE_COUNT);
                }}
                className={cn(
                  "shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium cursor-pointer transition-all duration-150 ease-out border active:scale-95",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-xs active:bg-onyx-900"
                    : "bg-card text-muted-foreground border-border hover:bg-blue-bell-50 hover:border-blue-bell-200 hover:text-blue-bell-800 active:bg-blue-bell-100",
                )}
              >
                {cat}
              </button>
            );
          })}

          {filterPreorderOnly && (
            <button
              type="button"
              onClick={() => setFilterPreorderOnly(false)}
              className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold bg-commerce-subtle text-commerce-subtle-text border border-commerce-subtle-border flex items-center gap-1.5 cursor-pointer transition-all duration-150 active:scale-95 shadow-2xs hover:bg-blue-bell-100"
            >
              <span className="size-1.5 rounded-full bg-commerce animate-pulse" />
              <span>Pre-Orders Only</span>
              <LuX className="size-3 text-commerce-subtle-text/80 hover:text-commerce-subtle-text" />
            </button>
          )}
        </div>
      </div>

      {/* Results Count & Status */}
      <div className="mb-6 flex items-center justify-between text-xs text-neutral-500">
        <p>
          {isLoading ? (
            <span>Loading live collection...</span>
          ) : (
            <>
              Showing{" "}
              <span className="font-medium text-neutral-900">
                {displayedProducts.length}
              </span>{" "}
              of{" "}
              <span className="font-medium text-neutral-900">
                {filteredProducts.length}
              </span>{" "}
              products
            </>
          )}
        </p>

        {(searchQuery || selectedCategory !== "All" || filterPreorderOnly) && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 transition-colors duration-150 cursor-pointer active:scale-95"
          >
            <LuRotateCcw className="size-3" />
            <span>Reset filters</span>
          </button>
        )}
      </div>

      {/* Product Grid / Skeleton */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, idx) => (
            <ProductSkeleton key={idx} />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50/50 p-12 text-center">
          <h3 className="text-base font-medium text-neutral-900">
            No products found
          </h3>
          <p className="mt-1 text-xs text-neutral-500">
            Try adjusting your search or category filter.
          </p>
          <div className="mt-4">
            <Button
              size="sm"
              variant="outline"
              onClick={handleResetFilters}
              className="text-xs"
            >
              Clear all filters
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {displayedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Load More Button */}
      {!isLoading && hasMore && (
        <div className="mt-12 text-center">
          <Button
            size="lg"
            variant="outline"
            onClick={() => setVisibleCount((prev) => prev + LOAD_MORE_STEP)}
            className="rounded-xl px-8 font-medium gap-2 text-sm cursor-pointer transition-all duration-150 ease-out active:scale-[0.98]"
          >
            <span>See More Products</span>
            <LuArrowDown className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-900">
      <Navbar />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="mx-auto max-w-7xl px-4 py-16 text-center text-sm text-neutral-400">
              Loading products...
            </div>
          }
        >
          <ProductsContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
