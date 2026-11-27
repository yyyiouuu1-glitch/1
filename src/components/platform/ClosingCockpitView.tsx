"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Calculator,
  Check,
  Clock,
  Copy,
  Edit3,
  FileText,
  History,
  Minus,
  Plus,
  Printer,
  RotateCcw,
  Save,
  Trash2,
  X
} from "lucide-react";
import {
  PackageId,
  PackageMaterialItem,
  ProductPackage,
  ROOM_KEYS,
  SHARED_AUX_MATERIALS,
  calculatePackageQuote
} from "@/lib/packages";
import {
  ADDON_CATEGORIES,
  AddonCategory,
  EvidenceNode,
  QUOTE_ADDONS,
  QuoteAddon,
  formatWhen
} from "@/lib/platform";
import { Community, Lead, Material } from "@/lib/types";

const ADDONS_STORAGE_KEY = "yipin-custom-addons-v1";
const QUOTE_RECORDS_STORAGE_KEY = "yipin-quote-records-v1";

type AddonFilter = "all" | "selected" | AddonCategory;

type QuoteRecordAddon = {
  id: string;
  category: AddonCategory;
  label: string;
  unit: string;
  unitPrice: number;
  qty: number;
  subtotal: number;
  note?: string;
};

type QuoteRecord = {
  id: string;
  createdAt: string;
  note: string;
  packageId: PackageId;
  packageName: string;
  packageVersion: string;
  areaSqm: number;
  extraBaths: number;
  extraDoors: number;
  basePrice: number;
  areaDelta: number;
  areaFormula: string;
  bathCost: number;
  doorCost: number;
  addonsTotal: number;
  total: number;
  addons: QuoteRecordAddon[];
  packageItems?: PackageMaterialItem[];
};

type Props = {
  leads?: Lead[];
  communities?: Community[];
  materials?: Material[];
  packages: ProductPackage[];
  leadId?: string | null;
  carryId?: string | null;
  initialPackageId?: PackageId;
  employee?: string;
  compact: boolean;
  hasEvidenceModule?: boolean;
  onPickLead?: (id: string) => void;
  onAddEvidence?: (node: EvidenceNode) => void;
  onLeadStatus?: (id: string, status: Lead["status"]) => void;
  onOpenEvidence?: (leadId: string) => void;
  onOpenMaterial?: (materialId: string) => void;
  onOpenPackageConfig: (id: PackageId) => void;
  onNotify: (msg: string) => void;
};

async function copyTextSafe(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fallback below */
  }
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

export default function ClosingCockpitView({
  packages,
  initialPackageId,
  compact,
  onOpenPackageConfig,
  onNotify
}: Props) {
  const [pkgId, setPkgId] = useState<PackageId>(initialPackageId || "zunguijia");
  const [area, setArea] = useState<number>(105);
  const [areaInput, setAreaInput] = useState<string>("105");
  const [extraBaths, setExtraBaths] = useState<number>(1);
  const [extraDoors, setExtraDoors] = useState<number>(1);
  const [quoteNote, setQuoteNote] = useState<string>("");

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

  const [recordsHydrated, setRecordsHydrated] = useState(false);
  const [records, setRecords] = useState<QuoteRecord[]>([]);
  const [recordsOpen, setRecordsOpen] = useState(false);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [viewingRecord, setViewingRecord] = useState<QuoteRecord | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);

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

    try {
      const savedRecords = localStorage.getItem(QUOTE_RECORDS_STORAGE_KEY);
      if (savedRecords) {
        const parsed = JSON.parse(savedRecords) as QuoteRecord[];
        if (Array.isArray(parsed)) setRecords(parsed);
      }
    } catch {
      /* keep empty */
    }
    setRecordsHydrated(true);
  }, []);

  useEffect(() => {
    if (!addonsHydrated) return;
    try {
      localStorage.setItem(ADDONS_STORAGE_KEY, JSON.stringify(addons));
    } catch {
      /* ignore storage errors in restricted environments */
    }
  }, [addonsHydrated, addons]);

  useEffect(() => {
    if (!recordsHydrated) return;
    try {
      localStorage.setItem(QUOTE_RECORDS_STORAGE_KEY, JSON.stringify(records));
    } catch {
      /* ignore storage errors in restricted environments */
    }
  }, [recordsHydrated, records]);

  useEffect(() => {
    if (initialPackageId) setPkgId(initialPackageId);
  }, [initialPackageId]);

  useEffect(() => {
    if (!recordsOpen && !viewingRecord && !quoteModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (viewingRecord) setViewingRecord(null);
        else if (quoteModalOpen) setQuoteModalOpen(false);
        else setRecordsOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [recordsOpen, viewingRecord, quoteModalOpen]);

  const activePkg = packages.find((p) => p.id === pkgId) ?? packages[0];

  const getQty = (addon: QuoteAddon) => addonQtys[addon.id] ?? addon.defaultQty;

  const selectedAddonItems = useMemo(
    () => addons.filter((a) => selectedAddons.includes(a.id)),
    [addons, selectedAddons]
  );

  const selectedAddonRecords: QuoteRecordAddon[] = useMemo(
    () =>
      selectedAddonItems.map((item) => {
        const qty = getQty(item);
        return {
          id: item.id,
          category: item.category,
          label: item.label,
          unit: item.unit,
          unitPrice: item.unitPrice,
          qty,
          subtotal: Math.round(item.unitPrice * qty),
          note: item.note
        };
      }),
    [selectedAddonItems, addonQtys]
  );

  const addonsTotal = useMemo(
    () => selectedAddonRecords.reduce((sum, item) => sum + item.subtotal, 0),
    [selectedAddonRecords]
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

  function handleAreaChange(raw: string) {
    setAreaInput(raw);
    const num = Number(raw);
    if (Number.isFinite(num) && num > 0) {
      setArea(Math.min(500, num));
    }
  }

  function handleAreaBlur() {
    const clamped = Math.max(45, Math.min(300, Number(areaInput) || 45));
    setArea(clamped);
    setAreaInput(String(clamped));
  }

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

  function formatFullQuoteText(params: {
    pkg: ProductPackage;
    items: PackageMaterialItem[];
    areaSqm: number;
    areaFormula: string;
    basePrice: number;
    areaDelta: number;
    extraBaths: number;
    bathCost: number;
    extraDoors: number;
    doorCost: number;
    addonsTotal: number;
    total: number;
    note?: string;
    addons: QuoteRecordAddon[];
  }) {
    const lines: string[] = [
      `【壹品整装 · 全案闭口报价单】`,
      params.note ? `方案备注：${params.note}` : "",
      `选择套餐：${params.pkg.name}（${params.pkg.version}）`,
      `外框面积：${params.areaSqm}㎡（${params.areaFormula}）`,
      `户型增项：增卫 ${params.extraBaths} 个 / 增房门 ${params.extraDoors} 樘`,
      ``,
      `一、套餐完整配置清单（${params.items.length}项主材 + ${SHARED_AUX_MATERIALS.length}大标配辅材）`
    ].filter((l) => l !== undefined);

    ROOM_KEYS.forEach((room) => {
      const roomItems = params.items.filter((i) => i.room === room);
      if (roomItems.length === 0) return;
      lines.push(`【${room}】`);
      roomItems.forEach((item) => {
        lines.push(`  · ${item.name}｜${item.brand}｜${item.spec}`);
      });
    });

    lines.push(`【全屋标配辅材】`);
    SHARED_AUX_MATERIALS.forEach((aux) => {
      lines.push(`  · ${aux.name}｜${aux.brand}`);
    });

    lines.push(``);
    lines.push(
      `二、个性化配置清单（共 ${params.addons.length} 项，小计 +¥${params.addonsTotal.toLocaleString()}）`
    );
    if (params.addons.length === 0) {
      lines.push(`  · 无个性化增项`);
    } else {
      params.addons.forEach((a, idx) => {
        lines.push(
          `  ${idx + 1}. [${a.category}] ${a.label}：¥${a.unitPrice.toLocaleString()}/${a.unit} × ${a.qty}${a.unit} = ¥${a.subtotal.toLocaleString()}`
        );
      });
    }

    lines.push(``);
    lines.push(`三、最终闭口报价汇总`);
    lines.push(`  · 套餐基准价：¥${params.basePrice.toLocaleString()}`);
    lines.push(
      `  · 面积增减：${params.areaDelta >= 0 ? "+" : ""}¥${params.areaDelta.toLocaleString()}`
    );
    if (params.bathCost > 0) {
      lines.push(`  · 增加卫生间（${params.extraBaths}个）：+¥${params.bathCost.toLocaleString()}`);
    }
    if (params.doorCost > 0) {
      lines.push(`  · 增加房间门（${params.extraDoors}樘）：+¥${params.doorCost.toLocaleString()}`);
    }
    lines.push(`  · 个性化配置小计：+¥${params.addonsTotal.toLocaleString()}`);
    lines.push(`——————————————`);
    lines.push(`最终闭口总价：¥${params.total.toLocaleString()}`);
    return lines.filter((line, idx) => !(line === "" && idx === 1)).join("\n");
  }

  function saveQuoteRecord() {
    const now = new Date();
    const record: QuoteRecord = {
      id: `qr-${now.getTime()}`,
      createdAt: now.toISOString(),
      note: quoteNote.trim(),
      packageId: activePkg.id,
      packageName: activePkg.name,
      packageVersion: activePkg.version,
      areaSqm: area,
      extraBaths,
      extraDoors,
      basePrice: quote.basePrice,
      areaDelta: quote.areaDelta,
      areaFormula: quote.areaFormula,
      bathCost: quote.bathCost,
      doorCost: quote.doorCost,
      addonsTotal: quote.addonsTotal,
      total: quote.total,
      addons: selectedAddonRecords,
      packageItems: activePkg.items
    };

    setRecords((current) => [record, ...current].slice(0, 50));
    setQuoteNote("");
    onNotify("已保存到右上角「报价记录」");
  }

  async function copyCurrentQuote() {
    const text = formatFullQuoteText({
      pkg: activePkg,
      items: activePkg.items,
      areaSqm: area,
      areaFormula: quote.areaFormula,
      basePrice: quote.basePrice,
      areaDelta: quote.areaDelta,
      extraBaths,
      bathCost: quote.bathCost,
      extraDoors,
      doorCost: quote.doorCost,
      addonsTotal: quote.addonsTotal,
      total: quote.total,
      note: quoteNote.trim(),
      addons: selectedAddonRecords
    });

    const ok = await copyTextSafe(text);
    if (ok) {
      setCopiedSummary(true);
      onNotify("已复制完整报价单（含配置明细），可直接发送");
      window.setTimeout(() => setCopiedSummary(false), 1800);
    } else {
      onNotify("复制失败，请手动选中复制");
    }
  }

  function loadRecordIntoCalculator(rec: QuoteRecord) {
    setPkgId(rec.packageId);
    setArea(rec.areaSqm);
    setAreaInput(String(rec.areaSqm));
    setExtraBaths(rec.extraBaths);
    setExtraDoors(rec.extraDoors);
    setQuoteNote(rec.note);

    const existingIds = new Set(addons.map((a) => a.id));
    const missing: QuoteAddon[] = [];
    const nextQtys: Record<string, number> = { ...addonQtys };
    const nextSelected: string[] = [];

    rec.addons.forEach((a) => {
      nextSelected.push(a.id);
      nextQtys[a.id] = a.qty;
      if (!existingIds.has(a.id)) {
        missing.push({
          id: a.id,
          category: a.category || "定制与升级",
          label: a.label,
          unit: a.unit,
          unitPrice: a.unitPrice,
          defaultQty: a.qty,
          note: a.note || "来自历史报价记录"
        });
      }
    });

    if (missing.length > 0) {
      setAddons((current) => [...missing, ...current]);
    }
    setAddonQtys(nextQtys);
    setSelectedAddons(nextSelected);
    setViewingRecord(null);
    setRecordsOpen(false);
    onNotify("已载入该条报价到计算器");
  }

  function deleteRecord(id: string) {
    setRecords((current) => current.filter((item) => item.id !== id));
    if (viewingRecord?.id === id) setViewingRecord(null);
    onNotify("已删除该条报价记录");
  }

  const viewingPkg = viewingRecord
    ? packages.find((p) => p.id === viewingRecord.packageId) ?? packages[0]
    : null;

  return (
    <div className={compact ? "space-y-8 px-5 py-8" : "mx-auto max-w-[1140px] space-y-10 px-6 py-14"}>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-[36rem] space-y-2.5">
          <h1
            className={`font-semibold tracking-[-0.03em] text-[#1d1d1f] ${
              compact ? "text-[34px] leading-[1.12]" : "text-[48px] leading-[1.05]"
            }`}
          >
            赋能签单台
          </h1>
          <p className="text-[16px] leading-7 text-[#6e6e73]">
            按美丽家、尊贵家官方配置快速核算闭口报价，一键弹出完整报价单。
          </p>
        </div>

        <button
          type="button"
          onClick={() => setRecordsOpen(true)}
          className="ios-press inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-white px-4 text-[13px] font-medium text-[#1d1d1f] ring-1 ring-black/[0.08] shadow-xs hover:bg-[#f5f5f7]"
        >
          <History className="h-4 w-4 text-[#007aff]" />
          <span>报价记录</span>
          {records.length > 0 && (
            <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#1d1d1f] px-1.5 text-[11px] font-semibold text-white tabular-nums">
              {records.length}
            </span>
          )}
        </button>
      </header>

      <div className={`grid gap-6 ${compact ? "grid-cols-1" : "lg:grid-cols-12"}`}>
        {/* Left Column: Official Package Quote Calculator */}
        <div className={compact ? "space-y-6" : "space-y-6 lg:col-span-8"}>
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
                编辑{activePkg.name}材料清单 ({activePkg.version}) ›
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
                    value={areaInput}
                    onChange={(e) => handleAreaChange(e.target.value)}
                    onBlur={handleAreaBlur}
                    className="w-24 text-[20px] font-semibold text-[#1d1d1f] tabular-nums focus:outline-none"
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
            <div className="mt-6 space-y-3">
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
              {manageAddons && (
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
              {addingAddon && (
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
              <div className="max-h-[420px] space-y-2 overflow-y-auto overscroll-contain pr-0.5">
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
                          {manageAddons && (
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
                          <span className="text-[#6e6e73]">/</span>
                          {manageAddons ? (
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

                      {manageAddons && (
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
          </section>
        </div>

        {/* Right Column: Sticky Live Quote Summary */}
        <div className={compact ? "space-y-4" : "lg:col-span-4"}>
          <div className={compact ? "" : "lg:sticky lg:top-20"}>
            <section className="rounded-[28px] bg-[#1d1d1f] p-6 text-white shadow-sm">
              <p className="text-[12px] text-white/65">
                {activePkg.name} ({activePkg.version}) · {area}㎡
              </p>
              <p className="mt-1.5 text-[36px] font-semibold tracking-[-0.03em] tabular-nums">
                ¥{quote.total.toLocaleString()}
              </p>
              <p className="mt-1 text-[12px] text-white/60">{quote.areaFormula}</p>

              {/* Price Breakdown */}
              <div className="mt-5 space-y-2.5 border-t border-white/10 pt-4 text-[13px] tabular-nums">
                <div className="flex items-center justify-between text-white/80">
                  <span>套餐基准价</span>
                  <span>¥{quote.basePrice.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-white/80">
                  <span>面积增减</span>
                  <span>
                    {quote.areaDelta >= 0 ? "+" : ""}¥{quote.areaDelta.toLocaleString()}
                  </span>
                </div>
                {quote.bathCost > 0 && (
                  <div className="flex items-center justify-between text-white/80">
                    <span>增加卫生间 ({extraBaths}个)</span>
                    <span>+¥{quote.bathCost.toLocaleString()}</span>
                  </div>
                )}
                {quote.doorCost > 0 && (
                  <div className="flex items-center justify-between text-white/80">
                    <span>增加房间门 ({extraDoors}樘)</span>
                    <span>+¥{quote.doorCost.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-white/80">
                  <span>个性化选配 ({selectedAddonRecords.length}项)</span>
                  <span>+¥{quote.addonsTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Optional short label for saving */}
              <div className="mt-5">
                <input
                  value={quoteNote}
                  onChange={(e) => setQuoteNote(e.target.value)}
                  placeholder="方案备注（选填，如：105㎡三房两卫）"
                  className="h-10 w-full rounded-xl bg-white/10 px-3.5 text-[13px] text-white placeholder:text-white/45 focus:bg-white/15 focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => setQuoteModalOpen(true)}
                className="ios-press mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#007aff] px-4 text-[13.5px] font-semibold text-white hover:bg-[#0066d6]"
              >
                <FileText className="h-4 w-4" />
                生成最终报价单
              </button>

              <div className="mt-2.5 grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={saveQuoteRecord}
                  className="ios-press inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-white/12 px-3 text-[12.5px] font-medium text-white hover:bg-white/20"
                >
                  <Save className="h-3.5 w-3.5" />
                  保存报价
                </button>
                <button
                  type="button"
                  onClick={copyCurrentQuote}
                  className="ios-press inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-white/12 px-3 text-[12.5px] font-medium text-white hover:bg-white/20"
                >
                  {copiedSummary ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-[#34c759]" />
                      已复制
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      复制报价单
                    </>
                  )}
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Live Final Quote Sheet Popup Modal */}
      {quoteModalOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-3 sm:p-6 backdrop-blur-[3px]"
            onClick={() => setQuoteModalOpen(false)}
          >
            <div
              className="animate-ios-sheet relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[28px] bg-[#f5f5f7] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <QuoteSheetDocument
                pkg={activePkg}
                packageItems={activePkg.items}
                areaSqm={area}
                extraBaths={extraBaths}
                extraDoors={extraDoors}
                basePrice={quote.basePrice}
                areaDelta={quote.areaDelta}
                areaFormula={quote.areaFormula}
                bathCost={quote.bathCost}
                doorCost={quote.doorCost}
                addonsTotal={quote.addonsTotal}
                total={quote.total}
                addons={selectedAddonRecords}
                note={quoteNote.trim()}
                compact={compact}
                onSave={saveQuoteRecord}
                onCopy={copyCurrentQuote}
                onClose={() => setQuoteModalOpen(false)}
                copied={copiedSummary}
              />
            </div>
          </div>,
          document.body
        )}

      {/* Quote Records Drawer */}
      {recordsOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/35 backdrop-blur-[2px]"
          onClick={() => setRecordsOpen(false)}
        >
          <div
            className="animate-ios-sheet flex h-full w-full max-w-md flex-col bg-[#f5f5f7] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-black/[0.06] bg-white px-5 py-4">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-[#007aff]" />
                <h2 className="text-[16px] font-semibold text-[#1d1d1f]">
                  报价记录 ({records.length})
                </h2>
              </div>
              <button
                type="button"
                aria-label="关闭报价记录"
                onClick={() => setRecordsOpen(false)}
                className="ios-press flex h-8 w-8 items-center justify-center rounded-full bg-[#f2f2f7] text-[#1d1d1f]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {records.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl bg-white px-6 py-14 text-center">
                  <Clock className="h-8 w-8 text-[#c7c7cc]" />
                  <p className="mt-3 text-[15px] font-medium text-[#1d1d1f]">暂无报价记录</p>
                  <p className="mt-1 text-[13px] text-[#8e8e93]">
                    在签单台算好报价后，点击「保存报价」即可在这里随时查看完整报价单或回填修改。
                  </p>
                </div>
              ) : (
                records.map((rec) => (
                  <div
                    key={rec.id}
                    className="rounded-2xl bg-white p-4 ring-1 ring-black/[0.06]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-[15px] font-semibold text-[#1d1d1f]">
                          {rec.note || `${rec.packageName} · ${rec.areaSqm}㎡`}
                        </p>
                        <p className="mt-0.5 text-[12px] text-[#6e6e73]">
                          {rec.packageName} · {rec.areaSqm}㎡
                          {rec.extraBaths > 0 ? ` · 增卫${rec.extraBaths}个` : ""}
                          {rec.extraDoors > 0 ? ` · 增门${rec.extraDoors}樘` : ""}
                        </p>
                      </div>
                      <p className="shrink-0 text-[18px] font-semibold text-[#1d1d1f] tabular-nums">
                        ¥{rec.total.toLocaleString()}
                      </p>
                    </div>

                    {rec.addons.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1">
                        {rec.addons.map((a) => (
                          <span
                            key={a.id}
                            className="rounded-full bg-[#f2f2f7] px-2 py-0.5 text-[11px] text-[#6e6e73]"
                          >
                            {a.label} ¥{a.subtotal.toLocaleString()}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-black/[0.05] pt-2.5">
                      <span className="text-[11px] text-[#8e8e93]">
                        {formatWhen(rec.createdAt)}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setViewingRecord(rec)}
                          className="ios-press rounded-full bg-[#007aff]/10 px-3 py-1 text-[11.5px] font-medium text-[#007aff]"
                        >
                          看报价单
                        </button>
                        <button
                          type="button"
                          onClick={() => loadRecordIntoCalculator(rec)}
                          className="ios-press rounded-full bg-[#1d1d1f] px-3 py-1 text-[11.5px] font-medium text-white"
                        >
                          载入修改
                        </button>
                        <button
                          type="button"
                          aria-label="删除记录"
                          onClick={() => deleteRecord(rec.id)}
                          className="ios-press flex h-7 w-7 items-center justify-center rounded-full bg-[#ff3b30]/10 text-[#ff3b30]"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Full Quote Sheet Modal for Saved Record */}
      {viewingRecord &&
        viewingPkg &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[75] flex items-center justify-center bg-black/50 p-3 sm:p-6 backdrop-blur-[3px]"
            onClick={() => setViewingRecord(null)}
          >
            <div
              className="animate-ios-sheet relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[28px] bg-[#f5f5f7] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <QuoteSheetDocument
                pkg={viewingPkg}
                packageItems={viewingRecord.packageItems || viewingPkg.items}
                areaSqm={viewingRecord.areaSqm}
                extraBaths={viewingRecord.extraBaths}
                extraDoors={viewingRecord.extraDoors}
                basePrice={viewingRecord.basePrice}
                areaDelta={viewingRecord.areaDelta}
                areaFormula={viewingRecord.areaFormula}
                bathCost={viewingRecord.bathCost}
                doorCost={viewingRecord.doorCost}
                addonsTotal={viewingRecord.addonsTotal}
                total={viewingRecord.total}
                addons={viewingRecord.addons}
                note={viewingRecord.note}
                createdAt={viewingRecord.createdAt}
                compact={compact}
                onLoad={() => loadRecordIntoCalculator(viewingRecord)}
                onClose={() => setViewingRecord(null)}
                onCopy={async () => {
                  const text = formatFullQuoteText({
                    pkg: viewingPkg,
                    items: viewingRecord.packageItems || viewingPkg.items,
                    areaSqm: viewingRecord.areaSqm,
                    areaFormula: viewingRecord.areaFormula,
                    basePrice: viewingRecord.basePrice,
                    areaDelta: viewingRecord.areaDelta,
                    extraBaths: viewingRecord.extraBaths,
                    bathCost: viewingRecord.bathCost,
                    extraDoors: viewingRecord.extraDoors,
                    doorCost: viewingRecord.doorCost,
                    addonsTotal: viewingRecord.addonsTotal,
                    total: viewingRecord.total,
                    note: viewingRecord.note,
                    addons: viewingRecord.addons
                  });
                  const ok = await copyTextSafe(text);
                  onNotify(ok ? "已复制该条完整报价单" : "复制失败");
                }}
              />
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

function QuoteSheetDocument({
  pkg,
  packageItems,
  areaSqm,
  extraBaths,
  extraDoors,
  basePrice,
  areaDelta,
  areaFormula,
  bathCost,
  doorCost,
  addonsTotal,
  total,
  addons,
  note,
  createdAt,
  compact,
  onSave,
  onLoad,
  onCopy,
  onClose,
  copied
}: {
  pkg: ProductPackage;
  packageItems: PackageMaterialItem[];
  areaSqm: number;
  extraBaths: number;
  extraDoors: number;
  basePrice: number;
  areaDelta: number;
  areaFormula: string;
  bathCost: number;
  doorCost: number;
  addonsTotal: number;
  total: number;
  addons: QuoteRecordAddon[];
  note?: string;
  createdAt?: string;
  compact: boolean;
  onSave?: () => void;
  onLoad?: () => void;
  onCopy: () => void;
  onClose?: () => void;
  copied?: boolean;
}) {
  const dateLabel = createdAt
    ? formatWhen(createdAt)
    : new Date().toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      });

  return (
    <section className="overflow-hidden rounded-[28px] bg-white">
      {/* Top Hero: Flat-Floor Living Room Rendering */}
      <div className="relative aspect-[16/9] w-full max-h-[340px] overflow-hidden bg-[#1d1d1f]">
        <img
          src="/home/hall-stone.jpg"
          alt="壹品整装 · 大平层客厅实景效果图"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/35" />

        {/* Top Bar Overlay */}
        <div className="absolute left-5 right-5 top-4 flex items-center justify-between gap-3 sm:left-8 sm:right-8 sm:top-5">
          <img
            src="/brand/yipin-logo-h-white.png"
            alt="壹品整装 YIPIN DECORATION"
            className="h-6 w-auto object-contain drop-shadow-sm sm:h-7"
          />
          {onClose && (
            <button
              type="button"
              aria-label="关闭报价单"
              onClick={onClose}
              className="ios-press flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md hover:bg-black/65"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Bottom Title & Total Overlay */}
        <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-end justify-between gap-4 sm:bottom-6 sm:left-8 sm:right-8">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-white"
                style={{ backgroundColor: pkg.accent }}
              >
                {pkg.name} · {pkg.version}
              </span>
              <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] text-white/90 backdrop-blur-sm">
                大平层全案实景参考
              </span>
            </div>
            <h2 className="mt-2 text-[24px] font-semibold tracking-[-0.02em] text-white sm:text-[28px]">
              全案闭口报价单
            </h2>
            <p className="mt-1 text-[12.5px] text-white/80">
              {note ? `方案备注：${note} · ` : ""}
              报价日期：{dateLabel}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-[11.5px] text-white/75">最终闭口总价</p>
            <p className="text-[30px] font-semibold leading-tight tracking-[-0.025em] text-white tabular-nums sm:text-[34px]">
              ¥{total.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Action Bar & Key Specs */}
      <div className="border-b border-black/[0.06] bg-[#fbfbfd] px-5 py-4 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-[12.5px] text-[#6e6e73]">
            <span className="rounded-full bg-white px-3 py-1 font-medium text-[#1d1d1f] ring-1 ring-black/[0.06]">
              {pkg.name}
            </span>
            <span className="rounded-full bg-white px-3 py-1 font-medium text-[#1d1d1f] ring-1 ring-black/[0.06] tabular-nums">
              {areaSqm} ㎡
            </span>
            <span className="rounded-full bg-white px-3 py-1 font-medium text-[#1d1d1f] ring-1 ring-black/[0.06]">
              {extraBaths > 0 || extraDoors > 0
                ? `${extraBaths > 0 ? `增卫${extraBaths}个` : ""}${
                    extraBaths > 0 && extraDoors > 0 ? " / " : ""
                  }${extraDoors > 0 ? `增门${extraDoors}樘` : ""}`
                : "标准户型"}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onLoad && (
              <button
                type="button"
                onClick={onLoad}
                className="ios-press inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-4 text-[12.5px] font-medium text-[#1d1d1f] ring-1 ring-black/[0.08] hover:bg-[#f5f5f7]"
              >
                载入计算器修改
              </button>
            )}
            {onSave && (
              <button
                type="button"
                onClick={onSave}
                className="ios-press inline-flex h-9 items-center gap-1.5 rounded-full bg-[#007aff] px-4 text-[12.5px] font-medium text-white hover:bg-[#0066d6]"
              >
                <Save className="h-3.5 w-3.5" />
                保存到记录
              </button>
            )}
            <button
              type="button"
              onClick={onCopy}
              className="ios-press inline-flex h-9 items-center gap-1.5 rounded-full bg-[#1d1d1f] px-4 text-[12.5px] font-medium text-white hover:bg-black/85"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[#34c759]" />
                  已复制完整报价
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  复制完整报价单
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="ios-press inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-3.5 text-[12.5px] font-medium text-[#1d1d1f] ring-1 ring-black/[0.08] hover:bg-[#f5f5f7]"
            >
              <Printer className="h-3.5 w-3.5" />
              打印
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-8 px-5 py-6 sm:px-8 sm:py-8">
        {/* Section 1: Complete Package Configuration */}
        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-[17px] font-semibold text-[#1d1d1f]">
              一、{pkg.name}完整配置清单
            </h3>
            <span className="text-[12px] text-[#6e6e73]">
              共 {packageItems.length} 项全屋主材 + {SHARED_AUX_MATERIALS.length} 大标配一线辅材
            </span>
          </div>

          <div className={`mt-4 grid gap-4 ${compact ? "grid-cols-1" : "md:grid-cols-2"}`}>
            {ROOM_KEYS.map((room) => {
              const roomItems = packageItems.filter((item) => item.room === room);
              if (roomItems.length === 0) return null;
              return (
                <div
                  key={room}
                  className="overflow-hidden rounded-2xl bg-[#f5f5f7]/70 ring-1 ring-black/[0.05]"
                >
                  <div className="flex items-center justify-between border-b border-black/[0.05] bg-[#f5f5f7] px-4 py-2.5">
                    <span className="text-[13.5px] font-semibold text-[#1d1d1f]">{room}</span>
                    <span className="text-[11.5px] text-[#6e6e73]">{roomItems.length} 项</span>
                  </div>
                  <div className="divide-y divide-black/[0.05]">
                    {roomItems.map((item) => (
                      <div key={item.id} className="px-4 py-2.5">
                        <div className="flex flex-wrap items-center justify-between gap-1.5">
                          <span className="text-[13px] font-semibold text-[#1d1d1f]">
                            {item.name}
                          </span>
                          <span className="text-[12px] font-medium text-[#007aff]">
                            {item.brand}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[11.5px] leading-5 text-[#6e6e73]">{item.spec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Unlimited Highlights */}
          {pkg.unlimitedItems.length > 0 && (
            <div className="mt-4 rounded-2xl bg-[#34c759]/[0.08] p-4">
              <p className="text-[12.5px] font-semibold text-[#1d8a4e]">套餐不限量主材承诺</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {pkg.unlimitedItems.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-white px-2.5 py-1 text-[11.5px] font-medium text-[#1d1d1f] ring-1 ring-[#34c759]/20"
                  >
                    ✓ {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Shared Aux Materials */}
          <div className="mt-4 overflow-hidden rounded-2xl bg-[#f5f5f7]/70 ring-1 ring-black/[0.05]">
            <div className="flex items-center justify-between border-b border-black/[0.05] bg-[#f5f5f7] px-4 py-2.5">
              <span className="text-[13.5px] font-semibold text-[#1d1d1f]">
                全屋标配一线辅材（隐蔽工程）
              </span>
              <span className="text-[11.5px] text-[#6e6e73]">
                {SHARED_AUX_MATERIALS.length} 项全含
              </span>
            </div>
            <div
              className={`grid divide-y divide-black/[0.05] ${
                compact ? "grid-cols-1" : "sm:grid-cols-2 sm:divide-y-0"
              }`}
            >
              {SHARED_AUX_MATERIALS.map((aux) => (
                <div
                  key={aux.id}
                  className="border-black/[0.05] px-4 py-2.5 sm:border-b sm:odd:border-r"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-semibold text-[#1d1d1f]">{aux.name}</span>
                    <span className="text-[12px] font-medium text-[#1d1d1f]/80">{aux.brand}</span>
                  </div>
                  <p className="mt-0.5 text-[11.5px] leading-5 text-[#6e6e73]">{aux.feature}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 2: Personalized Add-ons */}
        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-[17px] font-semibold text-[#1d1d1f]">二、个性化配置清单</h3>
            <span className="text-[13px] font-semibold text-[#007aff] tabular-nums">
              已选 {addons.length} 项 · 小计 +¥{addonsTotal.toLocaleString()}
            </span>
          </div>

          {addons.length === 0 ? (
            <div className="mt-3 rounded-2xl bg-[#f5f5f7] px-4 py-6 text-center text-[13px] text-[#8e8e93]">
              本次报价未勾选个性化增项，仅按官方标准套餐配置计价。
            </div>
          ) : (
            <div className="mt-3 overflow-hidden rounded-2xl ring-1 ring-black/[0.06]">
              <div className="divide-y divide-black/[0.05]">
                {addons.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-3 bg-white px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[12px] font-medium text-[#8e8e93] tabular-nums">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <span className="text-[13.5px] font-semibold text-[#1d1d1f]">
                          {item.label}
                        </span>
                        <span className="rounded-full bg-[#f2f2f7] px-2 py-0.5 text-[10.5px] text-[#6e6e73]">
                          {item.category}
                        </span>
                      </div>
                      {item.note && (
                        <p className="mt-0.5 pl-6 text-[11.5px] text-[#8e8e93]">{item.note}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-right tabular-nums">
                      <span className="text-[12.5px] text-[#6e6e73]">
                        ¥{item.unitPrice.toLocaleString()}/{item.unit} × {item.qty}
                        {item.unit}
                      </span>
                      <span className="min-w-[78px] text-[14px] font-semibold text-[#1d1d1f]">
                        ¥{item.subtotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between border-t border-black/[0.06] bg-[#f5f5f7] px-4 py-3 text-[13.5px]">
                <span className="font-medium text-[#1d1d1f]">个性化配置合计</span>
                <span className="font-semibold text-[#007aff] tabular-nums">
                  +¥{addonsTotal.toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Final Quote Breakdown & Total */}
        <div>
          <h3 className="text-[17px] font-semibold text-[#1d1d1f]">三、最终闭口报价汇总</h3>

          <div className="mt-3 overflow-hidden rounded-2xl bg-[#f5f5f7]/80 ring-1 ring-black/[0.06]">
            <div className="divide-y divide-black/[0.05] px-5 text-[13.5px] tabular-nums">
              <div className="flex items-center justify-between py-3">
                <span className="text-[#6e6e73]">
                  {pkg.name}基准价（{pkg.baseAreaLabel}）
                </span>
                <span className="font-medium text-[#1d1d1f]">¥{basePrice.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-[#6e6e73]">面积增减（{areaFormula}）</span>
                <span className="font-medium text-[#1d1d1f]">
                  {areaDelta >= 0 ? "+" : ""}¥{areaDelta.toLocaleString()}
                </span>
              </div>
              {bathCost > 0 && (
                <div className="flex items-center justify-between py-3">
                  <span className="text-[#6e6e73]">增加标准卫生间（{extraBaths} 个）</span>
                  <span className="font-medium text-[#1d1d1f]">+¥{bathCost.toLocaleString()}</span>
                </div>
              )}
              {doorCost > 0 && (
                <div className="flex items-center justify-between py-3">
                  <span className="text-[#6e6e73]">增加标准房间门（{extraDoors} 樘）</span>
                  <span className="font-medium text-[#1d1d1f]">+¥{doorCost.toLocaleString()}</span>
                </div>
              )}
              <div className="flex items-center justify-between py-3">
                <span className="text-[#6e6e73]">个性化配置小计（{addons.length} 项）</span>
                <span className="font-medium text-[#1d1d1f]">
                  +¥{addonsTotal.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#1d1d1f] px-5 py-4 text-white">
              <div>
                <p className="text-[12px] text-white/65">
                  套餐小计 ¥{(total - addonsTotal).toLocaleString()} + 个性化 ¥
                  {addonsTotal.toLocaleString()}
                </p>
                <p className="text-[15px] font-semibold">最终闭口总价</p>
              </div>
              <p className="text-[32px] font-semibold tracking-[-0.025em] tabular-nums">
                ¥{total.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Rules / Notes */}
          {pkg.rules.length > 0 && (
            <div className="mt-4 rounded-2xl bg-[#fbfbfd] p-4 ring-1 ring-black/[0.05]">
              <p className="text-[12px] font-semibold text-[#1d1d1f]">计价与闭口说明</p>
              <ul className="mt-2 space-y-1 text-[12px] leading-5 text-[#6e6e73]">
                {pkg.rules.map((rule, i) => (
                  <li key={rule}>
                    {i + 1}. {rule}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
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
