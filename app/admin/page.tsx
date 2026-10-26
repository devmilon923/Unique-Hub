"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  LuRefreshCw,
  LuBoxes,
  LuExternalLink,
  LuCircleCheck,
  LuLogOut,
  LuShieldCheck,
} from "react-icons/lu";

export default function AdminDashboardPage() {
  const { user, refreshProfile, logout } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setFeedback(null);
    try {
      const updated = await refreshProfile();
      setFeedback(
        updated
          ? "Session re-verified with server."
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
            <span>{isRefreshing ? "Checking..." : "Re-check Profile"}</span>
          </Button>

          <Link href="/products">
            <Button
              size="sm"
              className="rounded-xl h-8.5 text-xs gap-1.5 bg-neutral-900 text-white hover:bg-neutral-800 cursor-pointer"
            >
              <LuBoxes className="size-3.5" />
              <span>Catalog</span>
            </Button>
          </Link>

          <Link href="/">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl h-8.5 text-xs gap-1.5 border-neutral-200 hover:bg-neutral-100 cursor-pointer"
            >
              <span>Store</span>
              <LuExternalLink className="size-3 text-neutral-400" />
            </Button>
          </Link>
        </div>
      </div>

      {feedback && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-neutral-900 text-white text-xs shadow-xs animate-fade-in-up">
          <LuCircleCheck className="size-4 text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

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
