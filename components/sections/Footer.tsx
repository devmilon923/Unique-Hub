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
      icon: LuMessageSquare,
      label: "WhatsApp",
      val: "+880 1902-652550",
      sub: "Live Order Chat",
      href: "https://wa.me/8801902652550",
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
      label: "Bangladesh Hub",
      val: "2000, Jamalpur",
      sub: "Pickup & Inspection",
      href: "#contact",
    },
    {
      icon: LuMapPin,
      label: "China Hub",
      val: "Guzhen Town",
      sub: "Distribution Center",
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
    <footer
      id="contact"
      className="bg-card text-foreground border-t border-border scroll-mt-20"
    >
      {/* 1. Mobile-Friendly 2x2 / 4-Col Contact Cards */}
      <div className="border-b border-border bg-secondary/35 py-8 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {contactMethods.map((method, idx) => {
              const Icon = method.icon;
              return (
                <a
                  key={idx}
                  href={method.href}
                  className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-3.5 sm:p-4.5 transition-all duration-150 hover:border-blue-bell-200 hover:shadow-[0_8px_24px_-4px_rgba(10,171,245,0.08),0_2px_6px_rgba(17,16,20,0.03)] cursor-pointer active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex size-7 sm:size-8 items-center justify-center rounded-xl bg-secondary border border-border/70 text-muted-foreground transition-all duration-150 group-hover:bg-blue-bell-50 group-hover:text-blue-bell-700 group-hover:border-blue-bell-200 group-hover:shadow-2xs">
                      <Icon className="size-3.5 sm:size-4 stroke-[1.8]" />
                    </div>
                    <LuArrowUpRight className="size-3 text-muted-foreground/40 transition-all duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-blue-bell-600" />
                  </div>

                  <div className="mt-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-blue-bell-700/80 transition-colors">
                      {method.label}
                    </p>
                    <p className="mt-0.5 text-xs sm:text-sm font-semibold text-foreground group-hover:text-blue-bell-950 transition-colors truncate">
                      {method.val}
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
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
                  Unique
                  <span className="font-normal text-neutral-500">Hub</span>
                </span>
              </Link>

              <p className="mt-2.5 text-xs sm:text-sm text-neutral-500 leading-relaxed max-w-sm font-normal">
                Curated international products delivered directly to customers
                in Bangladesh with complete customs clearance.
              </p>

              <div className="mt-3 flex items-center gap-2 text-xs font-medium text-foreground">
                <LuShieldCheck className="size-4 text-blue-bell-600 shrink-0" />
                <span>100% Customs & Duties Handled</span>
              </div>
            </div>

            {/* Compact Drop Alerts Signup */}
            <div className="pt-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Drop Notifications
              </h4>
              <p className="mt-1 text-xs text-muted-foreground">
                Get notified when new overseas batches and pre-order drops
                launch.
              </p>

              {subscribed ? (
                <div className="mt-3 rounded-xl bg-blue-bell-50 border border-blue-bell-200 p-2.5 text-xs font-medium text-blue-bell-900">
                  ✓ Subscribed to upcoming drop updates.
                </div>
              ) : (
                <form
                  onSubmit={handleSubscribe}
                  className="mt-3 flex items-center gap-2 max-w-sm"
                >
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="h-9 rounded-xl border-border bg-card text-xs placeholder:text-muted-foreground/60 flex-1"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="h-9 rounded-xl bg-primary font-medium text-xs text-primary-foreground hover:bg-primary-hover active:bg-onyx-900 shrink-0 px-3.5 cursor-pointer transition-all duration-150 active:scale-95 shadow-xs"
                  >
                    Subscribe
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* Navigation Links: 2-Columns on Mobile for clean organisation */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8 pt-4 lg:pt-0 border-t lg:border-t-0 border-border">
            {/* Column 1: Shop */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Shop
              </h4>
              <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
                <li>
                  <Link
                    href="/products"
                    className="hover:text-blue-bell-700 transition-colors"
                  >
                    All Products
                  </Link>
                </li>
                <li>
                  <Link
                    href="/track"
                    className="hover:text-blue-bell-700 transition-colors font-medium text-foreground"
                  >
                    Track Order
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products?filter=preorder"
                    className="hover:text-blue-bell-700 transition-colors"
                  >
                    Pre-Order Drops
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#featured"
                    className="hover:text-blue-bell-700 transition-colors"
                  >
                    Featured Highlights
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products"
                    className="hover:text-blue-bell-700 transition-colors"
                  >
                    Workspace Gear
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products"
                    className="hover:text-blue-bell-700 transition-colors"
                  >
                    Smart Audio
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Trust & Support */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Sourcing & Trust
              </h4>
              <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
                <li>
                  <Link
                    href="/#how-we-collect"
                    className="hover:text-blue-bell-700 transition-colors"
                  >
                    How We Source
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#how-we-collect"
                    className="hover:text-blue-bell-700 transition-colors"
                  >
                    Customs Clearance
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#pre-order"
                    className="hover:text-blue-bell-700 transition-colors"
                  >
                    Air Cargo Schedules
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#contact"
                    className="hover:text-blue-bell-700 transition-colors"
                  >
                    Local Replacements
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#contact"
                    className="hover:text-blue-bell-700 transition-colors"
                  >
                    Delivery in BD
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Payment Methods & Info */}
            <div className="col-span-2 sm:col-span-1">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Payment Options
              </h4>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Instant online payment:
              </p>

              {/* Online Payment Provider Logos (Prominent Size) */}
              <div className="mt-2.5 flex items-center gap-2">
                {onlinePaymentOptions.map((item) => (
                  <div
                    key={item.name}
                    className="flex h-10 w-16 sm:w-18 items-center justify-center rounded-xl border border-border bg-card px-2.5 py-1.5 shadow-2xs transition-all duration-150 hover:border-blue-bell-200 hover:shadow-xs active:scale-95 cursor-pointer"
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
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded-md bg-secondary border border-border/80 px-1.5 py-0.5 text-[10px] font-semibold text-foreground font-mono">
                  COD
                </span>
                <span>Also accepts Cash on Delivery</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Bottom Legal & Copyright Bar */}
        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground text-center sm:text-left">
          <p>© 2026 UniqueHub BD. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <Link
              href="/#contact"
              className="hover:text-blue-bell-700 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/#contact"
              className="hover:text-blue-bell-700 transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/#contact"
              className="hover:text-blue-bell-700 transition-colors"
            >
              Customs & Shipping Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
