"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  orderApi,
  OrderRecord,
  OrderStatus,
  ORDER_STATUS_CONFIG,
} from "@/lib/orderApi";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LuArrowLeft,
  LuShoppingBag,
  LuCopy,
  LuCheck,
  LuPhone,
  LuMail,
  LuMapPin,
  LuCalendar,
  LuExternalLink,
  LuLoader,
  LuCircleAlert,
  LuTruck,
  LuShieldCheck,
  LuPackage,
} from "react-icons/lu";

interface OrderDetailsPageProps {
  params: Promise<{ id: string }>;
}

const ALL_STATUSES: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

export default function AdminOrderDetailsPage({ params }: OrderDetailsPageProps) {
  const { id } = use(params);

  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedInvoice, setCopiedInvoice] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setIsLoading(true);

    orderApi
      .getById(id)
      .then((data) => {
        if (active) setOrder(data);
      })
      .catch((err: any) => {
        if (active) {
          setErrorMessage(
            err?.response?.data?.message || "Order not found or invalid ID."
          );
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedInvoice(true);
    setTimeout(() => setCopiedInvoice(false), 2000);
  };

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!order) return;
    setIsUpdating(true);
    setFeedback(null);
    try {
      const updated = await orderApi.updateStatus(order._id, newStatus);
      setOrder(updated);
      setFeedback(`Order status updated to ${newStatus}`);
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-xs text-neutral-400 gap-2">
        <LuLoader className="size-6 animate-spin text-neutral-600" />
        <span>Loading order details...</span>
      </div>
    );
  }

  if (errorMessage || !order) {
    return (
      <div className="max-w-lg mx-auto py-12 text-center">
        <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400 mb-4">
          <LuCircleAlert className="size-6 text-rose-500" />
        </div>
        <h2 className="text-base font-bold text-neutral-900">
          Order Not Found
        </h2>
        <p className="mt-1 text-xs text-neutral-500">
          {errorMessage || "The requested order could not be loaded."}
        </p>
        <Link href="/admin/orders" className="mt-6 inline-block">
          <Button variant="outline" size="sm" className="rounded-xl text-xs">
            <LuArrowLeft className="size-3.5 mr-1" />
            <span>Back to Orders List</span>
          </Button>
        </Link>
      </div>
    );
  }

  const product =
    typeof order.item?.productId === "object" && order.item?.productId !== null
      ? (order.item.productId as any)
      : null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div className="flex items-center gap-3">
          <Link href="/admin/orders">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 rounded-xl border-neutral-200 text-neutral-600 hover:text-neutral-900 cursor-pointer"
              title="Back to Orders"
            >
              <LuArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-neutral-950 font-mono">
                Order #{order._id}
              </h1>
              <button
                type="button"
                onClick={() => handleCopy(order._id)}
                className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                title="Copy Invoice ID"
              >
                {copiedInvoice ? (
                  <LuCheck className="size-3.5 text-emerald-600" />
                ) : (
                  <LuCopy className="size-3.5" />
                )}
              </button>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5 flex items-center gap-2">
              <LuCalendar className="size-3 text-neutral-400" />
              <span>
                Placed on{" "}
                {new Date(order.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </p>
          </div>
        </div>

        {/* Status Dropdown & Public Tracking Link */}
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border capitalize",
              ORDER_STATUS_CONFIG[order.status]?.badgeVariant ||
                "bg-neutral-100 text-neutral-800"
            )}
          >
            <span className="size-1.5 rounded-full bg-current" />
            <span>{ORDER_STATUS_CONFIG[order.status]?.label || order.status}</span>
          </span>

          <select
            disabled={isUpdating}
            value={order.status}
            onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
            className="h-8 text-xs font-medium rounded-xl border border-neutral-200 bg-white px-2.5 text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900 cursor-pointer disabled:opacity-50"
          >
            {ALL_STATUSES.map((st) => (
              <option key={st} value={st}>
                Mark as {ORDER_STATUS_CONFIG[st]?.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {feedback && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs text-emerald-800 animate-fade-in">
          ✓ {feedback}
        </div>
      )}

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Customer & Shipping (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Customer Details Box */}
          <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-900">
              Customer Profile
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-neutral-400 block">Full Name</span>
                <span className="font-semibold text-neutral-900 text-sm">
                  {order.user?.name}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-neutral-400 block">Phone Number</span>
                <a
                  href={`tel:${order.user?.phone}`}
                  className="font-mono font-semibold text-neutral-900 hover:underline flex items-center gap-1.5"
                >
                  <LuPhone className="size-3 text-neutral-500" />
                  <span>{order.user?.phone}</span>
                </a>
              </div>

              <div className="space-y-1">
                <span className="text-neutral-400 block">Email Address</span>
                <span className="text-neutral-700">
                  {order.user?.email || "Not provided"}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-neutral-400 block">Customer Division</span>
                <span className="font-medium text-neutral-900 capitalize">
                  {order.user?.division} Division
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Address Box */}
          <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <LuMapPin className="size-4 text-neutral-600" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-900">
                Delivery Location
              </h2>
            </div>

            <div className="rounded-xl bg-neutral-50 border border-neutral-200/70 p-4 space-y-2 text-xs">
              <div className="text-neutral-900 font-medium leading-relaxed">
                {order.user?.fullAddress}
              </div>
              <div className="text-neutral-600 capitalize">
                {order.user?.city}, {order.user?.division}
                {order.user?.zipCode && ` - ${order.user.zipCode}`}
              </div>
              <div className="pt-2 border-t border-neutral-200/60 text-[11px] text-neutral-500 flex items-center gap-1.5">
                <LuTruck className="size-3.5 text-neutral-600 shrink-0" />
                <span>
                  Bangladesh domestic delivery handled with customs clearance.
                </span>
              </div>
            </div>
          </div>

          {/* Payment & Financials */}
          <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-900">
              Payment Summary
            </h2>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Payment Method:</span>
                <span className="font-semibold text-neutral-900 uppercase">
                  {order.paymentMethod === "cod"
                    ? "Cash on Delivery (COD)"
                    : "Online Payment"}
                </span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Customs Duties:</span>
                <span className="font-medium text-emerald-600">Cleared (৳0)</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Doorstep Delivery:</span>
                <span className="font-medium text-emerald-600">Free</span>
              </div>
              <div className="flex justify-between font-bold text-neutral-950 pt-2 border-t border-neutral-100 text-sm">
                <span>Total Amount Payable:</span>
                <span className="font-mono">
                  ৳{order.totalAmount?.toLocaleString("en-BD")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Ordered Product Showcase (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-900">
              Ordered Product
            </h2>

            {product ? (
              <div className="space-y-4">
                {/* Product Image */}
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-neutral-200/80 bg-neutral-100">
                  <Image
                    src={
                      product.featuredImage ||
                      product.gallary?.[0] ||
                      "/placeholder-product.svg"
                    }
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-neutral-950">
                    {product.name}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {product.deliveryHeading || "Air Freight Direct Import"}
                  </p>
                </div>

                {/* Specs Box */}
                <div className="rounded-xl bg-neutral-50 border border-neutral-200/80 p-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Selected Color:</span>
                    <span className="inline-flex items-center gap-1.5 font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-neutral-200">
                      <span
                        className="size-2.5 rounded-full border border-black/10 shrink-0"
                        style={{ backgroundColor: order.item?.color }}
                      />
                      <span>{order.item?.color}</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Quantity:</span>
                    <span className="font-bold font-mono text-neutral-900">
                      × {order.item?.quantity}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Unit Price:</span>
                    <span className="font-mono text-neutral-900">
                      ৳{product.salePrice?.toLocaleString("en-BD")}
                    </span>
                  </div>
                </div>

                {/* Link to Admin Product Edit */}
                <Link
                  href={`/admin/products/${product._id}`}
                  className="block text-center text-xs text-neutral-600 hover:text-neutral-900 underline pt-1"
                >
                  Edit Product Inventory in Catalog
                </Link>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-neutral-50 text-xs text-neutral-500 space-y-2">
                <div>
                  <span className="text-neutral-400 block">Product ID:</span>
                  <span className="font-mono text-neutral-900">
                    {typeof order.item?.productId === "string"
                      ? order.item.productId
                      : "Unreferenced"}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block">Color & Quantity:</span>
                  <span className="font-mono text-neutral-900">
                    {order.item?.color} × {order.item?.quantity}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Tracking Preview Link */}
          <div className="rounded-2xl border border-neutral-200/90 bg-neutral-50/70 p-5 text-center space-y-2">
            <h3 className="text-xs font-semibold text-neutral-900">
              Customer Tracking Link
            </h3>
            <p className="text-[11px] text-neutral-500">
              Share this direct link with the customer to check real-time status.
            </p>
            <Link
              href={`/track?invoiceId=${encodeURIComponent(
                order._id
              )}&phone=${encodeURIComponent(order.user?.phone || "")}`}
              target="_blank"
              className="inline-flex items-center gap-1 text-xs font-medium text-neutral-900 hover:underline pt-1"
            >
              <span>Open Customer Tracking Page</span>
              <LuExternalLink className="size-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
