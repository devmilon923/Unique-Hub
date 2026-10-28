"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  orderApi,
  OrderRecord,
  OrderStatus,
  DivisionType,
  BANGLADESH_DIVISIONS,
  ORDER_STATUS_CONFIG,
} from "@/lib/orderApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  LuSearch,
  LuRefreshCw,
  LuShoppingBag,
  LuChevronLeft,
  LuChevronRight,
  LuCopy,
  LuCheck,
  LuExternalLink,
  LuFilter,
  LuRotateCcw,
  LuLoader,
  LuTruck,
  LuCircleAlert,
} from "react-icons/lu";

const ALL_STATUSES: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filters & Pagination State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [divisionFilter, setDivisionFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);

  // Status updating map (orderId -> boolean)
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setErrorMessage(null);
      const query: any = {
        page: currentPage,
        limit: 10,
      };

      if (search.trim()) {
        query.search = search.trim();
      }
      if (statusFilter !== "all") {
        query.status = statusFilter;
      }
      if (divisionFilter !== "all") {
        query.division = divisionFilter;
      }

      const res = await orderApi.getAll(query);
      setOrders(res.orders || []);
      setTotalPages(res.pagination?.totalPage || 1);
      setTotalData(res.pagination?.totalData || 0);
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message || "Failed to load orders from server."
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [currentPage, search, statusFilter, divisionFilter]);

  useEffect(() => {
    setIsLoading(true);
    fetchOrders();
  }, [fetchOrders]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchOrders();
  };

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    setFeedback(null);
    try {
      const updated = await orderApi.updateStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((ord) => (ord._id === orderId ? { ...ord, status: updated.status } : ord))
      );
      setFeedback(`Order #${orderId.slice(-6)} marked as ${newStatus}`);
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to update order status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setDivisionFilter("all");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-950">
              Orders Management
            </h1>
            <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-semibold text-neutral-700">
              {totalData} {totalData === 1 ? "order" : "orders"}
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            View customer orders, delivery locations, and update shipment progress.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="rounded-xl h-8.5 text-xs gap-1.5 border-neutral-200 hover:bg-neutral-100 cursor-pointer"
          >
            <LuRefreshCw className={cn("size-3.5", isRefreshing && "animate-spin")} />
            <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          </Button>

          <Link href="/track" target="_blank">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl h-8.5 text-xs gap-1.5 border-neutral-200 hover:bg-neutral-100 cursor-pointer text-neutral-700"
            >
              <span>Customer Tracking</span>
              <LuExternalLink className="size-3 text-neutral-400" />
            </Button>
          </Link>
        </div>
      </div>

      {feedback && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs text-emerald-800 flex items-center justify-between animate-fade-in">
          <span>✓ {feedback}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-emerald-600 hover:text-emerald-900 text-xs font-bold"
          >
            ×
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700 flex items-start gap-2">
          <LuCircleAlert className="size-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="sm:col-span-5 relative">
            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-neutral-400" />
            <Input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by customer name, phone, or order ID..."
              className="h-9 pl-8 text-xs rounded-xl"
            />
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-9 rounded-xl border border-neutral-200 bg-white px-2.5 text-xs font-medium text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              {ALL_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {ORDER_STATUS_CONFIG[st]?.label || st}
                </option>
              ))}
            </select>
          </div>

          {/* Division Filter */}
          <div className="sm:col-span-3">
            <select
              value={divisionFilter}
              onChange={(e) => {
                setDivisionFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-9 rounded-xl border border-neutral-200 bg-white px-2.5 text-xs font-medium text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900 cursor-pointer"
            >
              <option value="all">All Divisions</option>
              {BANGLADESH_DIVISIONS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters */}
          <div className="sm:col-span-1 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              title="Reset Filters"
              className="h-9 w-9 p-0 rounded-xl text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 cursor-pointer"
            >
              <LuRotateCcw className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl border border-neutral-200/90 bg-white shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-neutral-400 flex flex-col items-center justify-center gap-2">
            <LuLoader className="size-5 animate-spin text-neutral-600" />
            <span>Loading orders...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400 mb-3">
              <LuShoppingBag className="size-6" />
            </div>
            <h3 className="text-sm font-semibold text-neutral-900">
              No orders found
            </h3>
            <p className="mt-1 text-xs text-neutral-500 max-w-sm mx-auto">
              No customer orders match your search or filter criteria.
            </p>
            {(search || statusFilter !== "all" || divisionFilter !== "all") && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="mt-4 text-xs rounded-xl"
              >
                Clear all filters
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50/80 border-b border-neutral-200/80 text-neutral-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Invoice ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Product & Spec</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Status & Quick Update</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {orders.map((ord) => {
                  const isUpdating = updatingId === ord._id;
                  const productName =
                    typeof ord.item?.productId === "object" &&
                    ord.item?.productId !== null
                      ? (ord.item.productId as any).name
                      : "Sourced Product";

                  return (
                    <tr
                      key={ord._id}
                      className="hover:bg-neutral-50/60 transition-colors"
                    >
                      {/* Invoice ID */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-neutral-900 text-xs">
                            #{ord._id.slice(-6)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(ord._id)}
                            className="p-1 rounded text-neutral-400 hover:text-neutral-800 hover:bg-neutral-200/60 transition-colors cursor-pointer"
                            title="Copy full Invoice ID"
                          >
                            {copiedId === ord._id ? (
                              <LuCheck className="size-3 text-emerald-600" />
                            ) : (
                              <LuCopy className="size-3" />
                            )}
                          </button>
                        </div>
                        <span className="text-[10px] text-neutral-400 block mt-0.5">
                          {new Date(ord.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>

                      {/* Customer Info */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-neutral-900 block">
                          {ord.user?.name}
                        </span>
                        <span className="text-[11px] font-mono text-neutral-500 block">
                          {ord.user?.phone}
                        </span>
                        <span className="text-[10px] text-neutral-400 capitalize block truncate max-w-[150px]">
                          {ord.user?.city}, {ord.user?.division}
                        </span>
                      </td>

                      {/* Item Info */}
                      <td className="py-3 px-4">
                        <span className="font-medium text-neutral-900 block truncate max-w-[180px]">
                          {productName}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-neutral-500">
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] bg-neutral-100 px-1 py-0.5 rounded border border-neutral-200">
                            <span
                              className="size-2 rounded-full border border-black/10 shrink-0"
                              style={{ backgroundColor: ord.item?.color }}
                            />
                            <span>{ord.item?.color}</span>
                          </span>
                          <span>× {ord.item?.quantity}</span>
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="py-3 px-4 whitespace-nowrap font-mono font-bold text-neutral-900">
                        ৳{ord.totalAmount?.toLocaleString("en-BD")}
                      </td>

                      {/* Payment Method */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-700 uppercase bg-neutral-100 px-2 py-0.5 rounded-md">
                          {ord.paymentMethod === "cod" ? "COD" : "Online"}
                        </span>
                      </td>

                      {/* Status & Quick Updater */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border capitalize",
                              ORDER_STATUS_CONFIG[ord.status]?.badgeVariant ||
                                "bg-neutral-100 text-neutral-700"
                            )}
                          >
                            <span className="size-1 rounded-full bg-current" />
                            {ORDER_STATUS_CONFIG[ord.status]?.label || ord.status}
                          </span>

                          <select
                            disabled={isUpdating}
                            value={ord.status}
                            onChange={(e) =>
                              handleStatusChange(
                                ord._id,
                                e.target.value as OrderStatus
                              )
                            }
                            className="h-7 text-[11px] rounded-lg border border-neutral-200 bg-white px-2 text-neutral-700 focus:outline-none focus:ring-1 focus:ring-neutral-900 cursor-pointer disabled:opacity-50"
                          >
                            {ALL_STATUSES.map((st) => (
                              <option key={st} value={st}>
                                Mark {ORDER_STATUS_CONFIG[st]?.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>

                      {/* View Action */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <Link href={`/admin/orders/${ord._id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs rounded-lg text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 cursor-pointer"
                          >
                            <span>View</span>
                            <LuChevronRight className="size-3.5 ml-0.5" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-neutral-200/80 px-4 py-3 bg-neutral-50/50 text-xs text-neutral-500">
            <span>
              Page <strong className="text-neutral-900">{currentPage}</strong> of{" "}
              <strong className="text-neutral-900">{totalPages}</strong>
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1 || isLoading}
                className="h-8 rounded-xl px-2.5 text-xs border-neutral-200 cursor-pointer"
              >
                <LuChevronLeft className="size-3.5 mr-1" />
                <span>Prev</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages || isLoading}
                className="h-8 rounded-xl px-2.5 text-xs border-neutral-200 cursor-pointer"
              >
                <span>Next</span>
                <LuChevronRight className="size-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
