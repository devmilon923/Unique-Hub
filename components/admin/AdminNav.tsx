"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  LuPackage,
  LuLayoutDashboard,
  LuBoxes,
  LuShoppingBag,
  LuExternalLink,
  LuLogOut,
  LuShieldCheck,
  LuUser,
  LuLoader,
} from "react-icons/lu";
import { cn } from "@/lib/utils";

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.replace("/admin/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const navItems = [
    { name: "Overview", href: "/admin", icon: LuLayoutDashboard },
    { name: "Orders", href: "/admin/orders", icon: LuShoppingBag },
    { name: "Products", href: "/admin/products", icon: LuBoxes },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200/90 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Left: Branding & Portal Badge */}
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="flex items-center gap-2.5 focus-visible:outline-none"
            >
              <div className="flex size-8 items-center justify-center rounded-xl bg-neutral-900 text-white shadow-xs">
                <LuPackage className="size-4 stroke-[2.2]" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-[family-name:var(--font-geist-sans)] text-sm sm:text-base font-bold tracking-tight text-neutral-950">
                  Unique<span className="font-normal text-neutral-400">Hub</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[9px] font-mono font-medium text-neutral-600 bg-neutral-100 px-1.5 py-0.5 rounded-md border border-neutral-200/70">
                  <LuShieldCheck className="size-2.5 text-neutral-800" />
                  ADMIN
                </span>
              </div>
            </Link>

            {/* Nav Tabs */}
            <nav className="hidden sm:flex items-center gap-1 ml-4 border-l border-neutral-200 pl-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active =
                  pathname === item.href ||
                  (item.href !== "/admin" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                      active
                        ? "bg-neutral-100 text-neutral-950 font-semibold"
                        : "text-neutral-600 hover:text-neutral-950 hover:bg-neutral-50"
                    )}
                  >
                    <Icon className="size-3.5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: User Info & Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Storefront Link */}
            <Link
              href="/"
              className="hidden md:inline-flex items-center gap-1.5 text-xs text-neutral-600 hover:text-neutral-950 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-neutral-50"
            >
              <span>View Store</span>
              <LuExternalLink className="size-3 text-neutral-400" />
            </Link>

            {/* User Profile Badge */}
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-neutral-50 border border-neutral-200/80">
              <div className="flex size-6 items-center justify-center rounded-lg bg-neutral-200 text-neutral-700">
                <LuUser className="size-3.5" />
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-semibold text-neutral-900 leading-tight">
                  {user?.name || "Admin"}
                </span>
   
              </div>
            </div>

            {/* Logout Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="rounded-xl h-8 px-2.5 sm:px-3 text-xs gap-1.5 border-neutral-200 hover:bg-neutral-100 text-neutral-700"
            >
              {isLoggingOut ? (
                <LuLoader className="size-3.5 animate-spin" />
              ) : (
                <LuLogOut className="size-3.5" />
              )}
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
