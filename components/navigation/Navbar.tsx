"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import {
  LuCompass,
  LuShoppingBag,
  LuMenu,
  LuX,
  LuPackage,
  LuArrowRight,
  LuTruck,
} from "react-icons/lu";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { totalCount, setIsCartOpen, setDrawerStep } = useCart();
  const pathname = usePathname();

  // Close mobile drawer upon route transitions
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
  }

  // Dynamic scroll state with passive listener for butter-smooth framerates
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Products", href: "/products" },
    { name: "Pre-Orders", href: "/#pre-order" },
    { name: "Featured", href: "/#featured" },
    { name: "Contact", href: "/#contact" },
  ];

  const isLinkActive = (href: string) => {
    if (href === "/products") {
      return pathname.startsWith("/products");
    }
    return false;
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 mb-10 md:mb-16 w-full transition-all duration-300 ",
        isScrolled ? "pt-2 sm:pt-2.5 pb-2" : "pt-3 sm:pt-4 pb-2",
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={cn(
            "flex h-14 sm:h-15 items-center justify-between px-3.5 sm:px-5 lg:px-6 rounded-2xl border transition-all duration-300 pointer-events-auto bg-white/85 backdrop-blur-xl border-neutral-200/90 shadow-sm",
          )}
        >
          {/* Brand Logotype with Minimalist Emblem */}
          <Link
            href="/"
            className="group inline-flex items-center gap-2.5 focus-visible:outline-none"
            aria-label="UniqueHub Home"
          >
            <div className="flex size-8 items-center justify-center rounded-xl bg-neutral-900 text-white shadow-xs group-hover:scale-105 transition-transform duration-200">
              <LuPackage className="size-4 stroke-[2.2]" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-[family-name:var(--font-geist-sans)] text-base sm:text-lg font-bold tracking-tight text-neutral-950 transition-colors group-hover:text-neutral-700">
                Unique<span className="font-normal text-neutral-400">Hub</span>
              </span>
              <span className="hidden sm:inline-flex items-center text-[9px] font-mono font-medium text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded-md border border-neutral-200/70">
                BD
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links - Centered & Refined */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-1.5">
            {navLinks.map((link) => {
              const active = isLinkActive(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer active:scale-95",
                    active
                      ? "text-primary font-semibold bg-secondary shadow-2xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/70 active:bg-secondary",
                  )}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Controls: Find Product, Track Order, Bucket, and Mobile Menu */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Find Product Button */}
            <Link
              href="/products"
              className={cn(
                "group flex size-8 sm:size-auto sm:px-3.5 sm:py-1.5 items-center justify-center gap-1.5 sm:gap-2 rounded-xl border text-xs font-medium transition-all duration-150 cursor-pointer active:scale-95 shadow-2xs",
                pathname.startsWith("/products")
                  ? "bg-secondary border-border-strong text-foreground font-semibold"
                  : "border-border/80 bg-secondary/60 hover:bg-white hover:border-blue-bell-200 hover:text-blue-bell-800 text-foreground active:bg-secondary",
              )}
              aria-label="Find Product"
            >
              <LuCompass className="size-4 sm:size-3.5 text-muted-foreground group-hover:text-blue-bell-700 group-hover:rotate-45 transition-all duration-200" />
              <span className="hidden sm:inline">Find Product</span>
            </Link>

            {/* Track Order Action Button */}
            <Link
              href="/track"
              className={cn(
                "group flex size-8 sm:size-auto sm:px-3 sm:py-1.5 items-center justify-center gap-1.5 sm:gap-2 rounded-xl border transition-all duration-150 text-xs font-medium active:scale-95 cursor-pointer shadow-2xs",
                pathname.startsWith("/track")
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border/80 bg-white hover:bg-blue-bell-50 hover:border-blue-bell-200 hover:text-blue-bell-800 text-foreground active:bg-blue-bell-100",
              )}
              aria-label="Track Your Order"
            >
              <LuTruck
                className={cn(
                  "size-4 sm:size-3.5 transition-colors",
                  pathname.startsWith("/track")
                    ? "text-primary-foreground"
                    : "text-muted-foreground group-hover:text-blue-bell-700",
                )}
              />
              <span className="hidden sm:inline">Track Order</span>
            </Link>

            {/* Cart Trigger with Responsive Badge */}
            <button
              type="button"
              onClick={() => {
                setDrawerStep("cart");
                setIsCartOpen(true);
              }}
              className="group relative flex size-8 sm:size-auto sm:px-3 sm:py-1.5 items-center justify-center gap-1.5 sm:gap-2 rounded-xl border border-border/80 bg-white hover:bg-secondary hover:border-border-strong text-foreground transition-all duration-150 text-xs font-medium active:scale-95 cursor-pointer shadow-2xs"
              aria-label={`View Bucket, ${totalCount} items`}
            >
              <LuShoppingBag className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              <span className="hidden sm:inline font-medium text-foreground">
                Bucket
              </span>
              {totalCount > 0 ? (
                <span className="absolute -top-1 -right-1 sm:static sm:top-auto sm:right-auto flex items-center justify-center min-w-4 sm:min-w-[18px] h-4 sm:h-[18px] px-1 rounded-full bg-commerce text-[9px] sm:text-[10px] font-mono font-bold text-white tabular-nums shadow-xs">
                  {totalCount}
                </span>
              ) : (
                <span className="hidden sm:inline text-neutral-400 font-mono text-[10px]">
                  0
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              className="md:hidden flex size-8 items-center justify-center rounded-xl border border-neutral-200/80 bg-neutral-50 text-neutral-700 hover:bg-neutral-100 transition-colors duration-150 cursor-pointer active:scale-95 ml-0.5"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <LuX className="size-4.5" />
              ) : (
                <LuMenu className="size-4.5" />
              )}
            </button>
          </div>
        </div>

        {/* Floating Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 rounded-2xl border border-neutral-200/90 bg-white/95 backdrop-blur-xl p-3 shadow-sm pointer-events-auto space-y-1 animate-fade-in-up">
            {navLinks.map((link) => {
              const active = isLinkActive(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium transition-colors",
                    active
                      ? "bg-neutral-100 text-neutral-950 font-semibold"
                      : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900",
                  )}
                >
                  <span>{link.name}</span>
                  <LuArrowRight className="size-3.5 text-neutral-400" />
                </Link>
              );
            })}
            <div className="pt-2 mt-1 border-t border-neutral-100 space-y-1">
              <Link
                href="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-xl bg-neutral-50 hover:bg-neutral-100 px-3.5 py-2.5 text-xs font-medium text-neutral-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <LuCompass className="size-3.5 text-neutral-600" />
                  <span>Find Product</span>
                </div>
                <LuArrowRight className="size-3.5 text-neutral-400" />
              </Link>
              <Link
                href="/track"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-xl bg-neutral-50 hover:bg-neutral-100 px-3.5 py-2.5 text-xs font-medium text-neutral-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <LuTruck className="size-3.5 text-neutral-600" />
                  <span>Track Order</span>
                </div>
                <LuArrowRight className="size-3.5 text-neutral-400" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
