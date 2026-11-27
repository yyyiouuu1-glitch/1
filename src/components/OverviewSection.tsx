"use client";

import React from "react";
import { ArrowUpRight, Sparkles, Layers, Building2, Users } from "lucide-react";
import { TabKey } from "./TopNav";

interface OverviewProps {
  onNavigate: (tab: TabKey) => void;
  stats: {
    materials: number;
    communities: number;
    leads: number;
  };
}

export default function OverviewSection({ onNavigate, stats }: OverviewProps) {
  return (
    <div className="space-y-16 pb-20">
      {/* Apple-style Hero */}
      <section className="mx-auto max-w-4xl pt-16 text-center px-6">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-yipin-red/15 bg-yipin-soft px-3.5 py-1 text-xs font-medium text-yipin-red">
          <span className="h-1.5 w-1.5 rounded-full bg-yipin-red" />
          壹品整装 · 三端协同正式工程版
        </div>
        <h1 className="text-4xl font-semibold tracking-tight text-apple-text sm:text-6xl leading-[1.08]">
          企划生产，
          <span className="text-apple-muted">一线直达。</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-apple-muted sm:text-lg">
          将壹品整装的楼盘资产、空间变装与全渠道内容封装为极简工作流。企划部在 PC
          端一次生成，自动分发至小程序员工端与业主端，实现线索精准归因。
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => onNavigate("space")}
            className="rounded-full bg-apple-text px-6 py-3 text-sm font-medium text-white transition hover:bg-black/85"
          >
            开始空间变装
          </button>
          <button
            onClick={() => onNavigate("copy")}
            className="rounded-full bg-apple-surface px-6 py-3 text-sm font-medium text-apple-text transition hover:bg-black/[0.07]"
          >
            一案多吃写稿
          </button>
        </div>
      </section>

      {/* Bento Grid */}
      <section className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          {/* Card 1: Space Transform */}
          <div
            onClick={() => onNavigate("space")}
            className="group relative col-span-1 cursor-pointer overflow-hidden rounded-[28px] bg-apple-surface md:col-span-7 shadow-apple transition-all duration-300 hover:shadow-apple-hover"
          >
            <div className="relative h-80 w-full overflow-hidden">
              <img
                src="/home/hall-oak.jpg"
                alt="空间变装"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
              <div className="absolute bottom-6 left-7 right-7 flex items-end justify-between text-white">
                <div>
                  <p className="text-xs font-medium uppercase tracking-widest text-white/80">
                    Space Studio
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold">毛坯 / 老房 AI 空间变装</h2>
                  <p className="mt-1 text-sm text-white/80">
                    锁定户型结构与采光，异步队列出图，一键推送小程序业主端。
                  </p>
                </div>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition group-hover:bg-white group-hover:text-black">
                  <ArrowUpRight className="h-5 w-5" />
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Multi-channel Copy */}
          <div
            onClick={() => onNavigate("copy")}
            className="group col-span-1 flex cursor-pointer flex-col justify-between rounded-[28px] bg-apple-surface p-8 md:col-span-5 shadow-apple transition-all duration-300 hover:shadow-apple-hover"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm">
                <Sparkles className="h-5 w-5 text-yipin-red" />
              </div>
              <ArrowUpRight className="h-5 w-5 text-apple-muted transition group-hover:text-apple-text" />
            </div>
            <div className="mt-10">
              <p className="text-xs font-medium uppercase tracking-widest text-apple-muted">
                Content Engine
              </p>
              <h2 className="mt-1.5 text-2xl font-semibold text-apple-text">一案多吃 · 矩阵批产</h2>
              <p className="mt-2 text-sm leading-relaxed text-apple-muted">
                结合楼盘知识库，一次产出小红书笔记、抖音口播、朋友圈四宫格文案与企微跟单话术。
              </p>
              <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-medium text-apple-text">
                已沉淀 {stats.materials} 套可转发物料
              </div>
            </div>
          </div>

          {/* Card 3: Communities */}
          <div
            onClick={() => onNavigate("communities")}
            className="group col-span-1 flex cursor-pointer flex-col justify-between rounded-[28px] border border-black/[0.06] bg-white p-8 md:col-span-6 shadow-apple transition-all duration-300 hover:shadow-apple-hover"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-apple-surface">
                <Building2 className="h-5 w-5 text-apple-text" />
              </div>
              <span className="rounded-full bg-apple-surface px-3 py-1 text-xs font-medium text-apple-muted">
                {stats.communities} 个重点楼盘
              </span>
            </div>
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-apple-text">广佛楼盘资产与话术库</h3>
              <p className="mt-2 text-sm text-apple-muted">
                严格区分「业主端公开痛点」与「员工端内部竞品反击话术」，权限自动隔离。
              </p>
            </div>
          </div>

          {/* Card 4: Leads Attribution */}
          <div
            onClick={() => onNavigate("leads")}
            className="group col-span-1 flex cursor-pointer flex-col justify-between rounded-[28px] bg-[#1D1D1F] p-8 text-white md:col-span-6 shadow-apple transition-all duration-300 hover:shadow-apple-hover"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                <Users className="h-5 w-5 text-white" />
              </div>
              <span className="rounded-full bg-yipin-red px-3 py-1 text-xs font-medium text-white">
                实时归因 · {stats.leads} 条线索
              </span>
            </div>
            <div className="mt-8">
              <h3 className="text-xl font-semibold">小程序线索与业绩归因看板</h3>
              <p className="mt-2 text-sm text-white/70">
                追踪每一位销售、设计师带参分享后的业主报价留资，自动绑定业绩归属人。
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
