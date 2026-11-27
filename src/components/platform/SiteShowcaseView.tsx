"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, Monitor, X } from "lucide-react";
import { ACTIVE_SITES, ActiveSite } from "@/lib/active-sites";
import { COMPLETED_SITES, CompletedSite } from "@/lib/completed-sites";
import FoshanSiteMap from "@/components/platform/FoshanSiteMap";

type Props = {
  compact: boolean;
  onNotify: (msg: string) => void;
};

type MapPoint = {
  id: string;
  community: string;
  lat: number;
  lng: number;
  status: "active" | "done";
};

function toMapPoints(showActive: boolean, showDone: boolean): MapPoint[] {
  const points: MapPoint[] = [];
  if (showActive) {
    for (const site of ACTIVE_SITES) {
      if (site.lat == null || site.lng == null) continue;
      points.push({ id: site.id, community: site.community, lat: site.lat, lng: site.lng, status: "active" });
    }
  }
  if (showDone) {
    for (const site of COMPLETED_SITES) {
      if (site.lat == null || site.lng == null) continue;
      points.push({ id: site.id, community: site.community, lat: site.lat, lng: site.lng, status: "done" });
    }
  }
  return points;
}

export default function SiteShowcaseView({ compact, onNotify }: Props) {
  const [mode, setMode] = useState<"manage" | "screen">("manage");
  const [community, setCommunity] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [showActive, setShowActive] = useState(true);
  const [showDone, setShowDone] = useState(true);
  const [highlight, setHighlight] = useState<string | null>(null);
  const mapSites = useMemo(() => toMapPoints(showActive, showDone), [showActive, showDone]);
  const groups = useMemo(() => groupSites(query), [query]);
  const doneMatches = useMemo(() => (query.trim() ? groupCompleted(query) : []), [query]);

  useEffect(() => {
    if (!community) return;
    document.querySelector(`[data-site-card="${CSS.escape(community)}"]`)?.scrollIntoView({
      block: "nearest",
      behavior: "smooth"
    });
  }, [community]);

  void onNotify;

  if (mode === "screen") {
    return <SiteScreen compact={compact} onBack={() => setMode("manage")} />;
  }

  return (
    <div className={compact ? "space-y-12 px-5 py-8" : "mx-auto max-w-[1120px] space-y-16 px-6 py-14"}>
      <header className="space-y-8">
        <div className="max-w-[34rem] space-y-3">
          <h1
            className={`font-semibold tracking-[-0.03em] text-[#1d1d1f] ${
              compact ? "text-[34px] leading-[1.12]" : "text-[48px] leading-[1.05]"
            }`}
          >
            工地管理
          </h1>
          <p className="text-[17px] leading-7 text-[#6e6e73]">
            红点是在施，绿点是完工。点开小区，查看楼号和负责人。
          </p>
        </div>
        <div className="grid max-w-[28rem] grid-cols-3 gap-6">
          <p>
            <span className="block text-[28px] font-semibold tabular-nums tracking-[-0.03em] text-[#1d1d1f]">
              {new Set(ACTIVE_SITES.map((item) => item.community)).size}
            </span>
            <span className="mt-1 block text-[13px] text-[#6e6e73]">个小区</span>
          </p>
          <p>
            <span className="block text-[28px] font-semibold tabular-nums tracking-[-0.03em] text-[#1d1d1f]">
              {ACTIVE_SITES.length}
            </span>
            <span className="mt-1 block text-[13px] text-[#6e6e73]">套在施</span>
          </p>
          <p>
            <span className="block text-[28px] font-semibold tabular-nums tracking-[-0.03em] text-[#1d1d1f]">
              {COMPLETED_SITES.length}
            </span>
            <span className="mt-1 block text-[13px] text-[#6e6e73]">套完工</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            aria-pressed={showActive}
            onClick={() => setShowActive((value) => !value)}
            className={`ios-press h-10 rounded-full px-4 text-[14px] font-medium ${showActive ? "bg-[#ff3b30] text-white" : "bg-[#f2f2f7] text-[#6e6e73]"}`}
          >
            在施
          </button>
          <button
            type="button"
            aria-pressed={showDone}
            onClick={() => setShowDone((value) => !value)}
            className={`ios-press h-10 rounded-full px-4 text-[14px] font-medium ${showDone ? "bg-[#34c759] text-white" : "bg-[#f2f2f7] text-[#6e6e73]"}`}
          >
            完工
          </button>
          <button
            type="button"
            onClick={() => setMode("screen")}
            className="ios-press inline-flex h-10 items-center gap-1.5 rounded-full bg-[#1d1d1f] px-4 text-[14px] font-medium text-white"
          >
            <Monitor className="h-4 w-4" />
            大屏
          </button>
        </div>
      </header>

      <FoshanSiteMap
        sites={mapSites}
        compact={compact}
        selectedId={community}
        highlightId={highlight}
        onSelect={setCommunity}
        onFocusStore={() => setCommunity(null)}
      />

      <section className="space-y-6">
        <div className="max-w-[34rem] space-y-3">
          <h2 className={`font-semibold tracking-[-0.03em] text-[#1d1d1f] ${compact ? "text-[28px]" : "text-[34px]"}`}>
            小区与负责人
          </h2>
        </div>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜小区、房号、负责人"
          className="h-12 w-full max-w-[28rem] rounded-full bg-white px-5 text-[16px] text-[#1d1d1f] outline-none ring-1 ring-black/[0.06] placeholder:text-[#8e8e93]"
        />
        {groups.length === 0 && doneMatches.length === 0 ? (
          <p className="rounded-[22px] bg-white px-4 py-6 text-[14px] text-[#6e6e73]">没有匹配的小区。</p>
        ) : (
          <>
            {groups.map((group) => (
              <div key={group.district} className="space-y-3">
                <h3 className="px-1 text-[13px] font-semibold text-[#6e6e73]">
                  {group.district} · {group.communities.length} 个小区
                </h3>
                {group.communities.map((item) => (
                  <button
                    key={item.community}
                    type="button"
                    data-site-card={item.community}
                    onClick={() => setCommunity(item.community)}
                    onMouseEnter={() => setHighlight(item.community)}
                    onMouseLeave={() => setHighlight((current) => (current === item.community ? null : current))}
                    onFocus={() => setHighlight(item.community)}
                    onBlur={() => setHighlight(null)}
                    className={`ios-press ios-card-hover w-full rounded-[28px] bg-white px-5 py-5 text-left shadow-[0_1px_2px_rgba(0,0,0,0.04)] ${
                      community === item.community ? "ring-2 ring-[#1d1d1f]" : ""
                    }`}
                  >
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="text-[16px] font-semibold text-[#1d1d1f]">{item.community}</span>
                      <span className="shrink-0 text-[12px] text-[#8e8e93]">{item.units.length} 个楼号</span>
                    </span>
                    <span className="mt-2 block space-y-2">
                      {item.units.map((unit) => (
                        <span key={unit.id} className="block">
                          <span className="text-[14px] font-medium text-[#1d1d1f]">
                            {unit.unit}
                            <span className="ml-2 font-normal text-[#6e6e73]">{unit.stage}</span>
                            {unit.areaSqm > 0 ? (
                              <span className="ml-2 font-normal text-[#8e8e93]">{unit.areaSqm}㎡</span>
                            ) : null}
                          </span>
                          <span className="mt-0.5 block text-[12px] leading-5 text-[#6e6e73]">{peopleLine(unit)}</span>
                        </span>
                      ))}
                    </span>
                  </button>
                ))}
              </div>
            ))}
            {doneMatches.length > 0 ? (
              <div className="space-y-2">
                <h3 className="px-1 text-[13px] font-semibold text-[#6e6e73]">完工工地 · {doneMatches.length} 个小区</h3>
                {doneMatches.map((item) => (
                  <button
                    key={item.community}
                    type="button"
                    data-site-card={item.community}
                    onClick={() => setCommunity(item.community)}
                    onMouseEnter={() => setHighlight(item.community)}
                    onMouseLeave={() => setHighlight((current) => (current === item.community ? null : current))}
                    onFocus={() => setHighlight(item.community)}
                    onBlur={() => setHighlight(null)}
                    className={`ios-press ios-card-hover flex w-full items-center justify-between rounded-[22px] bg-white px-4 py-3 text-left ${
                      community === item.community ? "ring-2 ring-[#1d1d1f]" : ""
                    }`}
                  >
                    <span>
                      <span className="block text-[16px] font-semibold text-[#1d1d1f]">{item.community}</span>
                      <span className="mt-0.5 block text-[12px] text-[#6e6e73]">
                        {item.district || "地区未填写"} · 完工 {item.count} 套
                      </span>
                    </span>
                    <span className="rounded-full bg-[#34c759]/15 px-2 py-1 text-[12px] font-medium text-[#1d8a4e]">完工</span>
                  </button>
                ))}
              </div>
            ) : null}
          </>
        )}
      </section>
      {openedCommunity(community) ? <CommunitySheet community={community!} onClose={() => setCommunity(null)} /> : null}
    </div>
  );
}

function SiteScreen({ compact, onBack }: { compact: boolean; onBack: () => void }) {
  const [community, setCommunity] = useState<string | null>(null);
  const mapSites = useMemo(() => toMapPoints(true, true), []);
  const stages = useMemo(() => {
    const counts = new Map<string, number>();
    for (const site of ACTIVE_SITES) counts.set(site.stage, (counts.get(site.stage) ?? 0) + 1);
    return Array.from(counts.entries());
  }, []);

  return (
    <div className={compact ? "space-y-10 px-5 py-8" : "mx-auto max-w-[1120px] space-y-12 px-6 py-14"}>
      <div className="space-y-4">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 text-[15px] font-medium text-[#0071e3]">
          <ArrowLeft className="h-4 w-4" />
          返回工地管理
        </button>
        <h1 className={`font-semibold tracking-[-0.03em] text-[#1d1d1f] ${compact ? "text-[34px]" : "text-[48px]"}`}>
          工地大屏
        </h1>
      </div>
      <FoshanSiteMap
        sites={mapSites}
        compact={compact}
        selectedId={community}
        onSelect={setCommunity}
        onFocusStore={() => setCommunity(null)}
      />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stages.map(([stage, count]) => (
          <div key={stage} className="rounded-[24px] bg-white px-5 py-5">
            <p className="text-[28px] font-semibold tabular-nums tracking-[-0.03em] text-[#1d1d1f]">{count}</p>
            <p className="mt-1 text-[13px] text-[#6e6e73]">{stage}</p>
          </div>
        ))}
      </div>
      {openedCommunity(community) ? <CommunitySheet community={community!} onClose={() => setCommunity(null)} /> : null}
    </div>
  );
}

function CommunitySheet({ community, onClose }: { community: string; onClose: () => void }) {
  const activeUnits = ACTIVE_SITES.filter((item) => item.community === community);
  const doneUnits = COMPLETED_SITES.filter((item) => item.community === community);
  const [scope, setScope] = useState<"active" | "done">(activeUnits.length > 0 ? "active" : "done");
  const [unitId, setUnitId] = useState((scope === "active" ? activeUnits[0]?.id : doneUnits[0]?.id) ?? "");
  const units = scope === "active" ? activeUnits : doneUnits;
  const site = units.find((item) => item.id === unitId) ?? units[0];
  if (!site || typeof document === "undefined") return null;
  const district = site.district || activeUnits.find((item) => item.district)?.district || doneUnits.find((item) => item.district)?.district || "";
  const finished = isCompleted(site);
  const sheet = (
    <div className="fixed inset-0 z-[70]">
      <button type="button" aria-label="关闭施工记录" className="absolute inset-0 bg-black/35" onClick={onClose} />
      <section
        role="dialog"
        aria-modal="true"
        aria-label={`${site.community}施工记录`}
        className="animate-ios-sheet absolute inset-x-0 bottom-0 mx-auto flex max-h-[86vh] w-full max-w-[640px] flex-col overflow-hidden rounded-t-[28px] bg-[#f2f2f7] shadow-[0_-18px_50px_rgba(0,0,0,0.18)]"
      >
        <div className="flex justify-center pt-2">
          <span className="h-1 w-9 rounded-full bg-black/15" />
        </div>
        <div className="flex items-start justify-between gap-3 px-5 pb-2 pt-3">
          <div className="min-w-0">
            <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">{site.community}</h2>
            <p className="mt-1 text-[14px] text-[#6e6e73]">
              {district || "地区未填写"}
              {activeUnits.length > 0 ? ` · 在施 ${activeUnits.length}` : ""}
              {doneUnits.length > 0 ? ` · 完工 ${doneUnits.length}` : ""}
            </p>
          </div>
          <button
            type="button"
            aria-label="关闭"
            onClick={onClose}
            className="ios-press flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/[0.06] text-[#1d1d1f]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {activeUnits.length > 0 && doneUnits.length > 0 ? (
          <div className="flex gap-2 px-5 pb-3">
            <button
              type="button"
              aria-pressed={scope === "active"}
              onClick={() => {
                setScope("active");
                setUnitId(activeUnits[0].id);
              }}
              className={`ios-press rounded-full px-3 py-1.5 text-[13px] font-medium ${scope === "active" ? "bg-[#ff3b30] text-white" : "bg-white text-[#1d1d1f]"}`}
            >
              在施 {activeUnits.length}
            </button>
            <button
              type="button"
              aria-pressed={scope === "done"}
              onClick={() => {
                setScope("done");
                setUnitId(doneUnits[0].id);
              }}
              className={`ios-press rounded-full px-3 py-1.5 text-[13px] font-medium ${scope === "done" ? "bg-[#34c759] text-white" : "bg-white text-[#1d1d1f]"}`}
            >
              完工 {doneUnits.length}
            </button>
          </div>
        ) : null}
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-5 pb-3">
          {units.map((unit) => {
            const active = unit.id === site.id;
            return (
              <button
                key={unit.id}
                type="button"
                aria-pressed={active}
                onClick={() => setUnitId(unit.id)}
                className={`ios-press shrink-0 rounded-full px-3 py-1.5 text-left ${
                  active ? "bg-[#1d1d1f] text-white" : "bg-white text-[#1d1d1f]"
                }`}
              >
                <span className="block text-[13px] font-semibold">{unit.unit}</span>
                <span className={`block text-[11px] ${active ? "text-white/70" : "text-[#8e8e93]"}`}>{unit.stage}</span>
              </button>
            );
          })}
        </div>
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 pb-8">
          <div className="rounded-[22px] bg-white p-4">
            <p className="text-[15px] leading-6 text-[#1d1d1f]">
              楼号：{site.unit}
              {site.areaSqm > 0 ? ` · ${site.areaSqm}㎡` : ""}
            </p>
            <p className="text-[15px] leading-6 text-[#1d1d1f]">进度：{site.stage}</p>
            {finished && site.startedOn ? <p className="text-[15px] leading-6 text-[#1d1d1f]">开工：{site.startedOn}</p> : null}
            {finished && site.finishedOn ? <p className="text-[15px] leading-6 text-[#1d1d1f]">完工：{site.finishedOn}</p> : null}
            {finished && site.days > 0 ? <p className="text-[15px] leading-6 text-[#1d1d1f]">完工天数：{site.days}</p> : null}
          </div>
          <div className="rounded-[22px] bg-white p-4">
            <h3 className="text-[13px] font-semibold text-[#6e6e73]">负责人</h3>
            <dl className="mt-2 space-y-2 text-[15px] text-[#1d1d1f]">
              <Person label="设计师" name={site.designer} />
              <Person label="项目经理" name={site.manager} />
              <Person label="质检" name={site.inspector} />
              {finished ? null : <Person label="材料员" name={site.material} />}
              {finished ? null : <Person label="设计组" name={site.designLead} />}
            </dl>
          </div>
        </div>
      </section>
    </div>
  );
  return createPortal(sheet, document.body);
}

function Person({ label, name }: { label: string; name: string }) {
  if (!name) return null;
  return (
    <div className="flex gap-3">
      <dt className="w-16 shrink-0 text-[#6e6e73]">{label}</dt>
      <dd>{name}</dd>
    </div>
  );
}

function openedCommunity(community: string | null) {
  if (!community) return false;
  return ACTIVE_SITES.some((site) => site.community === community) || COMPLETED_SITES.some((site) => site.community === community);
}

function isCompleted(site: ActiveSite | CompletedSite): site is CompletedSite {
  return site.stage === "完工" && "finishedOn" in site;
}

function groupCompleted(query: string) {
  const keyword = query.trim();
  const matched = new Map<string, { district: string; count: number }>();
  for (const site of COMPLETED_SITES) {
    const blob = [site.community, site.unit, site.district, site.designer, site.manager, site.inspector].join(" ");
    if (!blob.includes(keyword)) continue;
    const current = matched.get(site.community) ?? { district: site.district, count: 0 };
    current.count += 1;
    if (!current.district && site.district) current.district = site.district;
    matched.set(site.community, current);
  }
  return Array.from(matched.entries())
    .map(([community, item]) => ({ community, district: item.district, count: item.count }))
    .sort((a, b) => b.count - a.count || a.community.localeCompare(b.community, "zh"));
}

function peopleLine(site: ActiveSite) {
  return [
    site.designer ? `设计师 ${site.designer}` : "",
    site.manager ? `项目经理 ${site.manager}` : "",
    site.inspector ? `质检 ${site.inspector}` : "",
    site.material ? `材料员 ${site.material}` : "",
    site.designLead ? `设计组 ${site.designLead}` : ""
  ]
    .filter(Boolean)
    .join(" · ");
}

function groupSites(query: string) {
  const keyword = query.trim();
  const visible = ACTIVE_SITES.filter((site) => {
    if (!keyword) return true;
    return [site.community, site.unit, site.district, site.stage, site.designer, site.manager, site.inspector, site.material, site.designLead]
      .join(" ")
      .includes(keyword);
  });
  const byDistrict = new Map<string, Map<string, ActiveSite[]>>();
  for (const site of visible) {
    const district = site.district || "地区未填写";
    const communities = byDistrict.get(district) ?? new Map<string, ActiveSite[]>();
    const units = communities.get(site.community) ?? [];
    units.push(site);
    communities.set(site.community, units);
    byDistrict.set(district, communities);
  }
  return Array.from(byDistrict.entries())
    .map(([district, communities]) => ({
      district,
      communities: Array.from(communities.entries())
        .map(([community, units]) => ({ community, units }))
        .sort((a, b) => a.community.localeCompare(b.community, "zh"))
    }))
    .sort((a, b) => b.communities.length - a.communities.length);
}
