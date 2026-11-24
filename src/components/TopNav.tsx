"use client";

import React from "react";

export type TabKey = "overview" | "space" | "copy" | "communities" | "leads";

interface TopNavProps {
  activeTab: TabKey;
  onChange: (tab: TabKey) => void;
  publishedCount: number;
  newLeadsCount: number;
}

const NAV_ITEMS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "概览" },
  { key: "space", label: "空间变装" },
  { key: "copy", label: "一案多吃" },
  { key: "communities", label: "楼盘资产库" },
  { key: "leads", label: "线索归因" }
];

export default function TopNav({
  activeTab,
  onChange,
  publishedCount,
  newLeadsCount
}: TopNavProps) {
  return (
    <header className="glass-nav sticky top-0 z-50 border-b border-black/[0.06]">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <button
          onClick={() => onChange("overview")}
          className="flex items-center gap-3 text-left transition-opacity hover:opacity-80"
        >
          <img
            src="/logo.png"
            alt="壹品整装 YIPIN DECORATION"
            className="h-7 w-auto object-contain"
          />
          <span className="hidden h-4 w-[1px] bg-black/15 sm:inline-block" />
          <span className="hidden text-xs font-medium tracking-wide text-apple-muted sm:inline-block">
            企划 AI 工作台
          </span>
        </button>

        <nav className="flex items-center gap-1 rounded-full bg-apple-surface p-1">
          {NAV_ITEMS.map((item) => {
            const active = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onChange(item.key)}
                className={`relative rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                  active
                    ? "bg-white text-apple-text shadow-sm"
                    : "text-apple-muted hover:text-apple-text"
                }`}
              >
                {item.label}
                {item.key === "leads" && newLeadsCount > 0 && (
                  <span className="ml-1.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-yipin-red px-1 text-[10px] font-semibold text-white">
                    {newLeadsCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 text-xs text-apple-muted md:flex">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
          <span>已同步小程序 {publishedCount} 项</span>
        </div>
      </div>
    </header>
  );
}
