"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  productApi,
  ProductItem,
} from "@/lib/productApi";
import {
  LuRefreshCw,
  LuBoxes,
  LuExternalLink,
  LuCircleCheck,
  LuLogOut,
  LuShieldCheck,
  LuPlus,
  LuArrowRight,
} from "react-icons/lu";

export default function AdminDashboardPage() {
  const { user, refreshProfile, logout } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Products preview state
  const [recentProducts, setRecentProducts] = useState<ProductItem[]>([]);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  useEffect(() => {
    let active = true;

    productApi
      .getAll({ limit: 5 })
      .then((data) => {
        if (!active) return;
        setRecentProducts(data.result || []);
        setTotalProducts(data.pagination?.totalData || 0);
      })
      .catch(() => {
        // Non-blocking
      })
      .finally(() => {
        if (active) setIsLoadingProducts(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setFeedback(null);
    try {
      const updated = await refreshProfile();
      const data = await productApi.getAll({ limit: 5 });
      setRecentProducts(data.result || []);
      setTotalProducts(data.pagination?.totalData || 0);
      setFeedback(
        updated
          ? "Session and inventory data refreshed."
          : "Session expired. Please log in again."
      );
    } catch {
      setFeedback("Failed to reach server.");
    } finally {
      setIsRefreshing(false);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-950">
            Admin Console
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage UniqueHub products, pricing, and catalog.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="rounded-xl h-8.5 text-xs gap-1.5 border-neutral-200 hover:bg-neutral-100 cursor-pointer"
          >
            <LuRefreshCw className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>{isRefreshing ? "Checking..." : "Refresh"}</span>
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

          <Link href="/admin/products">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl h-8.5 text-xs gap-1.5 border-neutral-200 hover:bg-neutral-100 cursor-pointer"
            >
              <LuBoxes className="size-3.5" />
              <span>Products</span>
            </Button>
          </Link>
        </div>
      </div>

      {feedback && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-neutral-900 text-white text-xs shadow-xs">
          <LuCircleCheck className="size-4 text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-neutral-200/90 bg-card p-5 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">
              Total Catalog Products
            </span>
            <div className="size-8 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-800">
              <LuBoxes className="size-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-neutral-950 mt-2">
            {isLoadingProducts ? "—" : totalProducts}
          </div>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-600 hover:text-neutral-950 mt-2 transition-colors"
          >
            <span>View all products</span>
            <LuArrowRight className="size-3" />
          </Link>
        </div>

        <div className="rounded-2xl border border-neutral-200/90 bg-card p-5 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">
              Product Actions
            </span>
            <div className="size-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <LuPlus className="size-4" />
            </div>
          </div>
          <div className="text-sm font-semibold text-neutral-950 mt-2">
            Manage Catalog
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Link href="/admin/products/new">
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-neutral-900 text-white font-medium hover:bg-neutral-800">
                + New Product
              </span>
            </Link>
            <Link href="/admin/products">
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 font-medium hover:bg-neutral-200">
                Inventory List
              </span>
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200/90 bg-card p-5 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">
              Storefront Status
            </span>
            <div className="size-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <LuExternalLink className="size-4" />
            </div>
          </div>
          <div className="text-sm font-semibold text-neutral-950 mt-2">
            Active Storefront
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-600 hover:text-neutral-950 mt-2 transition-colors"
          >
            <span>Browse customer view</span>
            <LuArrowRight className="size-3" />
          </Link>
        </div>
      </div>

      {/* Recent Products Table Preview */}
      <div className="rounded-2xl border border-neutral-200/90 bg-card overflow-hidden shadow-subtle">
        <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-neutral-950">
              Recent Products
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Latest items synchronized from the database.
            </p>
          </div>
          <Link href="/admin/products">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl h-8 text-xs border-neutral-200 hover:bg-neutral-100 cursor-pointer"
            >
              <span>View All</span>
              <LuArrowRight className="size-3 ml-1" />
            </Button>
          </Link>
        </div>

        {isLoadingProducts ? (
          <div className="py-12 text-center text-xs text-neutral-500">
            <LuRefreshCw className="size-4 animate-spin mx-auto mb-1 text-neutral-400" />
            Loading recent products...
          </div>
        ) : recentProducts.length === 0 ? (
          <div className="py-12 text-center text-xs text-neutral-500">
            No products found in backend database.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/75 text-neutral-500 font-medium">
                  <th className="py-2.5 px-4">Name</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Price</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {recentProducts.map((p) => (
                  <tr key={p._id} className="hover:bg-neutral-50/50">
                    <td className="py-3 px-4 font-medium text-neutral-900">
                      <Link
                        href={`/admin/products/${p._id}`}
                        className="hover:underline"
                      >
                        {p.name}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-neutral-600">
                      <span className="px-2 py-0.5 rounded-md bg-neutral-100 text-[11px]">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="capitalize font-medium text-neutral-700">
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-neutral-900">
                      ৳{(p.salePrice ?? 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/admin/products/${p._id}`}
                        className="text-[11px] font-medium text-neutral-600 hover:text-neutral-950 hover:underline"
                      >
                        Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Profile Overview */}
      <div className="rounded-2xl border border-neutral-200/90 bg-card p-5 sm:p-6 shadow-subtle">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-neutral-100 text-neutral-800">
              <LuShieldCheck className="size-4.5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-neutral-950">
                {user?.name || "Administrator"}
              </p>
              <p className="text-[11px] font-mono text-neutral-500">
                {user?.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-neutral-100 text-[10px] font-mono font-medium text-neutral-700 border border-neutral-200/70">
              {user?.role?.toUpperCase()}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="rounded-xl h-7.5 px-2.5 text-xs text-destructive border-destructive/20 hover:bg-destructive/10 cursor-pointer gap-1"
            >
              <LuLogOut className="size-3" />
              <span>Logout</span>
            </Button>
          </div>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
          <div>
            <dt className="text-neutral-400 font-medium text-[11px]">User ID</dt>
            <dd className="font-mono text-neutral-800 mt-0.5 truncate" title={user?.id}>
              {user?.id || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-neutral-400 font-medium text-[11px]">Role</dt>
            <dd className="text-neutral-800 mt-0.5 capitalize font-medium">
              {user?.role || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-neutral-400 font-medium text-[11px]">Session</dt>
            <dd className="text-emerald-700 font-medium mt-0.5 inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Active
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
