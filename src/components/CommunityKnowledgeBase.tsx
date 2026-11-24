"use client";

import React, { useState } from "react";
import { Plus, Lock, Globe, X } from "lucide-react";
import { Community } from "@/lib/types";

interface Props {
  communities: Community[];
  onRefresh: () => void;
}

export default function CommunityKnowledgeBase({ communities, onRefresh }: Props) {
  const [openModal, setOpenModal] = useState(false);
  const [name, setName] = useState("");
  const [district, setDistrict] = useState("千灯湖 / 桂城");
  const [hotLayouts, setHotLayouts] = useState("98㎡三房 / 128㎡四房");
  const [painPoints, setPainPoints] = useState("");
  const [competitorScript, setCompetitorScript] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await fetch("/api/communities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          district,
          hot_layouts: hotLayouts,
          pain_points: painPoints,
          competitor_script: competitorScript
        })
      });
      setName("");
      setPainPoints("");
      setCompetitorScript("");
      setOpenModal(false);
      onRefresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-yipin-red">
            Knowledge Base
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-apple-text">
            楼盘资产与竞品话术库
          </h1>
          <p className="mt-1.5 text-sm text-apple-muted">
            API 层自动隔离权限：业主端仅拉取「户型痛点」，内部「竞品反击话术」仅对员工端开放。
          </p>
        </div>

        <button
          onClick={() => setOpenModal(true)}
          className="inline-flex items-center gap-2 rounded-full bg-apple-text px-5 py-2.5 text-xs font-medium text-white transition hover:bg-black/85"
        >
          <Plus className="h-4 w-4" />
          新增楼盘资产
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {communities.map((c) => (
          <div
            key={c.id}
            className="overflow-hidden rounded-[24px] border border-black/[0.06] bg-white shadow-apple flex flex-col"
          >
            <div className="relative h-44 w-full">
              <img src={c.cover_image} alt={c.name} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-4 right-4 text-white">
                <h3 className="text-lg font-semibold">{c.name}</h3>
                <p className="text-xs text-white/80">
                  {c.district} · {c.hot_layouts}
                </p>
              </div>
            </div>

            <div className="flex-1 space-y-4 p-5">
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-700">
                  <Globe className="h-3.5 w-3.5" />
                  业主端公开 · 户型痛点与改造建议
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-apple-text/90">
                  {c.pain_points}
                </p>
              </div>

              {c.competitor_script && (
                <div className="rounded-2xl bg-yipin-soft p-3.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-yipin-red">
                    <Lock className="h-3.5 w-3.5" />
                    仅员工端可见 · 竞品反击话术
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-apple-text/85">
                    {c.competitor_script}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {openModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-lg rounded-[28px] bg-white p-7 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">新增重点楼盘</h2>
              <button
                type="button"
                onClick={() => setOpenModal(false)}
                className="rounded-full p-1.5 hover:bg-apple-surface"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-apple-muted">小区名称 *</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="如：保利良溪"
                  className="mt-1 w-full rounded-xl bg-apple-surface px-3.5 py-2.5 text-sm outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-apple-muted">所在板块</label>
                <input
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="mt-1 w-full rounded-xl bg-apple-surface px-3.5 py-2.5 text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-apple-muted">主流户型</label>
              <input
                value={hotLayouts}
                onChange={(e) => setHotLayouts(e.target.value)}
                className="mt-1 w-full rounded-xl bg-apple-surface px-3.5 py-2.5 text-sm outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-apple-muted">户型痛点（业主端可见）</label>
              <textarea
                rows={3}
                value={painPoints}
                onChange={(e) => setPainPoints(e.target.value)}
                placeholder="输入该楼盘的采光、动线、玄关等改造卖点..."
                className="mt-1 w-full rounded-xl bg-apple-surface px-3.5 py-2.5 text-sm outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-yipin-red font-medium">
                竞品反击话术（仅员工端可见，业主不可见）
              </label>
              <textarea
                rows={3}
                value={competitorScript}
                onChange={(e) => setCompetitorScript(e.target.value)}
                placeholder="针对周边竞品套餐漏洞的签单反击话术..."
                className="mt-1 w-full rounded-xl bg-yipin-soft px-3.5 py-2.5 text-sm outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setOpenModal(false)}
                className="rounded-full bg-apple-surface px-5 py-2 text-xs font-medium"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-apple-text px-5 py-2 text-xs font-medium text-white"
              >
                {saving ? "保存中..." : "保存并同步"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
