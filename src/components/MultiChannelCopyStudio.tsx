"use client";

import React, { useState } from "react";
import { Sparkles, Copy, Check, Send, Loader2 } from "lucide-react";
import { Community } from "@/lib/types";

interface CopyStudioProps {
  communities: Community[];
  onPublished: () => void;
}

interface GeneratedCopy {
  xiaohongshu: string;
  douyin: string;
  moments: string;
  sales_script: string;
}

export default function MultiChannelCopyStudio({
  communities,
  onPublished
}: CopyStudioProps) {
  const [communityName, setCommunityName] = useState(communities[0]?.name || "保利天珺");
  const [areaSqm, setAreaSqm] = useState(128);
  const [style, setStyle] = useState("现代奶油风");
  const [budgetWan, setBudgetWan] = useState(16.8);
  const [highlights, setHighlights] = useState(
    "阳台打通并入客厅、全屋柔光砖通铺、ENF级环保主材闭口合同"
  );
  const [visibility, setVisibility] = useState<"public" | "internal">("public");

  const [loading, setLoading] = useState(false);
  const [modeNote, setModeNote] = useState("");
  const [result, setResult] = useState<GeneratedCopy | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [publishDone, setPublishDone] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPublishDone(false);
    setModeNote("");
    try {
      const res = await fetch("/api/ai/generate-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          community_name: communityName,
          area_sqm: areaSqm,
          style,
          budget_wan: budgetWan,
          highlights
        })
      });
      const json = await res.json();
      if (json.data) {
        setResult(json.data);
        if (json.mode === "live_ai") {
          setModeNote(`已由真实大模型 (${json.model}) 生成`);
        } else {
          setModeNote("当前为内置演示生成 · 在 .env.local 填入 API Key 即可切换真实大模型");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const copyText = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handlePublish = async () => {
    if (!result) return;
    await fetch("/api/materials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: `${communityName} ${areaSqm}㎡ ${style} 全渠道物料包`,
        type: "copywriting",
        visibility,
        community_name: communityName,
        style,
        area_sqm: areaSqm,
        budget_wan: budgetWan,
        content_json: result,
        published: true
      })
    });
    setPublishDone(true);
    onPublished();
  };

  const cards = result
    ? [
        { key: "xiaohongshu", label: "小红书种草图文", tag: "C端引流", text: result.xiaohongshu },
        { key: "douyin", label: "抖音 / 视频号口播脚本", tag: "短视频", text: result.douyin },
        { key: "moments", label: "全员朋友圈四宫格配文", tag: "私域转发", text: result.moments },
        { key: "sales_script", label: "企微 1v1 客户跟进话术", tag: "网销转化", text: result.sales_script }
      ]
    : [];

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 space-y-10">
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-yipin-red">
          Multi-Channel Engine
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-apple-text">
          一案多吃 · 全渠道矩阵写稿
        </h1>
        <p className="mt-1.5 text-sm text-apple-muted">
          自动读取楼盘资产库痛点，一次输入生成 4 大平台即用文案，并可按权限同步至小程序。
        </p>
      </div>

      <form
        onSubmit={handleGenerate}
        className="rounded-[28px] bg-apple-surface p-7 space-y-6"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="text-xs font-medium text-apple-muted">关联楼盘（自动读取知识库）</label>
            <input
              list="community-options"
              value={communityName}
              onChange={(e) => setCommunityName(e.target.value)}
              className="mt-1.5 w-full rounded-2xl bg-white px-4 py-2.5 text-sm outline-none ring-1 ring-black/10 focus:ring-apple-text"
            />
            <datalist id="community-options">
              {communities.map((c) => (
                <option key={c.id} value={c.name} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="text-xs font-medium text-apple-muted">建筑面积 (㎡)</label>
            <input
              type="number"
              value={areaSqm}
              onChange={(e) => setAreaSqm(Number(e.target.value))}
              className="mt-1.5 w-full rounded-2xl bg-white px-4 py-2.5 text-sm outline-none ring-1 ring-black/10 focus:ring-apple-text"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-apple-muted">装修风格</label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="mt-1.5 w-full rounded-2xl bg-white px-4 py-2.5 text-sm outline-none ring-1 ring-black/10 focus:ring-apple-text"
            >
              <option>现代奶油风</option>
              <option>原木侘寂风</option>
              <option>意式极简风</option>
              <option>中古法式风</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-apple-muted">全包造价 (万元)</label>
            <input
              type="number"
              step="0.1"
              value={budgetWan}
              onChange={(e) => setBudgetWan(Number(e.target.value))}
              className="mt-1.5 w-full rounded-2xl bg-white px-4 py-2.5 text-sm outline-none ring-1 ring-black/10 focus:ring-apple-text"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-apple-muted">核心施工 / 设计亮点</label>
          <input
            type="text"
            value={highlights}
            onChange={(e) => setHighlights(e.target.value)}
            className="mt-1.5 w-full rounded-2xl bg-white px-4 py-3 text-sm outline-none ring-1 ring-black/10 focus:ring-apple-text"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-3 text-xs">
            <span className="text-apple-muted">发布可见范围：</span>
            <button
              type="button"
              onClick={() => setVisibility("public")}
              className={`rounded-full px-3.5 py-1.5 font-medium ${
                visibility === "public" ? "bg-apple-text text-white" : "bg-white text-apple-muted"
              }`}
            >
              同步业主端 + 员工端
            </button>
            <button
              type="button"
              onClick={() => setVisibility("internal")}
              className={`rounded-full px-3.5 py-1.5 font-medium ${
                visibility === "internal" ? "bg-apple-text text-white" : "bg-white text-apple-muted"
              }`}
            >
              仅员工端可见
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full bg-apple-text px-6 py-3 text-sm font-medium text-white transition hover:bg-black/85 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? "正在生成全渠道文案..." : "一键生成 4 端物料"}
          </button>
        </div>
      </form>

      {result && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs text-apple-muted">{modeNote}</span>
            <button
              onClick={handlePublish}
              disabled={publishDone}
              className="inline-flex items-center gap-2 rounded-full bg-yipin-red px-5 py-2.5 text-xs font-medium text-white transition hover:bg-yipin-redHover disabled:bg-emerald-600"
            >
              {publishDone ? <Check className="h-3.5 w-3.5" /> : <Send className="h-3.5 w-3.5" />}
              {publishDone ? "已推送至小程序素材库" : "一键推送至小程序素材库"}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {cards.map((card) => (
              <div
                key={card.key}
                className="flex flex-col justify-between rounded-[24px] border border-black/[0.06] bg-white p-6 shadow-apple"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-apple-text">{card.label}</h3>
                      <span className="rounded-full bg-apple-surface px-2.5 py-0.5 text-[11px] font-medium text-apple-muted">
                        {card.tag}
                      </span>
                    </div>
                    <button
                      onClick={() => copyText(card.key, card.text)}
                      className="inline-flex items-center gap-1 rounded-full bg-apple-surface px-3 py-1 text-xs font-medium text-apple-text hover:bg-black/[0.08]"
                    >
                      {copiedKey === card.key ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-600" /> 已复制
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" /> 复制
                        </>
                      )}
                    </button>
                  </div>
                  <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-apple-text/90">
                    {card.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
