"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  productApi,
  ProductFilterQuery,
  ProductItem,
  ProductPagination,
  ProductStatus,
} from "@/lib/productApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  LuPlus,
  LuRefreshCw,
  LuSearch,
  LuX,
  LuPencil,
  LuTrash2,
  LuEye,
  LuPackage,
  LuCircleAlert,
  LuCircleCheck,
  LuChevronLeft,
  LuChevronRight,
  LuCalendar,
  LuImage,
} from "react-icons/lu";
import Image from "next/image";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [pagination, setPagination] = useState<ProductPagination>({
    totalData: 0,
    totalPage: 1,
    currentPage: 1,
    nextPage: 0,
    prevPage: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  // Debounce search input to avoid spamming server per keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset to page 1 whenever filters or search query change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, categoryFilter]);

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<ProductItem | null>(null);

  const refreshList = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const queryParams: ProductFilterQuery = {
        page,
        limit: 10,
      };
      if (statusFilter !== "all") {
        queryParams.status = statusFilter;
      }
      if (categoryFilter.trim()) {
        queryParams.category = categoryFilter.trim();
      }
      if (debouncedSearch.trim()) {
        queryParams.search = debouncedSearch.trim();
      }

      const data = await productApi.getAll(queryParams);
      setProducts(data.result || []);
      if (data.pagination) {
        setPagination(data.pagination);
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to load products from server.";
      setFeedback({ type: "error", text: msg });
    } finally {
      setIsRefreshing(false);
    }
  }, [page, statusFilter, categoryFilter, debouncedSearch]);

  useEffect(() => {
    let active = true;

    const queryParams: ProductFilterQuery = {
      page,
      limit: 10,
    };
    if (statusFilter !== "all") {
      queryParams.status = statusFilter;
    }
    if (categoryFilter.trim()) {
      queryParams.category = categoryFilter.trim();
    }
    if (debouncedSearch.trim()) {
      queryParams.search = debouncedSearch.trim();
    }

    productApi
      .getAll(queryParams)
      .then((data) => {
        if (!active) return;
        setProducts(data.result || []);
        if (data.pagination) {
          setPagination(data.pagination);
        }
      })
      .catch((err: unknown) => {
        if (!active) return;
        const msg =
          err instanceof Error
            ? err.message
            : "Failed to load products from server.";
        setFeedback({ type: "error", text: msg });
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      });

    return () => {
      active = false;
    };
  }, [page, statusFilter, categoryFilter, debouncedSearch]);

  const handleDelete = async () => {
    if (!productToDelete) return;
    setDeletingId(productToDelete._id);
    try {
      await productApi.delete(productToDelete._id);
      setFeedback({
        type: "success",
        text: `Product "${productToDelete.name}" deleted successfully.`,
      });
      setProductToDelete(null);

      // Handle pagination fallback if deleting last item on current page
      const nextTargetPage =
        products.length === 1 && page > 1 ? page - 1 : page;
      if (nextTargetPage !== page) {
        setPage(nextTargetPage);
      } else {
        await refreshList();
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to delete product.";
      setFeedback({ type: "error", text: msg });
    } finally {
      setDeletingId(null);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  // Client-level search logic removed: Products are returned pre-filtered from server!
  const displayedProducts = products;

  const getStatusBadge = (status: ProductStatus) => {
    switch (status) {
      case "live":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Live
          </span>
        );
      case "pre":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
            <span className="size-1.5 rounded-full bg-amber-500" />
            Pre-Order
          </span>
        );
      case "featured":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
            <span className="size-1.5 rounded-full bg-purple-500" />
            Featured
          </span>
        );
      case "hidden":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-neutral-100 text-neutral-600 border border-neutral-200">
            <span className="size-1.5 rounded-full bg-neutral-400" />
            Hidden
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-950">
            Products
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage inventory, pricing, and availability.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshList}
            disabled={isRefreshing}
            className="rounded-xl h-8.5 text-xs gap-1.5 border-neutral-200 hover:bg-neutral-100 cursor-pointer"
          >
            <LuRefreshCw
              className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          </Button>

          <Link href="/admin/products/new">
            <Button
              size="sm"
              className="rounded-xl h-8.5 text-xs gap-1.5 bg-neutral-900 text-white hover:bg-neutral-800 cursor-pointer shadow-xs"
            >
              <LuPlus className="size-3.5" />
              <span>Add Product</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`flex items-center gap-2.5 p-3 rounded-xl text-xs shadow-xs ${
            feedback.type === "success"
              ? "bg-emerald-900 text-white"
              : "bg-destructive text-white"
          }`}
        >
          {feedback.type === "success" ? (
            <LuCircleCheck className="size-4 text-emerald-300 shrink-0" />
          ) : (
            <LuCircleAlert className="size-4 text-white shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-neutral-200/90 bg-card p-4 shadow-subtle flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 min-w-[200px]">
          <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-neutral-400" />
          <Input
            type="text"
            placeholder="Search products by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-8 h-9 text-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
              title="Clear search"
            >
              <LuX className="size-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center rounded-xl border border-neutral-200 bg-neutral-50 p-1 text-xs">
            {(["all", "live", "pre", "featured", "hidden"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setStatusFilter(s);
                  setPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-colors cursor-pointer ${
                  statusFilter === s
                    ? "bg-white text-neutral-950 shadow-xs"
                    : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                {s === "pre" ? "Pre-order" : s}
              </button>
            ))}
          </div>

          {/* Category Input Filter */}
          <div className="w-36">
            <Input
              type="text"
              placeholder="Category filter"
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="h-9 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Products Table Container */}
      <div className="rounded-2xl border border-neutral-200/90 bg-card overflow-hidden shadow-subtle">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <LuRefreshCw className="size-6 animate-spin text-neutral-400 mb-2" />
            <p className="text-xs text-neutral-500 font-medium">
              Loading products...
            </p>
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="py-16 px-4 flex flex-col items-center justify-center text-center">
            <div className="size-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-500 mb-3">
              <LuPackage className="size-6 stroke-[1.8]" />
            </div>
            <h3 className="text-sm font-semibold text-neutral-900">
              No products found
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mt-1 mb-4">
              {searchQuery || statusFilter !== "all" || categoryFilter
                ? "No products match current criteria. Try adjusting your filters."
                : "No products exist in the catalog yet."}
            </p>
            <Link href="/admin/products/new">
              <Button
                size="sm"
                className="rounded-xl h-8.5 text-xs bg-neutral-900 text-white hover:bg-neutral-800"
              >
                <LuPlus className="size-3.5 mr-1" />
                Add First Product
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200/90 bg-neutral-50/75 text-neutral-500 font-medium">
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Pricing</th>
                  <th className="py-3 px-4">Variants</th>
                  <th className="py-3 px-4">Schedule</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {displayedProducts.map((product) => {
                  const discount =
                    product.regularPrice > product.salePrice
                      ? Math.round(
                          ((product.regularPrice - product.salePrice) /
                            product.regularPrice) *
                            100
                        )
                      : null;
                  const totalStock = (product.color || []).reduce(
                    (sum, c) => sum + (Number(c.stock) || 0),
                    0
                  );

                  return (
                    <tr
                      key={product._id}
                      className="hover:bg-neutral-50/60 transition-colors"
                    >
                      {/* Name & Slug */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="flex items-start gap-3">
                          {product.featuredImage ? (
                            <div className="relative size-10 rounded-lg overflow-hidden border border-neutral-200 bg-neutral-50 shrink-0 shadow-xs">
                              <Image
                                src={product.featuredImage}
                                alt={product.name}
                                fill
                                sizes="40px"
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                          ) : (
                            <div className="size-10 rounded-lg border border-neutral-200 bg-neutral-100 flex items-center justify-center text-neutral-400 shrink-0">
                              <LuImage className="size-4" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <Link
                              href={`/admin/products/${product._id}`}
                              className="font-semibold text-neutral-900 hover:underline block leading-tight truncate max-w-[200px]"
                              title={product.name}
                            >
                              {product.name}
                            </Link>
                            <div className="flex items-center gap-2 mt-1 text-[11px] text-neutral-400 font-mono">
                              <span className="truncate max-w-[140px]" title={product.slug}>
                                /{product.slug}
                              </span>
                            </div>
                            <div className="text-[10px] text-neutral-400 mt-0.5">
                              {product.Importer}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 align-top text-neutral-700">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-neutral-100 text-[11px] font-medium text-neutral-800">
                          {product.category}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 align-top">
                        {getStatusBadge(product.status)}
                      </td>

                      {/* Pricing */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-semibold text-neutral-900">
                          ৳{(product.salePrice ?? 0).toLocaleString()}
                        </div>
                        {product.regularPrice > product.salePrice && (
                          <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                            <span className="line-through">
                              ৳{(product.regularPrice ?? 0).toLocaleString()}
                            </span>
                            {discount && (
                              <span className="text-emerald-700 font-medium">
                                -{discount}%
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Colors & Stock */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="flex items-center gap-1 mb-1">
                          {(product.color || []).slice(0, 4).map((c, idx) => {
                            const isHex = /^#([0-9A-F]{3}){1,2}$/i.test(c.value);
                            return (
                              <span
                                key={c._id || idx}
                                className="size-3.5 rounded-full border border-neutral-300 shrink-0"
                                style={{
                                  backgroundColor: isHex ? c.value : "#999999",
                                }}
                                title={`${c.value} (Stock: ${c.stock})`}
                              />
                            );
                          })}
                          {(product.color || []).length > 4 && (
                            <span className="text-[10px] text-neutral-400 font-mono">
                              +{(product.color || []).length - 4}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-neutral-500">
                          <span className="font-medium text-neutral-800">
                            {totalStock}
                          </span>{" "}
                          units
                        </div>
                      </td>

                      {/* Pre-Order / Batch Info */}
                      <td className="py-3.5 px-4 align-top text-neutral-500 text-[11px]">
                        {product.status === "pre" && product.preOrderDetails ? (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1 text-amber-900 font-medium">
                              <LuCalendar className="size-3 text-amber-700" />
                              <span>
                                {product.preOrderDetails.launchDate
                                  ? new Date(
                                      product.preOrderDetails.launchDate
                                    ).toLocaleDateString()
                                  : "TBD"}
                              </span>
                            </div>
                            <div className="text-[10px] text-amber-800 font-medium">
                              {totalStock} lots (colors)
                            </div>
                          </div>
                        ) : (
                          <span className="text-neutral-400">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 align-top text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/admin/products/${product._id}`}>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              className="rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
                              title="View Details"
                            >
                              <LuEye className="size-3.5" />
                            </Button>
                          </Link>

                          <Link href={`/admin/products/${product._id}/edit`}>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              className="rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
                              title="Edit Product"
                            >
                              <LuPencil className="size-3.5" />
                            </Button>
                          </Link>

                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => setProductToDelete(product)}
                            className="rounded-lg text-neutral-400 hover:text-destructive hover:bg-destructive/10"
                            title="Delete Product"
                          >
                            <LuTrash2 className="size-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalData > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-100 bg-neutral-50/50 text-xs text-neutral-500">
            <div>
              Showing {displayedProducts.length} of {pagination.totalData} products
              (Page {pagination.currentPage} of {pagination.totalPage})
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.currentPage <= 1 || isLoading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-xl h-8 px-2.5 text-xs gap-1 border-neutral-200"
              >
                <LuChevronLeft className="size-3.5" />
                <span>Previous</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={
                  pagination.currentPage >= pagination.totalPage || isLoading
                }
                onClick={() => setPage((p) => p + 1)}
                className="rounded-xl h-8 px-2.5 text-xs gap-1 border-neutral-200"
              >
                <span>Next</span>
                <LuChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-card p-6 shadow-xl space-y-4">
            <div className="flex size-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive mb-1">
              <LuTrash2 className="size-5" />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-neutral-950">
                Delete Product
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-neutral-900">
                  {productToDelete.name}
                </span>
                ? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setProductToDelete(null)}
                disabled={Boolean(deletingId)}
                className="rounded-xl text-xs h-8.5 border-neutral-200"
              >
                Cancel
              </Button>

              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={Boolean(deletingId)}
                className="rounded-xl text-xs h-8.5 bg-destructive text-white hover:bg-destructive/90 gap-1.5"
              >
                {deletingId ? (
                  <>
                    <LuRefreshCw className="size-3 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
