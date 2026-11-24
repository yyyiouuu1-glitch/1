"use client";

import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Bookmark,
  Check,
  Copy,
  Search,
  Sparkles
} from "lucide-react";
import BeforeAfterSlider from "./BeforeAfterSlider";
import { MATERIAL_TYPE_LABEL } from "@/lib/platform";
import { Material } from "@/lib/types";

type Props = {
  materials: Material[];
  compact: boolean;
  selectedId: string | null;
  canUseInClose: boolean;
  onSelect: (id: string | null) => void;
  onCarryToClose: (id: string) => void;
  onNotify: (msg: string) => void;
};

type CopyChannel = "sales_script" | "moments" | "xiaohongshu" | "douyin";

const CHANNELS: { key: CopyChannel; label: string }[] = [
  { key: "sales_script", label: "私聊谈单" },
  { key: "moments", label: "朋友圈" },
  { key: "xiaohongshu", label: "小红书" },
  { key: "douyin", label: "短视频脚本" }
];

export default function MaterialLibraryView({
  materials,
  compact,
  selectedId,
  canUseInClose,
  onSelect,
  onCarryToClose,
  onNotify
}: Props) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<"all" | Material["type"] | "saved">("all");
  const [savedIds, setSavedIds] = useState<string[]>(["mat-1"]);

  const active = materials.find((item) => item.id === selectedId);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return materials.filter((item) => {
      if (kind === "saved" && !savedIds.includes(item.id)) return false;
      if (kind !== "all" && kind !== "saved" && item.type !== kind) return false;
      if (!q) return true;
      return `${item.title} ${item.community_name} ${item.style} ${item.area_sqm}`
        .toLowerCase()
        .includes(q);
    });
  }, [materials, query, kind, savedIds]);

  function toggleSave(id: string) {
    setSavedIds((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
    );
  }

  if (active) {
    return (
      <MaterialDetail
        material={active}
        compact={compact}
        saved={savedIds.includes(active.id)}
        canUseInClose={canUseInClose}
        onToggleSave={() => {
          toggleSave(active.id);
          onNotify(savedIds.includes(active.id) ? "已取消常用收藏" : "已加入我的常用素材");
        }}
        onBack={() => onSelect(null)}
        onUse={() => onCarryToClose(active.id)}
        onNotify={onNotify}
      />
    );
  }

  return (
    <div className={compact ? "px-4 py-6" : "mx-auto max-w-[1120px] px-6 py-12"}>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1
            className={`font-semibold tracking-[-0.025em] text-[#1d1d1f] ${
              compact ? "text-[26px]" : "text-[40px] leading-[1.08]"
            }`}
          >
            公司素材库
          </h1>
          <p className="mt-2 max-w-[38rem] text-[15px] leading-relaxed text-[#6e6e73]">
            总部企划与设计部统一出品的实景案例、改造对比与活动海报。按小区或风格秒搜，进门即展示。
          </p>
        </div>

        <label className="relative block w-full md:w-72">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6e6e73]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜小区、风格或面积"
            className="h-10 w-full rounded-full bg-[#f5f5f7] pl-10 pr-4 text-[14px] text-[#1d1d1f] placeholder:text-[#6e6e73] transition focus:bg-white focus:ring-1 focus:ring-black/15"
          />
        </label>
      </div>

      <div className="no-scrollbar mt-6 flex items-center gap-2 overflow-x-auto pb-1">
        {(
          [
            ["all", `全部 (${materials.length})`],
            ["before_after", "实景对比"],
            ["case", "实景案例"],
            ["poster", "活动海报"],
            ["saved", `我的常用 (${savedIds.length})`]
          ] as const
        ).map(([id, label]) => {
          const on = kind === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setKind(id)}
              className={`h-9 shrink-0 rounded-full px-4 text-[13px] font-medium transition ${
                on
                  ? "bg-[#1d1d1f] text-white"
                  : "bg-[#f5f5f7] text-[#1d1d1f] hover:bg-black/[0.08]"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-10 rounded-2xl bg-[#f5f5f7] px-6 py-14 text-center">
          <p className="text-[16px] font-medium text-[#1d1d1f]">没有匹配的素材</p>
          <p className="mt-1.5 text-[14px] text-[#6e6e73]">
            换一个楼盘名称，或点击「全部」查看总部已发布的实景案例。
          </p>
        </div>
      ) : (
        <div
          className={`mt-8 grid gap-6 ${
            compact ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
          }`}
        >
          {filtered.map((item, idx) => {
            const saved = savedIds.includes(item.id);
            const featured = !compact && idx === 0 && kind === "all" && !query;
            return (
              <article
                key={item.id}
                className={`group liquid-glass-subtle ios-card-hover overflow-hidden rounded-[26px] ${
                  featured ? "md:col-span-2 md:grid md:grid-cols-12 md:items-stretch" : "flex flex-col"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelect(item.id)}
                  className={`relative block w-full overflow-hidden bg-[#1d1d1f] text-left ${
                    featured ? "aspect-[16/10] md:col-span-7 md:aspect-auto md:min-h-[340px]" : "aspect-[16/10]"
                  }`}
                >
                  <img
                    src={item.after_image || item.before_image}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <span className="apple-glass-dark absolute left-3.5 top-3.5 rounded-full px-3 py-1 text-[11px] font-medium text-white">
                    {MATERIAL_TYPE_LABEL[item.type] || "精选案例"}
                  </span>
                </button>

                <div
                  className={`flex flex-1 flex-col justify-between p-5 sm:p-6 ${
                    featured ? "md:col-span-5 md:p-8" : ""
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[12px] font-medium text-[#6e6e73]">
                        {item.community_name} · {item.style}
                      </span>
                      <button
                        type="button"
                        aria-label={saved ? "取消收藏" : "收藏常用"}
                        onClick={() => toggleSave(item.id)}
                        className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
                          saved
                            ? "bg-[#1d1d1f] text-white"
                            : "bg-white text-[#6e6e73] hover:text-[#1d1d1f]"
                        }`}
                      >
                        <Bookmark className="h-3.5 w-3.5" fill={saved ? "currentColor" : "none"} />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelect(item.id)}
                      className="mt-2 block text-left"
                    >
                      <h2
                        className={`font-semibold tracking-[-0.02em] text-[#1d1d1f] group-hover:text-[#0071e3] transition-colors ${
                          featured ? "text-[24px] leading-snug" : "text-[19px] leading-snug"
                        }`}
                      >
                        {item.title}
                      </h2>
                    </button>

                    <div className="mt-3 flex flex-wrap gap-2 text-[12px] text-[#1d1d1f] tabular-nums">
                      <span className="rounded-full bg-white px-2.5 py-1">{item.area_sqm}㎡</span>
                      <span className="rounded-full bg-white px-2.5 py-1">全包 {item.budget_wan} 万</span>
                      <span className="rounded-full bg-white px-2.5 py-1 text-[#6e6e73]">
                        {item.created_by}
                      </span>
                    </div>

                    {item.content_json.sales_script && (
                      <p className="mt-3.5 line-clamp-2 text-[14px] leading-relaxed text-[#6e6e73]">
                        {item.content_json.sales_script}
                      </p>
                    )}
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-black/[0.06] pt-4">
                    <button
                      type="button"
                      onClick={() => onSelect(item.id)}
                      className="inline-flex items-center gap-1 text-[14px] font-medium text-[#0071e3] hover:underline"
                    >
                      查看实景与话术
                      <ArrowUpRight className="h-4 w-4" />
                    </button>
                    {canUseInClose && (
                      <button
                        type="button"
                        onClick={() => onCarryToClose(item.id)}
                        className="rounded-full bg-white px-3.5 py-1.5 text-[12px] font-medium text-[#1d1d1f] transition hover:bg-[#1d1d1f] hover:text-white"
                      >
                        带去签单
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MaterialDetail({
  material,
  compact,
  saved,
  canUseInClose,
  onToggleSave,
  onBack,
  onUse,
  onNotify
}: {
  material: Material;
  compact: boolean;
  saved: boolean;
  canUseInClose: boolean;
  onToggleSave: () => void;
  onBack: () => void;
  onUse: () => void;
  onNotify: (msg: string) => void;
}) {
  const [channel, setChannel] = useState<CopyChannel>("sales_script");
  const [copied, setCopied] = useState(false);

  const activeText = material.content_json[channel] || material.content_json.sales_script || "";

  async function copyCurrent() {
    if (!activeText) return;
    try {
      await navigator.clipboard.writeText(activeText);
      setCopied(true);
      onNotify("话术文案已复制，可直接发给业主");
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className={compact ? "px-4 py-6" : "mx-auto max-w-[1040px] px-6 py-10"}>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[#0071e3] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          返回素材库
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleSave}
            className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium transition ${
              saved ? "bg-[#1d1d1f] text-white" : "bg-[#f5f5f7] text-[#1d1d1f]"
            }`}
          >
            <Bookmark className="h-3.5 w-3.5" fill={saved ? "currentColor" : "none"} />
            {saved ? "已收藏" : "收藏常用"}
          </button>
          {canUseInClose && (
            <button
              type="button"
              onClick={onUse}
              className="h-9 rounded-full bg-[#0071e3] px-4 text-[13px] font-medium text-white transition hover:bg-[#0077ed]"
            >
              带去签单
            </button>
          )}
        </div>
      </div>

      <div className="mt-6">
        <p className="text-[13px] font-medium text-[#6e6e73]">
          {material.community_name} · {material.style} · {material.area_sqm}㎡ · 落地 {material.budget_wan} 万
        </p>
        <h1
          className={`mt-2 font-semibold tracking-[-0.025em] text-[#1d1d1f] ${
            compact ? "text-[24px] leading-snug" : "text-[36px] leading-[1.12]"
          }`}
        >
          {material.title}
        </h1>
      </div>

      <div className="mt-6">
        {material.before_image && material.after_image ? (
          <BeforeAfterSlider
            beforeUrl={material.before_image}
            afterUrl={material.after_image}
            title={material.title}
            compact={compact}
          />
        ) : (
          <img
            src={material.after_image || material.before_image}
            alt={material.title}
            className="aspect-[16/9] w-full rounded-2xl object-cover"
          />
        )}
      </div>

      <section className="mt-8 rounded-2xl bg-[#f5f5f7] p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#0071e3]" />
            <h2 className="text-[16px] font-semibold text-[#1d1d1f]">配套转发与谈单话术</h2>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {CHANNELS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  setChannel(item.key);
                  setCopied(false);
                }}
                className={`h-8 rounded-full px-3 text-[12px] font-medium transition ${
                  channel === item.key
                    ? "bg-[#1d1d1f] text-white"
                    : "bg-white text-[#6e6e73] hover:text-[#1d1d1f]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-4 whitespace-pre-wrap rounded-xl bg-white p-4 text-[15px] leading-7 text-[#1d1d1f]">
          {activeText || "该渠道暂无配套文案。"}
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <span className="text-[12px] text-[#6e6e73]">
            转发小程序卡片时将自动带上你的专属顾问名片与留资归因
          </span>
          <button
            type="button"
            onClick={copyCurrent}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#1d1d1f] px-4 text-[13px] font-medium text-white transition hover:bg-black/85"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "已复制到剪贴板" : "一键复制文案"}
          </button>
        </div>
      </section>
    </div>
  );
}
