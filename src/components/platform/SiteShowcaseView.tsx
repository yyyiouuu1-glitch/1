"use client";

import React, { useState } from "react";
import { CalendarCheck2, Check, CheckCircle2, MapPin, Share2 } from "lucide-react";
import { SITE_BROADCASTS } from "@/lib/platform";

type Props = {
  compact: boolean;
  onNotify: (msg: string) => void;
};

export default function SiteShowcaseView({ compact, onNotify }: Props) {
  const [invitedId, setInvitedId] = useState<string | null>(null);

  async function inviteVisit(site: (typeof SITE_BROADCASTS)[number]) {
    const msg = `【同小区实景工地邀约】\n小区：${site.community}（${site.unit}）\n当前阶段：${site.stage}（进度 ${site.progress}%）\n工艺亮点：${site.highlight}\n这周末可预约带您实地看水电与施工标准，回复时间我帮您安排工长接待。`;
    try {
      await navigator.clipboard.writeText(msg);
    } catch {
      /* ignore */
    }
    setInvitedId(site.id);
    onNotify(`已复制「${site.community}」看工地邀约卡片文案`);
    window.setTimeout(() => setInvitedId(null), 2200);
  }

  return (
    <div className={compact ? "px-4 py-5 space-y-5" : "mx-auto max-w-[1120px] px-6 py-10 space-y-8"}>
      <div>
        <h1
          className={`font-semibold tracking-[-0.025em] text-[#1d1d1f] ${
            compact ? "text-[26px]" : "text-[38px] leading-[1.08]"
          }`}
        >
          同小区透明工地
        </h1>
        <p className="mt-2 max-w-[40rem] text-[15px] text-[#6e6e73]">
          看一千句承诺，不如带业主看一眼楼下正在施工的真工地。实时同步巡检实拍，一键发出周末看工地邀约。
        </p>
      </div>

      <div className={`grid gap-5 ${compact ? "grid-cols-1" : "md:grid-cols-3"}`}>
        {SITE_BROADCASTS.map((site) => {
          const sent = invitedId === site.id;
          return (
            <article
              key={site.id}
              className="liquid-glass-subtle ios-card-hover flex flex-col overflow-hidden rounded-[26px]"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#1d1d1f]">
                <img
                  src={site.photo}
                  alt={`${site.community} ${site.stage}`}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                <span className="liquid-glass-dark absolute left-3.5 top-3.5 rounded-full px-3 py-1 text-[11px] font-medium text-white">
                  {site.stage}
                </span>
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                  <span className="inline-flex items-center gap-1 text-[13px] font-semibold">
                    <MapPin className="h-3.5 w-3.5" />
                    {site.community}
                  </span>
                  <span className="text-[11px] text-white/80">{site.updatedAt}</span>
                </div>
              </div>

              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  <div className="flex items-center justify-between text-[12px] text-[#6e6e73]">
                    <span>{site.unit}</span>
                    <span>{site.manager}</span>
                  </div>

                  {/* Progress Track */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="font-medium text-[#1d1d1f]">施工进度</span>
                      <span className="font-semibold text-[#007aff] tabular-nums">
                        {site.progress}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-black/[0.07]">
                      <div
                        className="h-full rounded-full bg-[#007aff]"
                        style={{ width: `${site.progress}%` }}
                      />
                    </div>
                  </div>

                  <p className="mt-3.5 text-[13px] leading-6 text-[#1d1d1f]/90">{site.highlight}</p>

                  <div className="mt-3.5 flex flex-wrap gap-1.5">
                    {site.checks.map((chk) => (
                      <span
                        key={chk}
                        className="inline-flex items-center gap-1 rounded-full bg-[#34c759]/10 px-2.5 py-1 text-[11px] font-medium text-[#1d8a4e]"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        {chk}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => inviteVisit(site)}
                  className="ios-press mt-5 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-full bg-[#1d1d1f] text-[13px] font-medium text-white hover:bg-black/85"
                >
                  {sent ? (
                    <>
                      <Check className="h-4 w-4 text-[#30d158]" />
                      已复制邀约文案
                    </>
                  ) : (
                    <>
                      <CalendarCheck2 className="h-4 w-4" />
                      一键邀约业主看工地
                      <Share2 className="h-3.5 w-3.5 opacity-70" />
                    </>
                  )}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
