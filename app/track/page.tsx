"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/sections/Footer";
import {
  orderApi,
  TrackOrderResult,
  ORDER_STATUS_CONFIG,
  OrderStatus,
} from "@/lib/orderApi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LuSearch,
  LuPackage,
  LuCircleCheck,
  LuClock,
  LuTruck,
  LuMapPin,
  LuPhone,
  LuCalendar,
  LuShieldAlert,
  LuLoader,
  LuMessageSquare,
  LuArrowLeft,
  LuCopy,
  LuCheck,
} from "react-icons/lu";

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialInvoiceId = searchParams.get("invoiceId") || "";
  const initialPhone = searchParams.get("phone") || "";

  const [invoiceId, setInvoiceId] = useState(initialInvoiceId);
  const [phone, setPhone] = useState(initialPhone);
  const [isLoading, setIsLoading] = useState(false);
  const [orderData, setOrderData] = useState<TrackOrderResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedInvoice, setCopiedInvoice] = useState(false);

  const fetchTracking = async (inv: string, ph: string) => {
    const trimmedInv = inv.trim();
    const trimmedPhone = ph.trim().replace(/\s+/g, "");

    if (!trimmedInv) {
      setErrorMessage("Please enter your Invoice ID");
      return;
    }
    if (!trimmedPhone) {
      setErrorMessage("Please enter the phone number used during checkout");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await orderApi.track(trimmedInv, trimmedPhone);
      setOrderData(data);
    } catch (err: any) {
      setOrderData(null);
      const msg =
        err?.message ||
        err?.response?.data?.message ||
        "No matching order found. Please verify the Invoice ID and Phone Number.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-search if URL params provided
  useEffect(() => {
    if (initialInvoiceId && initialPhone) {
      fetchTracking(initialInvoiceId, initialPhone);
    }
  }, [initialInvoiceId, initialPhone]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTracking(invoiceId, phone);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedInvoice(true);
    setTimeout(() => setCopiedInvoice(false), 2000);
  };

  // Timeline steps definition
  const timelineSteps: { key: OrderStatus; label: string; desc: string }[] = [
    {
      key: "pending",
      label: "Order Placed",
      desc: "Received and awaiting verification",
    },
    {
      key: "processing",
      label: "Processing",
      desc: "Customs clearance & dispatch preparation",
    },
    {
      key: "shipped",
      label: "Shipped",
      desc: "In transit with Bangladesh courier",
    },
    {
      key: "delivered",
      label: "Delivered",
      desc: "Arrived at doorstep",
    },
  ];

  const getStepStatus = (
    currentStatus: OrderStatus,
    stepKey: OrderStatus,
    stepIndex: number
  ) => {
    if (currentStatus === "cancelled" || currentStatus === "refunded") {
      return "cancelled";
    }

    const orderHierarchy: OrderStatus[] = [
      "pending",
      "processing",
      "shipped",
      "delivered",
    ];
    const currentIndex = orderHierarchy.indexOf(currentStatus);

    if (currentIndex > stepIndex) return "completed";
    if (currentIndex === stepIndex) return "current";
    return "upcoming";
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="text-center max-w-lg mx-auto mb-8">
        <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-800 mb-3 shadow-2xs">
          <LuPackage className="size-6 stroke-[2]" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950">
          Track Your Order
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-neutral-500">
          Enter your Invoice ID and delivery phone number to view live customs
          and delivery progress.
        </p>
      </div>

      {/* Lookup Card Form */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 sm:p-7 shadow-xs mb-8">
        <form
          onSubmit={handleSearch}
          className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-end"
        >
          <div className="sm:col-span-6 space-y-1">
            <label className="text-xs font-semibold text-neutral-700">
              Invoice / Order ID <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Input
                type="text"
                value={invoiceId}
                onChange={(e) => setInvoiceId(e.target.value)}
                placeholder="e.g. 6ae06eecb32cf14cbe869eda"
                className="h-10 text-xs font-mono rounded-xl pl-3"
              />
            </div>
          </div>

          <div className="sm:col-span-4 space-y-1">
            <label className="text-xs font-semibold text-neutral-700">
              Phone Number <span className="text-rose-500">*</span>
            </label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="017XXXXXXXX"
              className="h-10 text-xs font-mono rounded-xl pl-3"
            />
          </div>

          <div className="sm:col-span-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 rounded-xl bg-neutral-900 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors cursor-pointer gap-1.5"
            >
              {isLoading ? (
                <LuLoader className="size-4 animate-spin" />
              ) : (
                <>
                  <LuSearch className="size-3.5" />
                  <span>Track</span>
                </>
              )}
            </Button>
          </div>
        </form>

        {errorMessage && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 flex items-start gap-2">
            <LuShieldAlert className="size-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Tracking Result Card */}
      {orderData && (
        <div className="space-y-6">
          {/* Header Status Bar */}
          <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-500 font-medium">
                    Invoice:
                  </span>
                  <span className="text-sm font-mono font-bold text-neutral-950">
                    #{orderData.invoiceId}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(orderData.invoiceId)}
                    className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                    title="Copy invoice ID"
                  >
                    {copiedInvoice ? (
                      <LuCheck className="size-3.5 text-emerald-600" />
                    ) : (
                      <LuCopy className="size-3.5" />
                    )}
                  </button>
                </div>

                <div className="mt-1 flex items-center gap-3 text-xs text-neutral-500">
                  <span className="flex items-center gap-1">
                    <LuCalendar className="size-3.5 text-neutral-400" />
                    <span>
                      {new Date(orderData.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </span>
                  </span>
                  <span>•</span>
                  <span className="capitalize">
                    {orderData.paymentMethod === "cod"
                      ? "Cash on Delivery"
                      : "Online Payment"}
                  </span>
                </div>
              </div>

              {/* Status Pill */}
              <div>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border",
                    ORDER_STATUS_CONFIG[orderData.status]?.badgeVariant ||
                      "bg-neutral-100 text-neutral-800 border-neutral-200"
                  )}
                >
                  <span className="size-1.5 rounded-full bg-current" />
                  <span className="capitalize">
                    {ORDER_STATUS_CONFIG[orderData.status]?.label ||
                      orderData.status}
                  </span>
                </span>
              </div>
            </div>

            {/* Visual Timeline Progress */}
            <div className="pt-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-6">
                Delivery Progression
              </h3>

              {orderData.status === "cancelled" ||
              orderData.status === "refunded" ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-center">
                  <p className="text-xs font-semibold text-rose-800 capitalize">
                    Order has been {orderData.status}
                  </p>
                  <p className="text-xs text-rose-600 mt-1">
                    If you have questions regarding this change, please contact
                    our support team.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
                  {timelineSteps.map((stepItem, idx) => {
                    const stepState = getStepStatus(
                      orderData.status,
                      stepItem.key,
                      idx
                    );
                    return (
                      <div
                        key={stepItem.key}
                        className={cn(
                          "flex flex-col p-3 rounded-xl border transition-colors",
                          stepState === "completed"
                            ? "bg-emerald-50/50 border-emerald-200 text-emerald-950"
                            : stepState === "current"
                            ? "bg-neutral-900 border-neutral-900 text-white shadow-xs"
                            : "bg-neutral-50/80 border-neutral-200/80 text-neutral-400"
                        )}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span
                            className={cn(
                              "text-[10px] font-mono font-bold uppercase",
                              stepState === "current"
                                ? "text-neutral-300"
                                : "text-neutral-400"
                            )}
                          >
                            Step 0{idx + 1}
                          </span>
                          {stepState === "completed" ? (
                            <LuCircleCheck className="size-4 text-emerald-600" />
                          ) : stepState === "current" ? (
                            <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
                          ) : null}
                        </div>
                        <span className="text-xs font-bold leading-tight">
                          {stepItem.label}
                        </span>
                        <span
                          className={cn(
                            "text-[10px] mt-1 leading-snug",
                            stepState === "current"
                              ? "text-neutral-300"
                              : "text-neutral-500"
                          )}
                        >
                          {stepItem.desc}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Details 2-Column Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Ordered Item Box */}
            <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-900">
                Item Details
              </h3>

              <div className="flex items-start justify-between gap-3 p-3 rounded-xl bg-neutral-50 border border-neutral-200/70">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {typeof orderData.item?.productId === "object" &&
                    orderData.item.productId !== null &&
                    ((orderData.item.productId as any).featuredImage ||
                      (orderData.item.productId as any).image) && (
                      <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-white">
                        <Image
                          src={
                            (orderData.item.productId as any).featuredImage ||
                            (orderData.item.productId as any).image
                          }
                          alt={
                            (orderData.item.productId as any).name || "Product"
                          }
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                  <div className="space-y-1 flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-neutral-950 truncate">
                      {typeof orderData.item?.productId === "object" &&
                      orderData.item.productId !== null
                        ? (orderData.item.productId as any).name
                        : "UniqueHub Sourced Item"}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                      <span>Color:</span>
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] text-neutral-700 bg-white px-1.5 py-0.5 rounded border border-neutral-200">
                        <span
                          className="size-2.5 rounded-full border border-black/10 shrink-0"
                          style={{ backgroundColor: orderData.item?.color }}
                        />
                        <span>{orderData.item?.color}</span>
                      </span>
                    </div>
                    <div className="text-xs text-neutral-500">
                      Quantity:{" "}
                      <strong className="text-neutral-900 font-mono">
                        {orderData.item?.quantity}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-neutral-950">
                    ৳{orderData.totalAmount.toLocaleString("en-BD")}
                  </span>
                  <div className="text-[10px] text-neutral-400 mt-0.5">
                    Clearance Included
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-neutral-100 text-xs">
                {orderData.deliveryFee !== undefined && (
                  <div className="flex justify-between items-center text-neutral-500">
                    <span>Delivery Charge:</span>
                    <span className="font-mono font-medium text-neutral-800">
                      {orderData.deliveryFee === 0 ? (
                        <span className="text-emerald-600 font-semibold">FREE</span>
                      ) : (
                        `৳${orderData.deliveryFee.toLocaleString("en-BD")}`
                      )}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-1 border-t border-neutral-100">
                  <span className="text-neutral-500 font-medium">Total Payable:</span>
                  <span className="text-base font-bold font-mono text-neutral-950">
                    ৳{orderData.totalAmount.toLocaleString("en-BD")}
                  </span>
                </div>
              </div>
            </div>

            {/* Recipient & Shipping Box */}
            <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-900">
                Delivery Information
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <LuPhone className="size-4 text-neutral-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-neutral-500 block">Recipient:</span>
                    <span className="font-semibold text-neutral-900">
                      {orderData.customerName || orderData.name} (
                      {orderData.phone})
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <LuMapPin className="size-4 text-neutral-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-neutral-500 block">Destination:</span>
                    <span className="font-medium text-neutral-900 leading-relaxed block">
                      {orderData.fullAddress}
                    </span>
                    <span className="text-neutral-500 capitalize mt-0.5 block">
                      {orderData.city}, {orderData.division}
                    </span>
                  </div>
                </div>
              </div>

              {/* WhatsApp Help CTA */}
              <div className="pt-3 border-t border-neutral-100">
                <a
                  href={`https://wa.me/8801811987654?text=${encodeURIComponent(
                    `Hello UniqueHub support, I am inquiring about my order #${orderData.invoiceId}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-900 py-2.5 px-3 text-xs font-medium transition-colors cursor-pointer"
                >
                  <LuMessageSquare className="size-4 text-neutral-700" />
                  <span>Chat with Support on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50/40 text-neutral-900">
      <Navbar />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="mx-auto max-w-4xl px-4 py-16 text-center text-sm text-neutral-400">
              Loading tracking portal...
            </div>
          }
        >
          <TrackOrderContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
