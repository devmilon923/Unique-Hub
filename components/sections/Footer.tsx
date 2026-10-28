"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  LuPhone,
  LuMail,
  LuMapPin,
  LuMessageSquare,
  LuArrowUpRight,
  LuShieldCheck,
} from "react-icons/lu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Footer() {
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  const contactMethods = [
    {
      icon: LuPhone,
      label: "Hotline",
      val: "+880 1711-987654",
      sub: "10AM – 8PM Daily",
      href: "tel:+8801711987654",
    },
    {
      icon: LuMessageSquare,
      label: "WhatsApp",
      val: "+880 1811-987654",
      sub: "Live Order Chat",
      href: "https://wa.me/8801811987654",
    },
    {
      icon: LuMail,
      label: "Email",
      val: "support@uniquehub.bd",
      sub: "General Inquiries",
      href: "mailto:support@uniquehub.bd",
    },
    {
      icon: LuMapPin,
      label: "Dhaka Hub",
      val: "Banani, Block D",
      sub: "Pickup & Inspection",
      href: "#contact",
    },
  ];

  const onlinePaymentOptions = [
    {
      name: "bKash",
      src: "/icons/bKash.svg",
    },
    {
      name: "Nagad",
      src: "/icons/nagad.svg",
    },
    {
      name: "Visa",
      src: "/icons/visa.svg",
    },
  ];

  return (
    <footer id="contact" className="bg-white text-neutral-900 border-t border-neutral-200/90 scroll-mt-20">
      {/* 1. Mobile-Friendly 2x2 / 4-Col Contact Cards */}
      <div className="border-b border-neutral-200/80 bg-neutral-50/50 py-8 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {contactMethods.map((method, idx) => {
              const Icon = method.icon;
              return (
                <a
                  key={idx}
                  href={method.href}
                  className="group flex flex-col justify-between rounded-xl border border-neutral-200/80 bg-white p-3.5 sm:p-4 transition-all duration-200 hover:border-neutral-400 hover:shadow-[0_2px_8px_rgba(0,0,0,0.03)] cursor-pointer active:scale-[0.99]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex size-7 sm:size-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700 transition-colors group-hover:bg-neutral-900 group-hover:text-white">
                      <Icon className="size-3.5 sm:size-4 stroke-[1.75]" />
                    </div>
                    <LuArrowUpRight className="size-3 text-neutral-300 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-neutral-700" />
                  </div>

                  <div className="mt-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                      {method.label}
                    </p>
                    <p className="mt-0.5 text-xs sm:text-sm font-semibold text-neutral-900 truncate">
                      {method.val}
                    </p>
                    <p className="text-[10px] sm:text-xs text-neutral-500 truncate">
                      {method.sub}
                    </p>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Organized Content & Navigation Grid */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:py-14 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand Info & Newsletter (Mobile top / Desktop 5-cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div>
              <Link
                href="/"
                className="group inline-flex items-center focus-visible:outline-none"
                aria-label="UniqueHub Home"
              >
                <span className="font-[family-name:var(--font-geist-sans)] text-2xl font-bold tracking-tight text-neutral-900 transition-colors group-hover:text-neutral-700">
                  Unique<span className="font-normal text-neutral-500">Hub</span>
                </span>
              </Link>

              <p className="mt-2.5 text-xs sm:text-sm text-neutral-500 leading-relaxed max-w-sm font-normal">
                Curated international products delivered directly to customers in Bangladesh with complete customs clearance.
              </p>

              <div className="mt-3 flex items-center gap-2 text-xs font-medium text-neutral-700">
                <LuShieldCheck className="size-4 text-neutral-900 shrink-0" />
                <span>100% Customs & Duties Handled</span>
              </div>
            </div>

            {/* Compact Drop Alerts Signup */}
            <div className="pt-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-900">
                Drop Notifications
              </h4>
              <p className="mt-1 text-xs text-neutral-500">
                Get notified when new overseas batches and pre-order drops launch.
              </p>

              {subscribed ? (
                <div className="mt-3 rounded-lg bg-neutral-100 p-2.5 text-xs font-medium text-neutral-800">
                  ✓ Subscribed to upcoming drop updates.
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="mt-3 flex items-center gap-2 max-w-sm">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="h-9 rounded-lg border-neutral-200 bg-white text-xs placeholder:text-neutral-400 flex-1"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="h-9 rounded-lg bg-neutral-900 font-medium text-xs text-white hover:bg-neutral-800 shrink-0 px-3.5 cursor-pointer transition-all duration-200 active:scale-95"
                  >
                    Subscribe
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* Navigation Links: 2-Columns on Mobile for clean organisation */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8 pt-4 lg:pt-0 border-t lg:border-t-0 border-neutral-100">
            {/* Column 1: Shop */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-900">
                Shop
              </h4>
              <ul className="mt-3 space-y-2 text-xs text-neutral-500">
                <li>
                  <Link href="/products" className="hover:text-neutral-900 transition-colors">
                    All Products
                  </Link>
                </li>
                <li>
                  <Link href="/track" className="hover:text-neutral-900 transition-colors font-medium text-neutral-800">
                    Track Order
                  </Link>
                </li>
                <li>
                  <Link href="/products?filter=preorder" className="hover:text-neutral-900 transition-colors">
                    Pre-Order Drops
                  </Link>
                </li>
                <li>
                  <Link href="/#featured" className="hover:text-neutral-900 transition-colors">
                    Featured Highlights
                  </Link>
                </li>
                <li>
                  <Link href="/products" className="hover:text-neutral-900 transition-colors">
                    Workspace Gear
                  </Link>
                </li>
                <li>
                  <Link href="/products" className="hover:text-neutral-900 transition-colors">
                    Smart Audio
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Trust & Support */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-900">
                Sourcing & Trust
              </h4>
              <ul className="mt-3 space-y-2 text-xs text-neutral-500">
                <li>
                  <Link href="/#how-we-collect" className="hover:text-neutral-900 transition-colors">
                    How We Source
                  </Link>
                </li>
                <li>
                  <Link href="/#how-we-collect" className="hover:text-neutral-900 transition-colors">
                    Customs Clearance
                  </Link>
                </li>
                <li>
                  <Link href="/#pre-order" className="hover:text-neutral-900 transition-colors">
                    Air Cargo Schedules
                  </Link>
                </li>
                <li>
                  <Link href="/#contact" className="hover:text-neutral-900 transition-colors">
                    Local Replacements
                  </Link>
                </li>
                <li>
                  <Link href="/#contact" className="hover:text-neutral-900 transition-colors">
                    Delivery in BD
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Payment Methods & Info */}
            <div className="col-span-2 sm:col-span-1">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-900">
                Payment Options
              </h4>
              <p className="mt-2 text-xs text-neutral-500 leading-relaxed">
                Instant online payment:
              </p>

              {/* Online Payment Provider Logos (Prominent Size) */}
              <div className="mt-2.5 flex items-center gap-2">
                {onlinePaymentOptions.map((item) => (
                  <div
                    key={item.name}
                    className="flex h-10 w-16 sm:w-18 items-center justify-center rounded-lg border border-neutral-200/90 bg-white px-2.5 py-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all duration-200 hover:border-neutral-400 hover:shadow-xs"
                    title={item.name}
                  >
                    <Image
                      src={item.src}
                      alt={item.name}
                      width={64}
                      height={32}
                      className="h-full w-auto max-h-6 object-contain"
                    />
                  </div>
                ))}
              </div>

              {/* Cash on Delivery Notice */}
              <div className="mt-3 flex items-center gap-2 text-xs text-neutral-600">
                <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-800 font-mono">
                  COD
                </span>
                <span>Also accepts Cash on Delivery</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Bottom Legal & Copyright Bar */}
        <div className="mt-12 pt-6 border-t border-neutral-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500 text-center sm:text-left">
          <p>© 2026 UniqueHub BD. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <Link href="/#contact" className="hover:text-neutral-900 transition">
              Privacy Policy
            </Link>
            <Link href="/#contact" className="hover:text-neutral-900 transition">
              Terms of Service
            </Link>
            <Link href="/#contact" className="hover:text-neutral-900 transition">
              Customs & Shipping Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
