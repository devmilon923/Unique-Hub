"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart, CartItem } from "@/context/CartContext";
import {
  orderApi,
  DivisionType,
  BANGLADESH_DIVISIONS,
  PaymentMethod,
  CreateOrderResult,
  getDeliveryFee,
} from "@/lib/orderApi";
import { productApi } from "@/lib/productApi";
import {
  LuX,
  LuTrash2,
  LuShoppingBag,
  LuMinus,
  LuPlus,
  LuArrowRight,
  LuArrowLeft,
  LuCheck,
  LuCopy,
  LuPhone,
  LuPackageCheck,
  LuLoader,
  LuMapPin,
  LuCreditCard,
  LuTruck,
  LuCircleAlert,
  LuZap,
  LuShieldCheck,
  LuInfo,
} from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface OrderConfirmationData {
  result: CreateOrderResult;
  phone: string;
  name: string;
  division: string;
  city: string;
  fullAddress: string;
  paymentMethod: PaymentMethod;
  totalAmount: number;
}

export function CartDrawer() {
  const {
    cartItems,
    checkoutItem,
    setCheckoutItem,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    totalCount,
    clearCart,
    drawerStep: step,
    setDrawerStep: setStep,
  } = useCart();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedInvoice, setCopiedInvoice] = useState(false);
  const [confirmedOrder, setConfirmedOrder] =
    useState<OrderConfirmationData | null>(null);

  // Active single item for checkout
  const activeCheckoutItem: CartItem | null =
    checkoutItem || (cartItems.length > 0 ? cartItems[0] : null);

  // Checkout Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [division, setDivision] = useState<DivisionType>("dhaka");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
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
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const handleClose = () => {
    setIsCartOpen(false);
    if (step === "confirmed") {
      setStep("cart");
      setConfirmedOrder(null);
      setCheckoutItem(null);
    }
    setErrorMessage(null);
  };

  const handleCopyInvoice = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedInvoice(true);
    setTimeout(() => setCopiedInvoice(false), 2000);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!activeCheckoutItem) {
      setErrorMessage("Please select a product to order.");
      return;
    }

    // Validation
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim().replace(/\s+/g, "");
    const trimmedCity = city.trim();
    const trimmedAddress = fullAddress.trim();

    if (!trimmedName) {
      setErrorMessage("Please enter your full name");
      return;
    }
    if (!trimmedPhone || trimmedPhone.length < 11) {
      setErrorMessage("Please enter a valid 11-digit Bangladesh phone number");
      return;
    }
    if (!trimmedCity) {
      setErrorMessage("Please enter your city / district");
      return;
    }
    if (!trimmedAddress) {
      setErrorMessage("Please enter your complete delivery street address");
      return;
    }

    setIsSubmitting(true);

    try {
      let realProductId = activeCheckoutItem.product.id;
      let realColor =
        activeCheckoutItem.selectedVariation?.color ||
        (activeCheckoutItem.product.variation &&
          activeCheckoutItem.product.variation[0]?.color) ||
        "#000000";

      // If ID is not a 24-character ObjectId (e.g. slug), resolve from server
      if (!/^[0-9a-fA-F]{24}$/.test(realProductId)) {
        try {
          const fetched = await productApi.getBySlugOrId(realProductId);
          if (fetched && fetched._id) {
            realProductId = fetched._id;
            if (fetched.color && fetched.color.length > 0) {
              const matchedColor = fetched.color.find(
                (c) =>
                  c.value.toLowerCase() === realColor.toLowerCase() ||
                  c.value === realColor
              );
              realColor = matchedColor
                ? matchedColor.value
                : fetched.color[0].value;
            }
          }
        } catch {
          throw new Error(
            `Product "${activeCheckoutItem.product.name}" could not be confirmed with server inventory.`
          );
        }
      } else if (
        activeCheckoutItem.product.variation &&
        activeCheckoutItem.product.variation.length > 0
      ) {
        // Match color against product variation values
        const matchedVar = activeCheckoutItem.product.variation.find(
          (v) =>
            v.color.toLowerCase() === realColor.toLowerCase() ||
            v.color === realColor
        );
        if (matchedVar) {
          realColor = matchedVar.color;
        } else {
          const firstAvailable =
            activeCheckoutItem.product.variation.find((v) => v.isAvailable) ||
            activeCheckoutItem.product.variation[0];
          if (firstAvailable) {
            realColor = firstAvailable.color;
          }
        }
      }

      // Single order payload per backend requirements
      const payload = {
        user: {
          name: trimmedName,
          email: email.trim() || undefined,
          phone: trimmedPhone,
          division,
          city: trimmedCity,
          zipCode: zipCode ? parseInt(zipCode, 10) : undefined,
          fullAddress: trimmedAddress,
        },
        item: {
          productId: realProductId,
          quantity: activeCheckoutItem.quantity,
          color: realColor,
        },
        paymentMethod,
      };

      const res = await orderApi.create(payload);

      // Remove the purchased item from the bucket
      removeFromCart(activeCheckoutItem.id);
      removeFromCart(activeCheckoutItem.product.id);

      const orderTotal =
        res.totalAmount !== undefined
          ? res.totalAmount
          : (activeCheckoutItem.unitPrice || activeCheckoutItem.product.price) *
              activeCheckoutItem.quantity +
            getDeliveryFee(
              division,
              Boolean(activeCheckoutItem.product?.isPreOrder) ||
                activeCheckoutItem.product?.status === "pre"
            );

      setConfirmedOrder({
        result: res,
        phone: trimmedPhone,
        name: trimmedName,
        division,
        city: trimmedCity,
        fullAddress: trimmedAddress,
        paymentMethod,
        totalAmount: orderTotal,
      });

      setCheckoutItem(null);
      setStep("confirmed");
    } catch (err: any) {
      const serverMsg =
        err?.message ||
        err?.response?.data?.message ||
        "Failed to place order. Please check stock or connectivity.";
      setErrorMessage(serverMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPreOrderCheckout =
    Boolean(activeCheckoutItem?.product?.isPreOrder) ||
    activeCheckoutItem?.product?.status === "pre";

  const checkoutSubtotal = activeCheckoutItem
    ? (activeCheckoutItem.unitPrice || activeCheckoutItem.product.price) *
      activeCheckoutItem.quantity
    : 0;

  const currentDeliveryFee = getDeliveryFee(division, isPreOrderCheckout);
  const checkoutTotal = checkoutSubtotal + currentDeliveryFee;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-out border-l border-neutral-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4 bg-neutral-50/50">
          <div className="flex items-center gap-2">
            {step === "checkout" && (
              <button
                type="button"
                onClick={() => setStep("cart")}
                className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-200/60 transition-colors mr-1 cursor-pointer"
                aria-label="Back to bucket"
              >
                <LuArrowLeft className="size-4" />
              </button>
            )}

            <h2 className="text-base font-semibold text-neutral-900">
              {step === "confirmed"
                ? "Order Confirmation"
                : step === "checkout"
                ? "Order Checkout"
                : "Shopping Bucket"}
            </h2>

            {step === "cart" && totalCount > 0 && (
              <span className="rounded-full bg-neutral-900 px-2 py-0.5 text-[11px] font-semibold text-white">
                {totalCount} saved
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors duration-150 cursor-pointer active:scale-95"
            aria-label="Close drawer"
          >
            <LuX className="size-5" />
          </button>
        </div>

        {/* Drawer Content */}
        {step === "confirmed" && confirmedOrder ? (
          /* 1. ORDER CONFIRMATION SCREEN */
          <div className="flex flex-1 flex-col justify-between p-6 overflow-y-auto">
            <div className="flex flex-col items-center text-center pt-2 sm:pt-4">
              {/* Checkmark Icon */}
              <div className="flex size-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/90 mb-4 shadow-xs">
                <LuCheck className="size-7 stroke-[2.5]" />
              </div>

              {/* Status Badge */}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/70 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-800">
                <span className="size-1.5 rounded-full bg-emerald-600 animate-pulse" />
                <span>Order Placed Successfully</span>
              </span>

              {/* Invoice ID with Copy */}
              <div className="mt-3 flex items-center gap-2 bg-neutral-100/80 px-3 py-1.5 rounded-xl border border-neutral-200">
                <span className="text-xs font-mono font-bold text-neutral-900 select-all">
                  #{confirmedOrder.result.invoiceId}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    handleCopyInvoice(confirmedOrder.result.invoiceId)
                  }
                  className="text-neutral-500 hover:text-neutral-900 p-1 rounded hover:bg-neutral-200 transition-colors cursor-pointer"
                  title="Copy Invoice ID"
                >
                  {copiedInvoice ? (
                    <LuCheck className="size-3.5 text-emerald-600" />
                  ) : (
                    <LuCopy className="size-3.5" />
                  )}
                </button>
              </div>

              {/* Follow-up Note */}
              <p className="mt-2.5 text-xs text-neutral-600 leading-relaxed max-w-xs font-normal">
                Thank you,{" "}
                <strong className="text-neutral-900">
                  {confirmedOrder.name}
                </strong>
                . Our fulfillment team will contact you at{" "}
                <strong className="text-neutral-900 font-mono">
                  {confirmedOrder.phone}
                </strong>{" "}
                to confirm dispatch.
              </p>

              {/* Summary Card */}
              <div className="mt-5 w-full rounded-2xl border border-neutral-200/90 bg-neutral-50/70 p-4 text-left space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-500">Ordered Item:</span>
                  <span className="font-semibold text-neutral-900 line-clamp-1 max-w-[200px]">
                    {confirmedOrder.result.productName}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-500">Quantity:</span>
                  <span className="font-mono font-semibold text-neutral-800">
                    {confirmedOrder.result.quantity}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-500">
                    {confirmedOrder.result?.isPreOrder
                      ? "50% Advance Paid:"
                      : "Product Subtotal:"}
                  </span>
                  <span className="font-semibold text-neutral-900 font-mono">
                    ৳{((confirmedOrder.result?.subtotal ?? (confirmedOrder.totalAmount - (confirmedOrder.result?.deliveryFee ?? 0)))).toLocaleString("en-BD")}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-500">Delivery Charge:</span>
                  <span className="font-semibold text-neutral-900 font-mono">
                    {confirmedOrder.result?.deliveryFee === 0 ? (
                      <span className="text-emerald-600 font-semibold">FREE</span>
                    ) : (
                      `৳${confirmedOrder.result?.deliveryFee || 0}`
                    )}
                  </span>
                </div>

                {confirmedOrder.result?.isPreOrder && (
                  <div className="flex items-center justify-between text-xs bg-amber-50 text-amber-900 p-2 rounded-lg border border-amber-200">
                    <span>Remaining Due (50% COD):</span>
                    <span className="font-bold font-mono">
                      ৳{((confirmedOrder.result?.dueOnDelivery ?? confirmedOrder.result?.subtotal ?? 0)).toLocaleString("en-BD")}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs pt-1.5 border-t border-neutral-200/80">
                  <span className="text-neutral-900 font-bold">Total Payable Now:</span>
                  <span className="font-bold text-neutral-900 font-mono text-sm">
                    ৳{confirmedOrder.totalAmount.toLocaleString("en-BD")}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-500">Payment Mode:</span>
                  <span className="font-medium text-neutral-800 uppercase">
                    {confirmedOrder.paymentMethod === "cod"
                      ? "Cash on Delivery"
                      : "Online Payment"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-500">Delivery Destination:</span>
                  <span className="font-medium text-neutral-800 capitalize">
                    {confirmedOrder.city}, {confirmedOrder.division}
                  </span>
                </div>

                <div className="pt-2 border-t border-neutral-200/80 flex items-start gap-2 text-[11px] text-neutral-600">
                  <LuPhone className="size-3.5 text-neutral-700 shrink-0 mt-0.5" />
                  <span>
                    Our agent will call you shortly to confirm your dispatch.
                  </span>
                </div>

                <div className="flex items-start gap-2 text-[11px] text-neutral-600">
                  <LuPackageCheck className="size-3.5 text-neutral-700 shrink-0 mt-0.5" />
                  <span>
                    Estimated delivery: 2-3 business days in Dhaka, 3-5 days
                    nationwide.
                  </span>
                </div>
              </div>
            </div>

            {/* Confirmation Actions */}
            <div className="pt-6 border-t border-neutral-200 space-y-2.5">
              <Link
                href={`/track?invoiceId=${encodeURIComponent(
                  confirmedOrder.result.invoiceId
                )}&phone=${encodeURIComponent(confirmedOrder.phone)}`}
                onClick={handleClose}
                className="block w-full"
              >
                <Button
                  size="lg"
                  className="w-full rounded-xl bg-neutral-900 text-xs font-semibold text-white shadow-none hover:bg-neutral-800 transition-all duration-200 cursor-pointer gap-1.5"
                >
                  <span>Track Order Progress</span>
                  <LuArrowRight className="size-3.5" />
                </Button>
              </Link>

              <Button
                variant="outline"
                size="lg"
                onClick={handleClose}
                className="w-full rounded-xl text-xs font-medium cursor-pointer"
              >
                <span>Continue Shopping</span>
              </Button>
            </div>
          </div>
        ) : step === "checkout" && activeCheckoutItem ? (
          /* 2. SINGLE ITEM CHECKOUT FORM */
          <form
            onSubmit={handleSubmitOrder}
            className="flex flex-1 flex-col justify-between overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Product Preview Being Purchased */}
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50/80 p-4 flex gap-4 items-center shadow-2xs">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-neutral-200/80 bg-white">
                  <Image
                    src={
                      activeCheckoutItem.selectedVariation?.imagePath ||
                      activeCheckoutItem.product.image ||
                      "/placeholder-product.svg"
                    }
                    alt={activeCheckoutItem.product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-semibold text-neutral-900 line-clamp-1">
                    {activeCheckoutItem.product.name}
                  </h4>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-neutral-500">
                    {activeCheckoutItem.selectedVariation && (
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className="size-2 rounded-full border border-black/10 shrink-0"
                          style={{
                            backgroundColor:
                              activeCheckoutItem.selectedVariation.color,
                          }}
                        />
                        <span>{activeCheckoutItem.selectedVariation.name}</span>
                      </span>
                    )}
                    <span>•</span>
                    <span>Qty: {activeCheckoutItem.quantity}</span>
                  </div>
                  <div className="mt-1 text-sm font-bold text-neutral-900 font-mono">
                    ৳{checkoutTotal.toLocaleString("en-BD")}
                  </div>
                </div>
              </div>

              {/* Error Banner */}
              {errorMessage && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 flex items-start gap-2">
                  <LuCircleAlert className="size-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Contact Information */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
                  Contact Information
                </h3>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-700">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Tanvir Ahmed"
                    className="h-9 text-xs rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-neutral-700">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="017XXXXXXXX"
                      className="h-9 text-xs rounded-lg font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-neutral-700">
                      Email (Optional)
                    </label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@email.com"
                      className="h-9 text-xs rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="space-y-3 pt-2 border-t border-neutral-100">
                <div className="flex items-center gap-1.5">
                  <LuMapPin className="size-3.5 text-neutral-600" />
                  <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
                    Shipping Address
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-neutral-700">
                      Division <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={division}
                      onChange={(e) =>
                        setDivision(e.target.value as DivisionType)
                      }
                      className="w-full h-9 rounded-lg border border-neutral-200 bg-white px-2.5 text-xs font-medium text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 cursor-pointer"
                    >
                      {BANGLADESH_DIVISIONS.map((d) => (
                        <option key={d.value} value={d.value}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-neutral-700">
                      City / District <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Dhaka, Chittagong"
                      className="h-9 text-xs rounded-lg"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-700">
                    Street Address & House / Flat No.{" "}
                    <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    type="text"
                    required
                    value={fullAddress}
                    onChange={(e) => setFullAddress(e.target.value)}
                    placeholder="e.g. House 14, Road 5, Block B, Banani"
                    className="h-9 text-xs rounded-lg"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-700">
                    Postal Code (Optional)
                  </label>
                  <Input
                    type="number"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="e.g. 1213"
                    className="h-9 text-xs rounded-lg font-mono"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-2 pt-2 border-t border-neutral-100">
                <div className="flex items-center gap-1.5">
                  <LuCreditCard className="size-3.5 text-neutral-600" />
                  <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
                    Payment Method
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <label
                    onClick={() => setPaymentMethod("cod")}
                    className={cn(
                      "flex flex-col p-3 rounded-xl border text-left cursor-pointer transition-all",
                      paymentMethod === "cod"
                        ? "border-neutral-900 bg-neutral-900 text-white shadow-xs"
                        : "border-neutral-200 bg-white text-neutral-800 hover:border-neutral-300"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <LuTruck className="size-4" />
                      <span className="text-[10px] font-semibold uppercase">
                        COD
                      </span>
                    </div>
                    <span className="mt-2 text-xs font-semibold leading-tight">
                      Cash on Delivery
                    </span>
                    <span
                      className={cn(
                        "text-[10px] mt-0.5",
                        paymentMethod === "cod"
                          ? "text-neutral-300"
                          : "text-neutral-400"
                      )}
                    >
                      Pay when delivered
                    </span>
                  </label>

                  <label
                    onClick={() => setPaymentMethod("online")}
                    className={cn(
                      "flex flex-col p-3 rounded-xl border text-left cursor-pointer transition-all",
                      paymentMethod === "online"
                        ? "border-neutral-900 bg-neutral-900 text-white shadow-xs"
                        : "border-neutral-200 bg-white text-neutral-800 hover:border-neutral-300"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <LuCreditCard className="size-4" />
                      <span className="text-[10px] font-semibold uppercase">
                        Online
                      </span>
                    </div>
                    <span className="mt-2 text-xs font-semibold leading-tight">
                      Online Payment
                    </span>
                    <span
                      className={cn(
                        "text-[10px] mt-0.5",
                        paymentMethod === "online"
                          ? "text-neutral-300"
                          : "text-neutral-400"
                      )}
                    >
                      bKash / Nagad / Cards
                    </span>
                  </label>
                </div>
              </div>

              {/* Items Summary */}
              <div className="rounded-xl bg-neutral-50 border border-neutral-200/70 p-3 space-y-2 text-xs">
                <div className="flex justify-between text-neutral-600">
                  <span>
                    {isPreOrderCheckout
                      ? "Pre-Order Advance (50%):"
                      : "Product Subtotal:"}
                  </span>
                  <span className="font-semibold text-neutral-900 font-mono">
                    ৳{checkoutSubtotal.toLocaleString("en-BD")}
                  </span>
                </div>

                {isPreOrderCheckout && (
                  <div className="flex justify-between items-center text-[11px] bg-neutral-100/90 text-neutral-700 px-2.5 py-1.5 rounded-lg border border-neutral-200/80">
                    <span className="font-medium">Due on Delivery (COD 50%):</span>
                    <span className="font-bold font-mono text-neutral-900">
                      ৳{checkoutSubtotal.toLocaleString("en-BD")}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-neutral-600">
                  <span>Delivery Charge:</span>
                  <span>
                    {currentDeliveryFee === 0 ? (
                      <span className="text-emerald-600 font-semibold">FREE (Pre-Order)</span>
                    ) : (
                      <span className="font-medium text-neutral-900 font-mono">
                        ৳{currentDeliveryFee} ({division === "dhaka" ? "Dhaka" : "Outside Dhaka"})
                      </span>
                    )}
                  </span>
                </div>

                <div className="flex justify-between font-bold text-neutral-900 pt-2 border-t border-neutral-200/80 text-sm">
                  <span>Total Payable Now:</span>
                  <span className="font-mono text-base">
                    ৳{checkoutTotal.toLocaleString("en-BD")}
                  </span>
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="p-5 border-t border-neutral-200 bg-neutral-50/50 space-y-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                size="lg"
                className="w-full rounded-xl bg-neutral-900 text-xs font-semibold text-white shadow-none hover:bg-neutral-800 cursor-pointer transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <LuLoader className="size-3.5 animate-spin" />
                    <span>Processing Order...</span>
                  </span>
                ) : (
                  <span>
                    Confirm Order • ৳{checkoutTotal.toLocaleString("en-BD")}
                  </span>
                )}
              </Button>
            </div>
          </form>
        ) : cartItems.length === 0 ? (
          /* 3. EMPTY BUCKET STATE */
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400 mb-4">
              <LuShoppingBag className="size-7" />
            </div>
            <h3 className="text-base font-semibold text-neutral-900">
              Your bucket is empty
            </h3>
            <p className="mt-1 text-xs text-neutral-500 max-w-xs leading-relaxed">
              Click <strong>&ldquo;+ Add&rdquo;</strong> on any product while
              browsing to save it to your bucket for quick single-item checkout.
            </p>
            <Link href="/products" onClick={handleClose} className="mt-6">
              <Button
                size="sm"
                className="rounded-xl bg-neutral-900 text-xs px-5 cursor-pointer active:scale-[0.98]"
              >
                <span>Browse Collection</span>
                <LuArrowRight className="size-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        ) : (
          /* 4. SHOPPING BUCKET STATE (Items to buy one-by-one) */
          <div className="flex flex-1 flex-col justify-between overflow-hidden">
            {/* Informational Guidance Banner */}
            <div className="bg-neutral-50 px-4 py-2.5 border-b border-neutral-200/80 flex items-center gap-2 text-[11px] text-neutral-600">
              <LuInfo className="size-3.5 text-neutral-500 shrink-0" />
              <span>
                Each item is cleared and shipped individually. Tap{" "}
                <strong>Buy Now</strong> to configure and place an order.
              </span>
            </div>

            {/* Bucket Items List */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-4 rounded-2xl border border-neutral-200/90 bg-white p-5 sm:p-6 shadow-xs hover:border-neutral-300 hover:shadow-sm transition-all"
                >
                  <div className="flex gap-4 items-start">
                    {/* Thumbnail */}
                    <Link
                      href={`/products/${item.product.slug || item.product.id}`}
                      onClick={handleClose}
                      className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-neutral-200/80 bg-neutral-100 group shadow-2xs"
                    >
                      <Image
                        src={
                          item.selectedVariation?.imagePath ||
                          item.product.image ||
                          "/placeholder-product.svg"
                        }
                        alt={item.product.name}
                        fill
                        sizes="80px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {item.selectedVariation && (
                        <span
                          className="absolute bottom-1.5 right-1.5 size-3.5 rounded-full border-2 border-white shadow-xs"
                          style={{
                            backgroundColor: item.selectedVariation.color,
                          }}
                          title={item.selectedVariation.name}
                        />
                      )}
                    </Link>

                    {/* Info */}
                    <div className="flex flex-1 flex-col justify-between min-w-0 self-stretch">
                      <div>
                        <div className="flex items-start justify-between gap-2.5">
                          <Link
                            href={`/products/${
                              item.product.slug || item.product.id
                            }`}
                            onClick={handleClose}
                            className="text-xs sm:text-sm font-semibold text-neutral-900 line-clamp-1 hover:text-neutral-600 transition-colors pt-0.5"
                          >
                            {item.product.name}
                          </Link>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="size-7 flex items-center justify-center rounded-lg text-neutral-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer shrink-0"
                            title="Remove from bucket"
                            aria-label="Remove item"
                          >
                            <LuTrash2 className="size-4" />
                          </button>
                        </div>

                        {/* Variation & Category */}
                        <div className="mt-1 flex items-center flex-wrap gap-1.5">
                          {item.selectedVariation && (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-neutral-700 bg-neutral-100/90 rounded-md px-2 py-0.5 border border-neutral-200/50">
                              <span
                                className="size-2 rounded-full border border-black/15 shrink-0"
                                style={{
                                  backgroundColor: item.selectedVariation.color,
                                }}
                              />
                              <span>{item.selectedVariation.name}</span>
                            </span>
                          )}
                          <span className="text-[11px] text-neutral-400 font-normal">
                            {item.product.category}
                          </span>
                        </div>
                      </div>

                      {/* Price & Quantity Controls */}
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-sm sm:text-base font-bold text-neutral-900 font-mono tracking-tight">
                          ৳
                          {(
                            (item.unitPrice || item.product.price) *
                            item.quantity
                          ).toLocaleString("en-BD")}
                        </span>

                        <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-2 py-1">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="rounded p-0.5 text-neutral-500 hover:bg-white hover:text-neutral-900 transition-colors cursor-pointer active:scale-90"
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
                            className="rounded p-0.5 text-neutral-500 hover:bg-white hover:text-neutral-900 transition-colors cursor-pointer active:scale-90"
                            aria-label="Increase quantity"
                          >
                            <LuPlus className="size-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Individual Item Buy Button -> navigates to details page */}
                  <div className="pt-3.5 border-t border-neutral-100/90 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-neutral-400 flex items-center gap-1.5">
                      <LuTruck className="size-3.5 text-neutral-400" />
                      <span>Single-item delivery</span>
                    </span>
                    <Link
                      href={`/products/${item.product.slug || item.product.id}`}
                      onClick={handleClose}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
                    >
                      <LuZap className="size-3.5 text-amber-400 fill-amber-400" />
                      <span>Buy Now</span>
                      <LuArrowRight className="size-3.5 ml-0.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Summary & Bucket Actions */}
            <div className="border-t border-neutral-200 p-5 bg-neutral-50/50 space-y-3">
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span>Bucket Inventory</span>
                <span className="font-semibold text-neutral-900">
                  {totalCount} {totalCount === 1 ? "item" : "items"} saved
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="lg"
                  onClick={handleClose}
                  className="flex-1 rounded-xl bg-neutral-900 text-xs font-semibold text-white shadow-none hover:bg-neutral-800 cursor-pointer"
                >
                  <span>Continue Browsing</span>
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={clearCart}
                  className="rounded-xl border-neutral-300 bg-white text-xs text-neutral-600 hover:text-rose-600 hover:border-rose-200 cursor-pointer"
                >
                  Clear All
                </Button>
              </div>

              <div className="flex items-center justify-center pt-1 text-[11px] text-neutral-400 gap-2">
                <LuShieldCheck className="size-3.5 text-neutral-500" />
                <span>100% Customs Clearance & Safe Express Courier</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
