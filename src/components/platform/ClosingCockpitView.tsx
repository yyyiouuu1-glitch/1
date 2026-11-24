"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Calculator,
  CheckCircle2,
  Edit3,
  Eye,
  EyeOff,
  FileCheck2,
  Lock,
  MessageSquareQuote,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Trash2
} from "lucide-react";
import {
  PackageId,
  ProductPackage,
  calculatePackageQuote
} from "@/lib/packages";
import {
  ADDON_CATEGORIES,
  AddonCategory,
  EvidenceNode,
  EvidenceStage,
  OBJECTION_CARDS,
  QUOTE_ADDONS,
  QuoteAddon,
  STATUS_LABEL,
  makeEvidenceCode,
  makeShortHash,
  splitPoints,
  talkFor
} from "@/lib/platform";
import { Community, Lead, Material } from "@/lib/types";

const ADDONS_STORAGE_KEY = "yipin-custom-addons-v1";

type AddonFilter = "all" | "selected" | AddonCategory;

type Props = {
  leads: Lead[];
  communities: Community[];
  materials: Material[];
  packages: ProductPackage[];
  leadId: string | null;
  carryId: string | null;
  initialPackageId?: PackageId;
  employee: string;
  compact: boolean;
  hasEvidenceModule: boolean;
  onPickLead: (id: string) => void;
  onAddEvidence: (node: EvidenceNode) => void;
  onLeadStatus: (id: string, status: Lead["status"]) => void;
  onOpenEvidence: (leadId: string) => void;
  onOpenMaterial: (materialId: string) => void;
  onOpenPackageConfig: (id: PackageId) => void;
  onNotify: (msg: string) => void;
};

export default function ClosingCockpitView({
  leads,
  communities,
  materials,
  packages,
  leadId,
  carryId,
  initialPackageId,
  employee,
  compact,
  hasEvidenceModule,
  onPickLead,
  onAddEvidence,
  onLeadStatus,
  onOpenEvidence,
  onOpenMaterial,
  onOpenPackageConfig,
  onNotify
}: Props) {
  const lead = leads.find((item) => item.id === leadId) ?? leads[0] ?? null;
  const community = communities.find((item) => item.name === lead?.community_name);
  const carried =
    materials.find((item) => item.id === carryId) ||
    materials.find((item) => item.community_name === lead?.community_name) ||
    materials[0];

  const [clientMode, setClientMode] = useState(false);
  const [pkgId, setPkgId] = useState<PackageId>(initialPackageId || "zunguijia");
  const [area, setArea] = useState<number>(lead?.area_sqm || 105);
  const [extraBaths, setExtraBaths] = useState<number>(1);
  const [extraDoors, setExtraDoors] = useState<number>(1);

  const [addonsHydrated, setAddonsHydrated] = useState(false);
  const [addons, setAddons] = useState<QuoteAddon[]>(QUOTE_ADDONS);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([
    "site-protect",
    "ceiling-eyelid",
    "polyurea-grout"
  ]);
  const [addonQtys, setAddonQtys] = useState<Record<string, number>>(() =>
    Object.fromEntries(QUOTE_ADDONS.map((a) => [a.id, a.defaultQty]))
  );
  const [addonFilter, setAddonFilter] = useState<AddonFilter>("all");
  const [manageAddons, setManageAddons] = useState(false);
  const [addingAddon, setAddingAddon] = useState(false);
  const [newAddonLabel, setNewAddonLabel] = useState("");
  const [newAddonCategory, setNewAddonCategory] = useState<AddonCategory>("拆改土建");
  const [newAddonUnit, setNewAddonUnit] = useState("㎡");
  const [newAddonPrice, setNewAddonPrice] = useState("200");
  const [newAddonQty, setNewAddonQty] = useState("10");
  const [newAddonNote, setNewAddonNote] = useState("");

  const [activeObj, setActiveObj] = useState<string>(OBJECTION_CARDS[0].id);

  const [stage, setStage] = useState<EvidenceStage>("方案报价");
  const [said, setSaid] = useState("");
  const [confirmed, setConfirmed] = useState(true);
  const [savedNotice, setSavedNotice] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ADDONS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as QuoteAddon[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAddons(parsed);
          setAddonQtys((prev) => {
            const next = { ...prev };
            parsed.forEach((a) => {
              if (next[a.id] === undefined) next[a.id] = a.defaultQty;
            });
            return next;
          });
        }
      }
    } catch {
      /* keep defaults */
    }
    setAddonsHydrated(true);
  }, []);

  useEffect(() => {
    if (!addonsHydrated) return;
    localStorage.setItem(ADDONS_STORAGE_KEY, JSON.stringify(addons));
  }, [addonsHydrated, addons]);

  useEffect(() => {
    if (initialPackageId) setPkgId(initialPackageId);
  }, [initialPackageId]);

  useEffect(() => {
    if (lead?.area_sqm) {
      setArea(lead.area_sqm);
      setExtraBaths(lead.area_sqm >= 100 ? 1 : 0);
      setExtraDoors(lead.area_sqm >= 115 ? 2 : lead.area_sqm >= 90 ? 1 : 0);
    }
  }, [lead?.id, lead?.area_sqm]);

  const activePkg = packages.find((p) => p.id === pkgId) ?? packages[0];
  const talk = talkFor(community);
  const points = community ? splitPoints(community.pain_points) : [];

  const getQty = (addon: QuoteAddon) => addonQtys[addon.id] ?? addon.defaultQty;

  const selectedAddonItems = useMemo(
    () => addons.filter((a) => selectedAddons.includes(a.id)),
    [addons, selectedAddons]
  );

  const addonsTotal = useMemo(
    () =>
      selectedAddonItems.reduce(
        (sum, item) => sum + Math.round(item.unitPrice * getQty(item)),
        0
      ),
    [selectedAddonItems, addonQtys]
  );

  const visibleAddons = useMemo(() => {
    if (addonFilter === "all") return addons;
    if (addonFilter === "selected") return selectedAddonItems;
    return addons.filter((a) => a.category === addonFilter);
  }, [addons, addonFilter, selectedAddonItems]);

  const quote = useMemo(
    () => calculatePackageQuote(activePkg, area, extraBaths, extraDoors, addonsTotal),
    [activePkg, area, extraBaths, extraDoors, addonsTotal]
  );

  function toggleAddon(id: string) {
    setSelectedAddons((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
    );
  }

  function updateAddonUnitPrice(id: string, price: number) {
    const safePrice = Math.max(0, Number.isFinite(price) ? price : 0);
    setAddons((current) =>
      current.map((a) => (a.id === id ? { ...a, unitPrice: safePrice } : a))
    );
  }

  function updateAddonField(
    id: string,
    patch: Partial<Pick<QuoteAddon, "label" | "unit" | "note" | "category">>
  ) {
    setAddons((current) =>
      current.map((a) => (a.id === id ? { ...a, ...patch } : a))
    );
  }

  function updateAddonQty(id: string, qty: number) {
    const safeQty = Math.max(0, Math.min(999, Number.isFinite(qty) ? qty : 0));
    setAddonQtys((current) => ({ ...current, [id]: safeQty }));
  }

  function deleteAddon(item: QuoteAddon) {
    setAddons((current) => current.filter((a) => a.id !== item.id));
    setSelectedAddons((current) => current.filter((x) => x !== item.id));
    onNotify(`已移除个性化项目「${item.label}」`);
  }

  function handleAddAddon(event: React.FormEvent) {
    event.preventDefault();
    if (!newAddonLabel.trim()) return;
    const price = Math.max(0, Number(newAddonPrice) || 0);
    const qty = Math.max(1, Number(newAddonQty) || 1);
    const created: QuoteAddon = {
      id: `custom-addon-${Date.now()}`,
      category: newAddonCategory,
      label: newAddonLabel.trim(),
      unit: newAddonUnit.trim() || "项",
      unitPrice: price,
      defaultQty: qty,
      note: newAddonNote.trim() || "自定义个性化增项"
    };
    setAddons((current) => [created, ...current]);
    setAddonQtys((current) => ({ ...current, [created.id]: qty }));
    setSelectedAddons((current) => [...current, created.id]);
    setNewAddonLabel("");
    setNewAddonNote("");
    setAddingAddon(false);
    onNotify(`已新增「${created.label}（¥${created.unitPrice}/${created.unit}）」`);
  }

  function resetAddons() {
    setAddons(QUOTE_ADDONS);
    setAddonQtys(Object.fromEntries(QUOTE_ADDONS.map((a) => [a.id, a.defaultQty])));
    setSelectedAddons(["site-protect", "ceiling-eyelid", "polyurea-grout"]);
    localStorage.removeItem(ADDONS_STORAGE_KEY);
    onNotify("已恢复默认个性化项目及参考单价");
  }

  function fillQuoteIntoPromise() {
    const extraText = [
      extraBaths > 0 ? `增卫 ${extraBaths} 个` : "",
      extraDoors > 0 ? `增房门 ${extraDoors} 樘` : ""
    ]
      .filter(Boolean)
      .join("、");

    const addonDetails = selectedAddonItems
      .map(
        (a) =>
          `${a.label}（¥${a.unitPrice}/${a.unit}×${getQty(a)}=¥${Math.round(
            a.unitPrice * getQty(a)
          ).toLocaleString()}）`
      )
      .join("；");

    setStage("方案报价");
    setSaid(
      `现场按「${activePkg.name} ${activePkg.version}」核算：外框面积 ${area}㎡${
        extraText ? `（含${extraText}）` : ""
      }，套餐小计 ¥${(quote.total - quote.addonsTotal).toLocaleString()}${
        addonDetails
          ? `；个性化选配 ¥${quote.addonsTotal.toLocaleString()}（${addonDetails}）`
          : ""
      }，预估闭口总价 ¥${quote.total.toLocaleString()}。`
    );
    onNotify("已将含个性化单价的精准报价带入右侧留痕框");
  }

  function submitPromise(event: React.FormEvent) {
    event.preventDefault();
    if (!lead || !said.trim()) return;
    const now = Date.now();
    const content = said.trim();
    onAddEvidence({
      id: `ev-${now}`,
      code: makeEvidenceCode(now),
      hash: makeShortHash(`${lead.id}|${content}|${now}`),
      stage,
      leadId: lead.id,
      customerName: lead.customer_name,
      at: new Date(now).toISOString(),
      title: `当场${stage}留痕`,
      said: content,
      by: employee,
      attachment: `${activePkg.name}报价与谈单记录`,
      photo: carried?.after_image,
      confirmed,
      confirmChannel: confirmed ? "现场口头已确认" : "待微信二次确认"
    });
    if (lead.status === "new") onLeadStatus(lead.id, "visited");
    setSaid("");
    setSavedNotice("已加密编号写入该客户证据链");
    onNotify(`已写入 ${lead.customer_name} 的数字证据链`);
    window.setTimeout(() => setSavedNotice(""), 3000);
  }

  return (
    <div className={compact ? "px-4 py-6 space-y-6" : "mx-auto max-w-[1140px] px-6 py-10 space-y-8"}>
      {/* Header + Client-Safe Presentation Switch */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1
            className={`font-semibold tracking-[-0.025em] text-[#1d1d1f] ${
              compact ? "text-[26px]" : "text-[38px] leading-[1.08]"
            }`}
          >
            赋能签单台
          </h1>
          <p className="mt-2 text-[15px] text-[#6e6e73]">
            {clientMode
              ? "已开启对客演示模式，已自动隐藏内部反击话术，可直接向业主展示配置单与透明算价。"
              : "已按「美丽家 79,800 起 / 尊贵家 99,800 起」最新计价公式配置，支持算价后一键留痕。"}
          </p>
        </div>

        <div className="liquid-glass-subtle inline-flex shrink-0 items-center rounded-full p-1">
          <button
            type="button"
            onClick={() => setClientMode(false)}
            className={`ios-press inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-[13px] font-medium ${
              !clientMode ? "bg-[#1d1d1f] text-white" : "text-[#6e6e73]"
            }`}
          >
            <EyeOff className="h-3.5 w-3.5" />
            内部口径
          </button>
          <button
            type="button"
            onClick={() => {
              setClientMode(true);
              setManageAddons(false);
              setAddingAddon(false);
            }}
            className={`ios-press inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-[13px] font-medium ${
              clientMode ? "bg-[#007aff] text-white" : "text-[#6e6e73]"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            对客演示
          </button>
        </div>
      </div>

      {/* Customer Selector Strip */}
      <div className="no-scrollbar flex items-center gap-2.5 overflow-x-auto pb-1">
        {leads.map((item) => {
          const active = item.id === lead?.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onPickLead(item.id)}
              className={`ios-press shrink-0 rounded-2xl px-4 py-3 text-left ${
                active
                  ? "bg-[#1d1d1f] text-white"
                  : "liquid-glass-subtle text-[#1d1d1f]"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-semibold">{item.customer_name}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] ${
                    active ? "bg-white/15 text-white/90" : "bg-black/[0.05] text-[#6e6e73]"
                  }`}
                >
                  {STATUS_LABEL[item.status]}
                </span>
              </div>
              <p className={`mt-1 text-[12px] ${active ? "text-white/75" : "text-[#6e6e73]"}`}>
                {item.community_name} · {item.area_sqm}㎡ · {item.target_style}
              </p>
            </button>
          );
        })}
      </div>

      {lead && (
        <div className={`grid gap-6 ${compact ? "grid-cols-1" : "lg:grid-cols-12"}`}>
          {/* Left Column: Official Package Quote Calculator + Case */}
          <div className={compact ? "space-y-6" : "space-y-6 lg:col-span-7"}>
            {/* Official 2-Package Exact Quote Calculator */}
            <section className="liquid-glass-subtle rounded-[28px] p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-[#007aff]" />
                  <h2 className="text-[18px] font-semibold text-[#1d1d1f]">
                    官方配置单精准报价器
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenPackageConfig(activePkg.id)}
                  className="text-[12px] font-medium text-[#007aff] hover:underline"
                >
                  查看{activePkg.name}完整材料清单 ({activePkg.version}) ›
                </button>
              </div>

              {/* 2 Official Packages Selector */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                {packages.map((p) => {
                  const active = p.id === activePkg.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPkgId(p.id)}
                      className={`ios-press rounded-[20px] p-4 text-left ${
                        active
                          ? "bg-[#1d1d1f] text-white"
                          : "bg-white text-[#1d1d1f] ring-1 ring-black/[0.06]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[16px] font-semibold">{p.name}</span>
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: p.accent }}
                        />
                      </div>
                      <p className="mt-1 text-[20px] font-semibold tabular-nums">
                        ¥{p.basePrice.toLocaleString()}
                        <span
                          className={`ml-1 text-[12px] font-normal ${
                            active ? "text-white/70" : "text-[#6e6e73]"
                          }`}
                        >
                          起
                        </span>
                      </p>
                      <p
                        className={`mt-1 text-[11px] ${
                          active ? "text-white/70" : "text-[#6e6e73]"
                        }`}
                      >
                        {p.baseAreaLabel} · 超出 +¥{p.overSqmDelta}/㎡
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Area + Extra Bath + Extra Door Controls */}
              <div className={`mt-4 grid gap-3 ${compact ? "grid-cols-1" : "sm:grid-cols-3"}`}>
                <div className="rounded-2xl bg-white p-3.5">
                  <span className="block text-[11px] font-medium text-[#6e6e73]">
                    外框建筑面积（㎡）
                  </span>
                  <div className="mt-2 flex items-center justify-between">
                    <input
                      type="number"
                      min={45}
                      max={300}
                      value={area}
                      onChange={(e) => setArea(Math.max(45, Number(e.target.value) || 45))}
                      className="w-20 text-[20px] font-semibold text-[#1d1d1f] tabular-nums focus:outline-none"
                    />
                    <span className="text-[12px] text-[#6e6e73]">㎡</span>
                  </div>
                </div>

                <StepperBox
                  label={`增加卫生间（+¥${activePkg.extraBathPrice.toLocaleString()}/个）`}
                  value={extraBaths}
                  unit="个"
                  onChange={setExtraBaths}
                />

                <StepperBox
                  label={`增加房间门（+¥${activePkg.extraDoorPrice.toLocaleString()}/樘）`}
                  value={extraDoors}
                  unit="樘"
                  onChange={setExtraDoors}
                />
              </div>

              {/* Customizable Personalization Projects */}
              <div className="mt-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-[13px] font-semibold text-[#1d1d1f]">
                      常见个性化项目（支持直接改单价与工程量）
                    </p>
                    <p className="text-[11.5px] text-[#6e6e73]">
                      已选 {selectedAddonItems.length} 项 · 个性化小计{" "}
                      <span className="font-semibold text-[#007aff] tabular-nums">
                        +¥{addonsTotal.toLocaleString()}
                      </span>
                    </p>
                  </div>

                  {!clientMode && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setAddingAddon((v) => !v);
                          setManageAddons(true);
                        }}
                        className="ios-press inline-flex h-8 items-center gap-1 rounded-full bg-[#1d1d1f] px-3 text-[11.5px] font-medium text-white"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        新增项目
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setManageAddons((v) => !v);
                          setAddingAddon(false);
                        }}
                        className={`ios-press inline-flex h-8 items-center gap-1 rounded-full px-3 text-[11.5px] font-medium ${
                          manageAddons
                            ? "bg-[#007aff] text-white"
                            : "bg-white text-[#1d1d1f] ring-1 ring-black/[0.06]"
                        }`}
                      >
                        <Edit3 className="h-3 w-3" />
                        {manageAddons ? "完成管理" : "管理清单"}
                      </button>
                    </div>
                  )}
                </div>

                {/* Category Filter Pills */}
                <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-0.5">
                  {(
                    [
                      ["all", `全部 (${addons.length})`],
                      ["selected", `已选 (${selectedAddonItems.length})`],
                      ...ADDON_CATEGORIES.map((c) => [c, c] as const)
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setAddonFilter(id)}
                      className={`ios-press h-7 shrink-0 rounded-full px-3 text-[11.5px] font-medium ${
                        addonFilter === id
                          ? "bg-[#1d1d1f] text-white"
                          : "bg-white text-[#6e6e73] hover:text-[#1d1d1f]"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* Manage Banner */}
                {manageAddons && !clientMode && (
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-[#007aff]/10 px-3.5 py-2.5 text-[12px] text-[#0055b3]">
                    <span>
                      单价与名称修改后自动保存在本地；随时可新增自定义项或恢复默认。
                    </span>
                    <button
                      type="button"
                      onClick={resetAddons}
                      className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-[#1d1d1f]"
                    >
                      <RotateCcw className="h-3 w-3" />
                      恢复默认单价
                    </button>
                  </div>
                )}

                {/* Add New Custom Personalization Project Form */}
                {addingAddon && !clientMode && (
                  <form
                    onSubmit={handleAddAddon}
                    className="animate-ios-sheet space-y-2.5 rounded-2xl bg-white p-4 ring-1 ring-[#007aff]/25"
                  >
                    <p className="text-[12.5px] font-semibold text-[#1d1d1f]">
                      新增个性化项目（自动加入报价单并保存）
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <input
                        value={newAddonLabel}
                        onChange={(e) => setNewAddonLabel(e.target.value)}
                        placeholder="项目名称（如：阳台电动晾衣架预埋）"
                        className="h-9 rounded-xl bg-[#f2f2f7] px-3 text-[12.5px]"
                      />
                      <select
                        value={newAddonCategory}
                        onChange={(e) => setNewAddonCategory(e.target.value as AddonCategory)}
                        className="h-9 rounded-xl bg-[#f2f2f7] px-3 text-[12.5px]"
                      >
                        {ADDON_CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="number"
                        min={0}
                        value={newAddonPrice}
                        onChange={(e) => setNewAddonPrice(e.target.value)}
                        placeholder="单价(元)"
                        className="h-9 rounded-xl bg-[#f2f2f7] px-3 text-[12.5px] tabular-nums"
                      />
                      <input
                        value={newAddonUnit}
                        onChange={(e) => setNewAddonUnit(e.target.value)}
                        placeholder="单位(㎡/米/项)"
                        className="h-9 rounded-xl bg-[#f2f2f7] px-3 text-[12.5px]"
                      />
                      <input
                        type="number"
                        min={1}
                        value={newAddonQty}
                        onChange={(e) => setNewAddonQty(e.target.value)}
                        placeholder="默认数量"
                        className="h-9 rounded-xl bg-[#f2f2f7] px-3 text-[12.5px] tabular-nums"
                      />
                    </div>
                    <input
                      value={newAddonNote}
                      onChange={(e) => setNewAddonNote(e.target.value)}
                      placeholder="工艺/计价备注（选填）"
                      className="h-9 w-full rounded-xl bg-[#f2f2f7] px-3 text-[12.5px]"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setAddingAddon(false)}
                        className="h-8 rounded-full px-3 text-[12px] text-[#6e6e73]"
                      >
                        取消
                      </button>
                      <button
                        type="submit"
                        disabled={!newAddonLabel.trim()}
                        className="h-8 rounded-full bg-[#007aff] px-4 text-[12px] font-medium text-white disabled:opacity-40"
                      >
                        添加并勾选
                      </button>
                    </div>
                  </form>
                )}

                {/* Addons List */}
                <div className="max-h-[380px] space-y-2 overflow-y-auto overscroll-contain pr-0.5">
                  {visibleAddons.map((addon) => {
                    const checked = selectedAddons.includes(addon.id);
                    const qty = getQty(addon);
                    const lineTotal = Math.round(addon.unitPrice * qty);

                    return (
                      <div
                        key={addon.id}
                        className={`rounded-2xl bg-white p-3.5 transition-colors ${
                          checked
                            ? "ring-1 ring-[#007aff]/50 shadow-xs"
                            : "ring-1 ring-black/[0.05]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => toggleAddon(addon.id)}
                            className="flex min-w-0 flex-1 items-start gap-2.5 text-left"
                          >
                            <span
                              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                                checked
                                  ? "border-[#007aff] bg-[#007aff] text-white"
                                  : "border-black/20 bg-white"
                              }`}
                            >
                              {checked && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                            </span>
                            <span className="min-w-0">
                              <span className="flex flex-wrap items-center gap-1.5">
                                <span className="text-[13.5px] font-semibold text-[#1d1d1f]">
                                  {addon.label}
                                </span>
                                <span className="rounded-full bg-[#f2f2f7] px-2 py-0.5 text-[10px] font-medium text-[#6e6e73]">
                                  {addon.category}
                                </span>
                              </span>
                              <span className="mt-0.5 block text-[11.5px] text-[#6e6e73]">
                                {addon.note}
                              </span>
                            </span>
                          </button>

                          <div className="flex shrink-0 items-center gap-1.5">
                            <span
                              className={`text-[14px] font-semibold tabular-nums ${
                                checked ? "text-[#007aff]" : "text-[#8e8e93]"
                              }`}
                            >
                              +¥{lineTotal.toLocaleString()}
                            </span>
                            {manageAddons && !clientMode && (
                              <button
                                type="button"
                                aria-label={`删除 ${addon.label}`}
                                onClick={() => deleteAddon(addon)}
                                className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ff3b30]/10 text-[#ff3b30]"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Inline Editable Unit Price & Quantity Controls */}
                        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-black/[0.05] pt-2.5">
                          <div className="flex items-center gap-1.5 text-[12px]">
                            <span className="text-[#6e6e73]">单价</span>
                            {!clientMode ? (
                              <label className="inline-flex items-center rounded-lg bg-[#f2f2f7] px-2 py-1 ring-1 ring-transparent focus-within:bg-white focus-within:ring-[#007aff]">
                                <span className="text-[#6e6e73]">¥</span>
                                <input
                                  type="number"
                                  min={0}
                                  step={1}
                                  aria-label={`${addon.label} 单价`}
                                  value={addon.unitPrice}
                                  onChange={(e) =>
                                    updateAddonUnitPrice(addon.id, Number(e.target.value))
                                  }
                                  className="w-16 bg-transparent px-1 font-semibold text-[#1d1d1f] tabular-nums focus:outline-none"
                                />
                              </label>
                            ) : (
                              <span className="font-semibold text-[#1d1d1f] tabular-nums">
                                ¥{addon.unitPrice.toLocaleString()}
                              </span>
                            )}
                            <span className="text-[#6e6e73]">/</span>
                            {manageAddons && !clientMode ? (
                              <input
                                value={addon.unit}
                                aria-label={`${addon.label} 单位`}
                                onChange={(e) =>
                                  updateAddonField(addon.id, { unit: e.target.value })
                                }
                                className="w-10 rounded-lg bg-[#f2f2f7] px-1.5 py-1 text-center text-[12px] text-[#1d1d1f] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#007aff]"
                              />
                            ) : (
                              <span className="text-[#6e6e73]">{addon.unit}</span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 text-[12px]">
                            <span className="text-[#6e6e73]">数量</span>
                            <button
                              type="button"
                              aria-label="减少数量"
                              onClick={() => updateAddonQty(addon.id, Math.max(0, qty - 1))}
                              className="ios-press flex h-6 w-6 items-center justify-center rounded-full bg-[#f2f2f7] text-[#1d1d1f]"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <input
                              type="number"
                              min={0}
                              max={999}
                              aria-label={`${addon.label} 数量`}
                              value={qty}
                              onChange={(e) => updateAddonQty(addon.id, Number(e.target.value))}
                              className="w-12 rounded-lg bg-[#f2f2f7] py-0.5 text-center font-semibold text-[#1d1d1f] tabular-nums focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#007aff]"
                            />
                            <button
                              type="button"
                              aria-label="增加数量"
                              onClick={() => updateAddonQty(addon.id, qty + 1)}
                              className="ios-press flex h-6 w-6 items-center justify-center rounded-full bg-[#f2f2f7] text-[#1d1d1f]"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                            <span className="min-w-[18px] text-[#6e6e73]">{addon.unit}</span>
                          </div>
                        </div>

                        {manageAddons && !clientMode && (
                          <div className="mt-2 grid gap-1.5 border-t border-black/[0.05] pt-2 sm:grid-cols-2">
                            <input
                              value={addon.label}
                              onChange={(e) =>
                                updateAddonField(addon.id, { label: e.target.value })
                              }
                              placeholder="自定义项目名称"
                              className="h-8 rounded-lg bg-[#f2f2f7] px-2.5 text-[12px] text-[#1d1d1f]"
                            />
                            <input
                              value={addon.note}
                              onChange={(e) =>
                                updateAddonField(addon.id, { note: e.target.value })
                              }
                              placeholder="自定义说明"
                              className="h-8 rounded-lg bg-[#f2f2f7] px-2.5 text-[12px] text-[#6e6e73]"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {visibleAddons.length === 0 && (
                    <div className="rounded-2xl bg-white p-6 text-center text-[13px] text-[#8e8e93]">
                      当前分组暂无勾选项目
                    </div>
                  )}
                </div>
              </div>

              {/* Exact Official Result Breakdown */}
              <div className="mt-5 rounded-[22px] bg-[#1d1d1f] p-5 text-white">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-[12px] text-white/70">
                      {activePkg.name} · {quote.areaFormula}
                    </p>
                    <p className="mt-1 text-[32px] font-semibold tracking-[-0.025em] tabular-nums">
                      ¥{quote.total.toLocaleString()}
                    </p>
                  </div>
                  {!clientMode && (
                    <button
                      type="button"
                      onClick={fillQuoteIntoPromise}
                      className="ios-press inline-flex h-10 items-center gap-1.5 rounded-full bg-[#007aff] px-4 text-[13px] font-medium text-white"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      写入右侧证据链
                    </button>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-white/10 pt-3 text-[12px] text-white/70 tabular-nums">
                  <span>套餐基准 ¥{quote.basePrice.toLocaleString()}</span>
                  <span>
                    面积差 {quote.areaDelta >= 0 ? "+" : ""}¥{quote.areaDelta.toLocaleString()}
                  </span>
                  {quote.bathCost > 0 && <span>增卫 +¥{quote.bathCost.toLocaleString()}</span>}
                  {quote.doorCost > 0 && <span>增门 +¥{quote.doorCost.toLocaleString()}</span>}
                  {quote.addonsTotal > 0 && (
                    <span>
                      个性化 ({selectedAddonItems.length}项) +¥{quote.addonsTotal.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </section>

            {/* Attached Real Case Banner */}
            {carried && (
              <div className="overflow-hidden rounded-[28px] bg-[#1d1d1f] text-white">
                <div className="relative aspect-[16/9] w-full overflow-hidden">
                  <img
                    src={carried.after_image || carried.before_image}
                    alt={carried.title}
                    className="h-full w-full object-cover opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[12px] text-white/75">
                        本场配套同小区实景 · {carried.style}
                      </p>
                      <h2 className="mt-1 text-[20px] font-semibold leading-snug">
                        {carried.title}
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => onOpenMaterial(carried.id)}
                      className="ios-press shrink-0 rounded-full bg-white px-3.5 py-1.5 text-[12px] font-medium text-[#1d1d1f]"
                    >
                      展开对比图
                    </button>
                  </div>
                </div>
                {points.length > 0 && (
                  <div className="p-5">
                    <p className="text-[12px] font-medium text-white/60">
                      {lead.community_name} 户型痛点与优化解法
                    </p>
                    <ul className="mt-2.5 space-y-2">
                      {points.map((pt, i) => (
                        <li key={pt} className="flex gap-2.5 text-[14px] leading-6 text-white/90">
                          <span className="mt-0.5 text-[12px] text-white/50 tabular-nums">
                            0{i + 1}
                          </span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* 3 Structured Pillars */}
            <div className={`grid gap-3 ${compact ? "grid-cols-1" : "sm:grid-cols-3"}`}>
              {[
                { label: "闭口预算", text: talk.budget },
                { label: "直管工艺", text: talk.craft },
                { label: "交付排期", text: talk.schedule }
              ].map((item) => (
                <div key={item.label} className="liquid-glass-subtle rounded-[22px] p-4">
                  <p className="text-[12px] font-semibold text-[#007aff]">{item.label}</p>
                  <p className="mt-2 text-[13px] leading-6 text-[#1d1d1f]">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Internal Objection Scripts + Evidence Recorder */}
          <div className={compact ? "space-y-6" : "space-y-6 lg:col-span-5"}>
            {!clientMode ? (
              <section className="liquid-glass-subtle rounded-[26px] p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-[#1d1d1f]" />
                    <h2 className="text-[16px] font-semibold text-[#1d1d1f]">内部反击与异议应答</h2>
                  </div>
                  <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-medium text-[#6e6e73]">
                    仅内部可见
                  </span>
                </div>

                {community?.competitor_script && (
                  <p className="mt-3 rounded-2xl bg-white p-3.5 text-[13px] leading-6 text-[#1d1d1f]">
                    {community.competitor_script.replace(/^【内部反击话术】/, "")}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {OBJECTION_CARDS.map((card) => (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => setActiveObj(card.id)}
                      className={`ios-press h-8 rounded-full px-3 text-[12px] font-medium ${
                        activeObj === card.id
                          ? "bg-[#1d1d1f] text-white"
                          : "bg-white text-[#6e6e73] hover:text-[#1d1d1f]"
                      }`}
                    >
                      {card.topic}
                    </button>
                  ))}
                </div>

                {OBJECTION_CARDS.filter((c) => c.id === activeObj).map((card) => (
                  <div key={card.id} className="mt-3 rounded-2xl bg-white p-4">
                    <p className="flex items-center gap-1.5 text-[13px] font-semibold text-[#1d1d1f]">
                      <MessageSquareQuote className="h-4 w-4 text-[#007aff]" />
                      {card.question}
                    </p>
                    <p className="mt-2.5 text-[13px] leading-6 text-[#1d1d1f]">{card.reply}</p>
                    <p className="mt-3 rounded-xl bg-[#f2f2f7] px-3 py-2 text-[12px] text-[#6e6e73]">
                      配合动作：{card.proof}
                    </p>
                  </div>
                ))}
              </section>
            ) : (
              <section className="liquid-glass-subtle rounded-[26px] p-6">
                <ShieldCheck className="h-7 w-7 text-[#007aff]" />
                <h2 className="mt-3 text-[19px] font-semibold text-[#1d1d1f]">
                  壹品整装 · 五大售后保障
                </h2>
                <ul className="mt-4 space-y-2.5 text-[13px] leading-6 text-[#1d1d1f]">
                  <li className="rounded-2xl bg-white px-4 py-3">
                    <strong>超长质保（水电终保）：</strong>行业率先推出水电终保，隐蔽工程无后顾之忧。
                  </li>
                  <li className="rounded-2xl bg-white px-4 py-3">
                    <strong>延期必赔（¥100/天）：</strong>科学管控工期，超期一天按合同赔付 100 元。
                  </li>
                  <li className="rounded-2xl bg-white px-4 py-3">
                    <strong>保真环保 · 假一罚十：</strong>签订材料保真与环保协议，36 项验收不合格砸无赦。
                  </li>
                  <li className="rounded-2xl bg-white px-4 py-3">
                    <strong>无被动增项：</strong>一口价全包明细写入清单，所有沟通承诺可查可证。
                  </li>
                </ul>
              </section>
            )}

            {/* Promise -> Evidence Chain Form */}
            {!clientMode && (
              <form onSubmit={submitPromise} className="liquid-glass-subtle rounded-[26px] p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="h-4 w-4 text-[#007aff]" />
                    <h2 className="text-[16px] font-semibold text-[#1d1d1f]">离开前留痕 · 写入证据链</h2>
                  </div>
                  {hasEvidenceModule && (
                    <button
                      type="button"
                      onClick={() => onOpenEvidence(lead.id)}
                      className="text-[12px] font-medium text-[#007aff] hover:underline"
                    >
                      查看完整链 ›
                    </button>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {(["需求沟通", "现场量房", "方案报价", "合同签单"] as EvidenceStage[]).map(
                    (item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setStage(item)}
                        className={`ios-press h-7 rounded-full px-3 text-[12px] font-medium ${
                          stage === item
                            ? "bg-[#1d1d1f] text-white"
                            : "bg-white text-[#6e6e73] hover:text-[#1d1d1f]"
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )}
                </div>

                <textarea
                  value={said}
                  onChange={(event) => setSaid(event.target.value)}
                  rows={4}
                  placeholder="记下今天和业主敲定的配置版本、报价、赠品或避坑说明..."
                  className="mt-3 w-full resize-none rounded-2xl bg-white p-3.5 text-[14px] leading-6 text-[#1d1d1f] placeholder:text-[#8e8e93]"
                />

                <button
                  type="button"
                  role="switch"
                  aria-checked={confirmed}
                  onClick={() => setConfirmed((v) => !v)}
                  className="mt-3.5 flex items-center gap-2.5 text-[13px] font-medium text-[#1d1d1f]"
                >
                  <span
                    className={`relative inline-flex h-[26px] w-[44px] items-center rounded-full transition-colors ${
                      confirmed ? "bg-[#34c759]" : "bg-[#e5e5ea]"
                    }`}
                  >
                    <span
                      className={`inline-block h-[22px] w-[22px] rounded-full bg-white shadow-sm transition-transform duration-200 ${
                        confirmed ? "translate-x-[20px]" : "translate-x-[2px]"
                      }`}
                    />
                  </span>
                  业主已在现场口头确认以上内容
                </button>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <button
                    type="submit"
                    disabled={!said.trim()}
                    className="ios-press h-10 rounded-full bg-[#1d1d1f] px-5 text-[13px] font-medium text-white hover:bg-black/85 disabled:opacity-40"
                  >
                    编号写入证据链
                  </button>
                  {savedNotice && (
                    <span className="inline-flex items-center gap-1 text-[12px] font-medium text-[#1d8a4e]">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {savedNotice}
                    </span>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StepperBox({
  label,
  value,
  unit,
  onChange
}: {
  label: string;
  value: number;
  unit: string;
  onChange: (n: number) => void;
}) {
  return (
    <div className="rounded-2xl bg-white p-3.5">
      <span className="block truncate text-[11px] font-medium text-[#6e6e73]">{label}</span>
      <div className="mt-2 flex items-center justify-between">
        <button
          type="button"
          aria-label="减少"
          onClick={() => onChange(Math.max(0, value - 1))}
          className="ios-press flex h-7 w-7 items-center justify-center rounded-full bg-[#f2f2f7] text-[#1d1d1f]"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="text-[17px] font-semibold text-[#1d1d1f] tabular-nums">
          {value} {unit}
        </span>
        <button
          type="button"
          aria-label="增加"
          onClick={() => onChange(Math.min(6, value + 1))}
          className="ios-press flex h-7 w-7 items-center justify-center rounded-full bg-[#f2f2f7] text-[#1d1d1f]"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
