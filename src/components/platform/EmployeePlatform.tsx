"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeftRight,
  ArrowRight,
  ArrowUpRight,
  Award,
  Briefcase,
  Building2,
  Calculator,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  Copy,
  FileText,
  HardHat,
  Images,
  LayoutGrid,
  MapPin,
  Monitor,
  MoreHorizontal,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  Users,
  Wand2
} from "lucide-react";
import CommunityKnowledgeBase from "@/components/CommunityKnowledgeBase";
import LeadsDashboard from "@/components/LeadsDashboard";
import MultiChannelCopyStudio from "@/components/MultiChannelCopyStudio";
import SpaceTransformStudio from "@/components/SpaceTransformStudio";
import ClosingCockpitView from "@/components/platform/ClosingCockpitView";
import EvidenceChainView from "@/components/platform/EvidenceChainView";
import FrameworkDrawer from "@/components/platform/FrameworkDrawer";
import MaterialLibraryView from "@/components/platform/MaterialLibraryView";
import PackageConfigModal from "@/components/platform/PackageConfigModal";
import SiteShowcaseView from "@/components/platform/SiteShowcaseView";
import {
  INITIAL_PACKAGES,
  PackageId,
  ProductPackage
} from "@/lib/packages";
import {
  COMPANY_PROFILE,
  EvidenceNode,
  MATERIAL_TYPE_LABEL,
  MODULES,
  ModuleId,
  PRESETS,
  PresetId,
  SITE_BROADCASTS,
  ScreenId,
  ViewMode,
  matchPreset,
  moduleById,
  seedEvidence
} from "@/lib/platform";
import { Community, Lead, Material } from "@/lib/types";

const STORAGE_KEY = "yipin-employee-framework-v3";
const PACKAGES_STORAGE_KEY = "yipin-packages-v1028";

function formatDateTag(date: Date) {
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${m}-${d}`;
}

function nextVersionLabel(current: string, date: Date) {
  const md = `${date.getMonth() + 1}.${date.getDate()}`;
  const base = `v${md}`;
  if (!current.startsWith(base)) return base;
  const match = current.match(/-r(\d+)$/);
  const rev = match ? Number(match[1]) + 1 : 2;
  return `${base}-r${rev}`;
}

type Props = {
  communities: Community[];
  materials: Material[];
  leads: Lead[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
};

function useWideScreen() {
  const [wide, setWide] = useState(true);
  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const apply = () => setWide(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);
  return wide;
}

function screenLabel(id: ScreenId) {
  if (id === "today") return "首页";
  if (id === "more") return "更多";
  return moduleById(id).nav;
}

function ScreenIcon({ id, className }: { id: ScreenId; className?: string }) {
  const cls = className || "h-[18px] w-[18px]";
  switch (id) {
    case "today":
      return <Compass className={cls} />;
    case "library":
      return <Images className={cls} />;
    case "close":
      return <Briefcase className={cls} />;
    case "evidence":
      return <ShieldCheck className={cls} />;
    case "sites":
      return <HardHat className={cls} />;
    case "communities":
      return <Building2 className={cls} />;
    case "leads":
      return <Users className={cls} />;
    case "copy":
      return <FileText className={cls} />;
    case "space":
      return <Wand2 className={cls} />;
    default:
      return <LayoutGrid className={cls} />;
  }
}

export default function EmployeePlatform({
  communities,
  materials,
  leads,
  loading,
  error,
  onRefresh
}: Props) {
  const wide = useWideScreen();
  const [hydrated, setHydrated] = useState(false);
  const [preset, setPreset] = useState<PresetId>("field");
  const [enabled, setEnabled] = useState<ModuleId[]>(PRESETS[0].modules);
  const [view, setView] = useState<ViewMode>("desk");
  const [screen, setScreen] = useState<ScreenId>("today");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [materialId, setMaterialId] = useState<string | null>(null);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [carryId, setCarryId] = useState<string | null>(null);
  const [packages, setPackages] = useState<ProductPackage[]>(INITIAL_PACKAGES);
  const [selectedPackageId, setSelectedPackageId] = useState<PackageId>("zunguijia");
  const [packageModal, setPackageModal] = useState<{
    id: PackageId;
    tab?: "rooms" | "aux" | "rules" | "compare";
  } | null>(null);
  const [evidenceLeadId, setEvidenceLeadId] = useState<string | null>(null);
  const [evidenceTouched, setEvidenceTouched] = useState(false);
  const [evidence, setEvidence] = useState<EvidenceNode[]>([]);
  const [seeded, setSeeded] = useState(false);
  const [leadStatus, setLeadStatus] = useState<Record<string, Lead["status"]>>({});
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { enabled?: ModuleId[]; view?: ViewMode };
        if (saved.enabled?.length) {
          const valid = saved.enabled.filter((id) => MODULES.some((m) => m.id === id));
          if (valid.length) {
            setEnabled(valid);
            setPreset(matchPreset(valid));
          }
        }
        if (saved.view === "phone" || saved.view === "desk") setView(saved.view);
      }
      const savedPkgs = localStorage.getItem(PACKAGES_STORAGE_KEY);
      if (savedPkgs) {
        const parsed = JSON.parse(savedPkgs) as ProductPackage[];
        if (Array.isArray(parsed) && parsed.length === 2) {
          setPackages(parsed);
        }
      }
    } catch {
      /* keep defaults */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ preset, enabled, view }));
  }, [hydrated, preset, enabled, view]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(PACKAGES_STORAGE_KEY, JSON.stringify(packages));
  }, [hydrated, packages]);

  useEffect(() => {
    if (seeded || leads.length === 0) return;
    setEvidence(seedEvidence(leads));
    setSeeded(true);
  }, [leads, seeded]);

  const compact = !wide || view === "phone";
  const phonePreview = wide && view === "phone";

  const viewLeads = useMemo(
    () => leads.map((lead) => ({ ...lead, status: leadStatus[lead.id] ?? lead.status })),
    [leads, leadStatus]
  );

  const nextLead =
    viewLeads.find((lead) => lead.status === "new" || lead.status === "following") ??
    viewLeads[0];

  const firstLeadId = viewLeads[0]?.id;
  useEffect(() => {
    if (compact || evidenceTouched || evidenceLeadId || !firstLeadId) return;
    setEvidenceLeadId(firstLeadId);
  }, [compact, evidenceTouched, evidenceLeadId, firstLeadId]);

  useEffect(() => {
    if (screen === "today" || screen === "more") return;
    if (!enabled.includes(screen)) setScreen("today");
  }, [enabled, screen]);

  const tabs = useMemo(() => {
    const activeModules = MODULES.filter((item) => enabled.includes(item.id)).map(
      (item) => item.id
    );
    return ["today", ...activeModules] as ScreenId[];
  }, [enabled]);

  function notify(message: string) {
    setToast(message);
    window.clearTimeout((notify as unknown as { _t?: number })._t);
    (notify as unknown as { _t?: number })._t = window.setTimeout(() => {
      setToast(null);
    }, 2400);
  }

  function applyPreset(id: Exclude<PresetId, "custom">) {
    const target = PRESETS.find((item) => item.id === id)!;
    setPreset(id);
    setEnabled(target.modules);
    setScreen("today");
    notify(`已切换为「${target.label}」`);
  }

  function toggleModule(id: ModuleId) {
    setEnabled((current) => {
      if (current.includes(id) && current.length === 1) {
        notify("至少保留一个核心模块");
        return current;
      }
      const next = current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id];
      setPreset(matchPreset(next));
      return next;
    });
  }

  function openScreen(next: ScreenId) {
    setScreen(next);
    if (next !== "library") setMaterialId(null);
  }

  function toggleEvidenceConfirm(id: string) {
    setEvidence((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              confirmed: !item.confirmed,
              confirmChannel: !item.confirmed ? "顾问核验 · 业主已确认" : "待业主二次确认"
            }
          : item
      )
    );
    notify("已更新业主确认状态");
  }

  function handleUpdatePackage(updated: ProductPackage, changeSummary?: string) {
    const now = new Date();
    const dateLabel = formatDateTag(now);
    setPackages((current) =>
      current.map((pkg) => {
        if (pkg.id !== updated.id) return pkg;
        const version = nextVersionLabel(pkg.version, now);
        return {
          ...updated,
          version,
          updatedAt: dateLabel,
          changelog: changeSummary
            ? [
                {
                  id: `log-${now.getTime()}`,
                  at: dateLabel,
                  version,
                  by: employee,
                  note: changeSummary
                },
                ...pkg.changelog
              ]
            : pkg.changelog
        };
      })
    );
  }

  function handleResetPackages() {
    setPackages(INITIAL_PACKAGES);
    localStorage.removeItem(PACKAGES_STORAGE_KEY);
  }

  function openPackageQuote(pkg: ProductPackage) {
    setSelectedPackageId(pkg.id);
    setPackageModal(null);
    if (enabled.includes("close")) {
      if (!leadId && nextLead) setLeadId(nextLead.id);
      setScreen("close");
      notify(`已按「${pkg.name}」打开报价测算`);
    } else {
      setDrawerOpen(true);
      notify("开启「赋能签单台」即可使用精准报价器");
    }
  }

  const employee = (viewLeads[0]?.referrer_name || "林顾问").split("（")[0];

  const appSurface = (
    <AppViewport
      compact={compact}
      phonePreview={phonePreview}
      wide={wide}
      screen={screen}
      tabs={tabs}
      enabled={enabled}
      preset={preset}
      view={view}
      employee={employee}
      communities={communities}
      materials={materials}
      leads={viewLeads}
      packages={packages}
      loading={loading}
      error={error}
      nextLead={nextLead}
      materialId={materialId}
      leadId={leadId}
      carryId={carryId}
      selectedPackageId={selectedPackageId}
      evidence={evidence}
      evidenceLeadId={evidenceLeadId}
      onRefresh={onRefresh}
      onScreen={openScreen}
      onMaterial={setMaterialId}
      onLead={setLeadId}
      onCarry={(id) => {
        setCarryId(id);
        if (!leadId && nextLead) setLeadId(nextLead.id);
        setScreen("close");
        notify("案例已挂载至签单台");
      }}
      onOpenPackage={(id, tab) => setPackageModal({ id, tab })}
      onQuoteWithPackage={openPackageQuote}
      onEvidenceLead={(id) => {
        setEvidenceTouched(true);
        setEvidenceLeadId(id);
      }}
      onToggleEvidenceConfirm={toggleEvidenceConfirm}
      onAddEvidence={(node) => setEvidence((current) => [...current, node])}
      onLeadStatus={(id, status) => setLeadStatus((current) => ({ ...current, [id]: status }))}
      onPreset={applyPreset}
      onView={setView}
      onOpenDrawer={() => setDrawerOpen(true)}
      onNotify={notify}
    />
  );

  return (
    <div className="ios-canvas-bg min-h-screen text-[#1d1d1f]">
      {/* iOS Dynamic Island Toast */}
      {toast && (
        <div
          role="status"
          className="animate-ios-island liquid-glass-dark fixed left-1/2 top-4 z-[60] flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium text-white"
        >
          <CheckCircle2 className="h-4 w-4 text-[#30d158]" />
          <span>{toast}</span>
        </div>
      )}

      {/* Desktop Top Control Ribbon when in iPhone Mini-Program Preview */}
      {phonePreview ? (
        <div className="min-h-screen px-6 pb-10 pt-5">
          <div className="mx-auto mb-6 flex max-w-[1160px] flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="壹品整装" className="h-6 w-auto object-contain" />
              <span className="h-4 w-px bg-black/10" />
              <span className="text-[13px] font-medium text-[#6e6e73]">
                员工小程序真机预览 · iOS 液态玻璃交互
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="liquid-glass-subtle inline-flex rounded-full p-1">
                {PRESETS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => applyPreset(item.id)}
                    className={`ios-press h-8 rounded-full px-3.5 text-[12px] font-medium ${
                      preset === item.id ? "bg-[#1d1d1f] text-white" : "text-[#6e6e73]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="ios-press liquid-glass-subtle inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-[13px] font-medium text-[#1d1d1f]"
              >
                <SlidersHorizontal className="h-3.5 w-3.5 text-[#007aff]" />
                定制模块 ({enabled.length}/{MODULES.length})
              </button>

              <button
                type="button"
                onClick={() => setView("desk")}
                className="ios-press inline-flex h-10 items-center gap-1.5 rounded-full bg-[#1d1d1f] px-4 text-[13px] font-medium text-white"
              >
                <Monitor className="h-3.5 w-3.5" />
                切回电脑全屏
              </button>
            </div>
          </div>

          {/* Realistic iPhone Mini-Program Device Frame */}
          <div className="mx-auto w-[408px] rounded-[54px] bg-[#161618] p-[11px] shadow-[0_32px_80px_rgba(0,0,0,0.22)] ring-1 ring-white/15">
            <div className="relative flex h-[812px] flex-col overflow-hidden rounded-[44px] bg-[#f2f2f7]">
              {/* iOS Status Bar + Dynamic Island */}
              <div className="relative flex h-12 shrink-0 items-center justify-between bg-[#f2f2f7]/90 px-7 pt-2 text-[12px] font-semibold text-[#1d1d1f]">
                <span className="tabular-nums">16:54</span>
                <div className="h-[26px] w-[104px] rounded-full bg-black" aria-hidden />
                <div className="flex items-center gap-1.5 text-[11px] tabular-nums">
                  <span>5G</span>
                  <span className="inline-block h-2.5 w-5 rounded-[3px] border border-black/40 p-[1px]">
                    <span className="block h-full w-full rounded-[1.5px] bg-[#1d1d1f]" />
                  </span>
                </div>
              </div>

              {appSurface}
            </div>
          </div>
        </div>
      ) : (
        appSurface
      )}

      <FrameworkDrawer
        open={drawerOpen}
        preset={preset}
        enabled={enabled}
        view={view}
        showDeviceSwitch={wide}
        onClose={() => setDrawerOpen(false)}
        onPreset={applyPreset}
        onToggle={toggleModule}
        onView={setView}
      />

      {packageModal && (
        <PackageConfigModal
          packages={packages}
          activePackageId={packageModal.id}
          initialTab={packageModal.tab}
          onSelectPackage={(id) =>
            setPackageModal((prev) => (prev ? { ...prev, id } : { id }))
          }
          onUpdatePackage={handleUpdatePackage}
          onResetPackages={handleResetPackages}
          onQuoteWithPackage={openPackageQuote}
          onClose={() => setPackageModal(null)}
          onNotify={notify}
        />
      )}
    </div>
  );
}

function AppViewport(props: {
  compact: boolean;
  phonePreview: boolean;
  wide: boolean;
  screen: ScreenId;
  tabs: ScreenId[];
  enabled: ModuleId[];
  preset: PresetId;
  view: ViewMode;
  employee: string;
  communities: Community[];
  materials: Material[];
  leads: Lead[];
  packages: ProductPackage[];
  loading: boolean;
  error: string | null;
  nextLead?: Lead;
  materialId: string | null;
  leadId: string | null;
  carryId: string | null;
  selectedPackageId: PackageId;
  evidence: EvidenceNode[];
  evidenceLeadId: string | null;
  onRefresh: () => void;
  onScreen: (screen: ScreenId) => void;
  onMaterial: (id: string | null) => void;
  onLead: (id: string | null) => void;
  onCarry: (id: string) => void;
  onOpenPackage: (id: PackageId, tab?: "rooms" | "aux" | "rules" | "compare") => void;
  onQuoteWithPackage: (pkg: ProductPackage) => void;
  onEvidenceLead: (id: string | null) => void;
  onToggleEvidenceConfirm: (id: string) => void;
  onAddEvidence: (node: EvidenceNode) => void;
  onLeadStatus: (id: string, status: Lead["status"]) => void;
  onPreset: (id: Exclude<PresetId, "custom">) => void;
  onView: (view: ViewMode) => void;
  onOpenDrawer: () => void;
  onNotify: (msg: string) => void;
}) {
  const bottomTabs =
    props.tabs.length <= 4 ? props.tabs : ([...props.tabs.slice(0, 3), "more"] as ScreenId[]);
  const activeBottom = bottomTabs.includes(props.screen)
    ? props.screen
    : props.screen === "today"
      ? "today"
      : "more";

  return (
    <div
      className={
        props.phonePreview
          ? "relative flex min-h-0 flex-1 flex-col overflow-hidden"
          : "relative min-h-screen"
      }
    >
      {/* Top Bar: Desktop Liquid Glass Nav OR WeChat Mini-Program Header */}
      {!props.compact ? (
        <header className="sticky top-0 z-30">
          <div className="apple-glass border-b border-black/[0.06]">
            <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-6">
              <button
                type="button"
                onClick={() => props.onScreen("today")}
                className="ios-press flex items-center gap-2.5 text-left"
              >
                <img src="/logo.png" alt="壹品整装" className="h-6 w-auto object-contain" />
                <span className="h-4 w-px bg-black/10" />
                <span className="text-[13px] font-semibold tracking-[-0.01em] text-[#1d1d1f]">
                  员工赋能平台
                </span>
              </button>

              {/* Floating Liquid Glass Nav Pills */}
              <nav
                aria-label="主导航"
                className="no-scrollbar flex items-center gap-1 overflow-x-auto rounded-full bg-black/[0.045] p-1"
              >
                {props.tabs.map((id) => {
                  const active = props.screen === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      aria-current={active ? "page" : undefined}
                      onClick={() => props.onScreen(id)}
                      className={`ios-press inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium ${
                        active
                          ? "bg-white text-[#1d1d1f] shadow-sm"
                          : "text-[#6e6e73] hover:text-[#1d1d1f]"
                      }`}
                    >
                      <ScreenIcon id={id} className="h-3.5 w-3.5" />
                      {screenLabel(id)}
                    </button>
                  );
                })}
              </nav>

              {/* Right Controls: Phone/Desk + Module Picker */}
              <div className="flex items-center gap-2">
                <div className="inline-flex rounded-full bg-black/[0.045] p-1">
                  <button
                    type="button"
                    onClick={() => props.onView("desk")}
                    className="ios-press inline-flex h-7 items-center gap-1 rounded-full bg-white px-2.5 text-[12px] font-medium text-[#1d1d1f] shadow-sm"
                  >
                    <Monitor className="h-3.5 w-3.5" />
                    桌面
                  </button>
                  <button
                    type="button"
                    onClick={() => props.onView("phone")}
                    className="ios-press inline-flex h-7 items-center gap-1 rounded-full px-2.5 text-[12px] font-medium text-[#6e6e73] hover:text-[#1d1d1f]"
                  >
                    <Smartphone className="h-3.5 w-3.5" />
                    小程序
                  </button>
                </div>

                <button
                  type="button"
                  onClick={props.onOpenDrawer}
                  className="ios-press inline-flex h-9 items-center gap-1.5 rounded-full bg-[#1d1d1f] px-3.5 text-[12px] font-medium text-white hover:bg-black/85"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  定制框架
                  <span className="rounded-full bg-white/15 px-1.5 py-0.5 text-[10px] tabular-nums">
                    {props.enabled.length}/{MODULES.length}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Subtle Apple-style Framework Preset Sub-Ribbon */}
          <div className="border-b border-black/[0.05] bg-white/60 backdrop-blur-md">
            <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3 px-6 py-2 text-[12px]">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[#6e6e73]">快速体验平台版本：</span>
                {PRESETS.map((item) => {
                  const active = props.preset === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => props.onPreset(item.id)}
                      className={`ios-press rounded-full px-3 py-1 font-medium ${
                        active
                          ? "bg-[#007aff]/12 text-[#007aff]"
                          : "text-[#6e6e73] hover:bg-black/[0.04] hover:text-[#1d1d1f]"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
                {props.preset === "custom" && (
                  <span className="rounded-full bg-[#007aff]/12 px-3 py-1 font-medium text-[#007aff]">
                    已自定义 {props.enabled.length} 项
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={props.onOpenDrawer}
                className="inline-flex items-center gap-0.5 font-medium text-[#007aff] hover:underline"
              >
                勾选增删模块
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </header>
      ) : (
        /* WeChat Mini-Program Compact Header */
        <header className="apple-glass sticky top-0 z-30 flex h-12 shrink-0 items-center justify-between border-b border-black/[0.05] px-4">
          <button
            type="button"
            onClick={() => props.onScreen("today")}
            className="flex items-center gap-2"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#1d1d1f] text-[11px] font-bold text-white">
              壹
            </span>
            <span className="text-[15px] font-semibold tracking-[-0.01em] text-[#1d1d1f]">
              {screenLabel(props.screen)}
            </span>
          </button>

          {/* WeChat Mini-Program Authentic Capsule */}
          <div className="flex items-center rounded-full border border-black/[0.09] bg-white/80 px-2.5 py-1 shadow-xs">
            <button
              type="button"
              aria-label="定制模块"
              onClick={props.onOpenDrawer}
              className="ios-press flex items-center gap-1 pr-2.5 text-[#1d1d1f]"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            <span className="h-3.5 w-px bg-black/15" />
            <button
              type="button"
              aria-label="返回首页"
              onClick={() => props.onScreen("today")}
              className="ios-press pl-2.5 text-[#1d1d1f]"
            >
              <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border-[1.5px] border-[#1d1d1f]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#1d1d1f]" />
              </span>
            </button>
          </div>
        </header>
      )}

      {/* Main Scrollable Content */}
      <main
        key={props.screen}
        data-phone-scroll={props.phonePreview ? "true" : undefined}
        className={`animate-ios-view ${
          props.phonePreview
            ? "no-scrollbar min-h-0 flex-1 overflow-y-auto pb-28"
            : props.compact
              ? "pb-28"
              : "pb-16"
        }`}
      >
        {props.loading && props.leads.length === 0 && props.materials.length === 0 ? (
          <LoadingSkeleton />
        ) : props.error ? (
          <div className="mx-auto max-w-md px-6 py-20 text-center">
            <p className="text-[16px] font-medium text-[#1d1d1f]">{props.error}</p>
            <button
              type="button"
              onClick={props.onRefresh}
              className="ios-press mt-4 h-10 rounded-full bg-[#007aff] px-5 text-[14px] font-medium text-white"
            >
              重新加载
            </button>
          </div>
        ) : props.screen === "today" ? (
          <TodayShowcase {...props} />
        ) : props.screen === "more" ? (
          <MoreSheet {...props} />
        ) : props.screen === "library" ? (
          <MaterialLibraryView
            materials={props.materials}
            compact={props.compact}
            selectedId={props.materialId}
            canUseInClose={props.enabled.includes("close")}
            onSelect={props.onMaterial}
            onCarryToClose={props.onCarry}
            onNotify={props.onNotify}
          />
        ) : props.screen === "close" ? (
          <ClosingCockpitView
            leads={props.leads}
            communities={props.communities}
            materials={props.materials}
            packages={props.packages}
            leadId={props.leadId}
            carryId={props.carryId}
            initialPackageId={props.selectedPackageId}
            employee={props.employee}
            compact={props.compact}
            hasEvidenceModule={props.enabled.includes("evidence")}
            onPickLead={props.onLead}
            onAddEvidence={props.onAddEvidence}
            onLeadStatus={props.onLeadStatus}
            onOpenEvidence={(id) => {
              props.onEvidenceLead(id);
              props.onScreen("evidence");
            }}
            onOpenMaterial={(id) => {
              props.onMaterial(id);
              props.onScreen("library");
            }}
            onOpenPackageConfig={(id) => props.onOpenPackage(id, "rooms")}
            onNotify={props.onNotify}
          />
        ) : props.screen === "evidence" ? (
          <EvidenceChainView
            leads={props.leads}
            evidence={props.evidence}
            selectedLeadId={props.evidenceLeadId}
            employee={props.employee}
            compact={props.compact}
            onSelectLead={props.onEvidenceLead}
            onToggleConfirm={props.onToggleEvidenceConfirm}
            onAddEvidence={props.onAddEvidence}
            onNotify={props.onNotify}
          />
        ) : props.screen === "sites" ? (
          <SiteShowcaseView compact={props.compact} onNotify={props.onNotify} />
        ) : (
          <LegacyModuleView {...props} />
        )}
      </main>

      {/* iOS 26 Floating Liquid Glass Capsule TabBar (Phone & Mini-Program Mode) */}
      {props.compact && (
        <div
          className={`${
            props.phonePreview ? "absolute inset-x-0 bottom-0" : "fixed inset-x-0 bottom-0"
          } pointer-events-none z-30 bg-gradient-to-t from-[#f2f2f7] via-[#f2f2f7]/85 to-transparent px-4 pb-3 pt-7`}
        >
          <div className="pointer-events-auto mx-auto flex max-w-[368px] items-center gap-2">
            <nav
              aria-label="小程序底部导航"
              className="liquid-glass flex flex-1 items-center justify-between rounded-full p-1.5"
            >
              {bottomTabs.map((id) => {
                const active = activeBottom === id;
                return (
                  <button
                    key={id}
                    type="button"
                    aria-current={active ? "page" : undefined}
                    onClick={() => props.onScreen(id)}
                    className={`ios-press flex flex-1 flex-col items-center justify-center gap-0.5 rounded-full py-1.5 text-[10px] font-medium ${
                      active
                        ? "bg-[#1d1d1f]/10 text-[#007aff]"
                        : "text-[#6e6e73] hover:text-[#1d1d1f]"
                    }`}
                  >
                    <ScreenIcon id={id} className="h-[18px] w-[18px]" />
                    <span>{screenLabel(id)}</span>
                  </button>
                );
              })}
            </nav>

            {/* Independent Floating Liquid Glass Customizer Orb (iOS 26 style) */}
            <button
              type="button"
              aria-label="定制模块框架"
              onClick={props.onOpenDrawer}
              className="ios-press liquid-glass flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-full text-[#1d1d1f]"
            >
              <SlidersHorizontal className="h-5 w-5" />
            </button>
          </div>

          {props.phonePreview && (
            <div className="mx-auto mt-2.5 h-[4px] w-[124px] rounded-full bg-black/25" aria-hidden />
          )}
        </div>
      )}
    </div>
  );
}

function TodayShowcase(props: React.ComponentProps<typeof AppViewport>) {
  const [matFilter, setMatFilter] = useState<"all" | Material["type"]>("all");
  const [copiedIntro, setCopiedIntro] = useState(false);

  const lead = props.nextLead;
  const pendingEvidenceCount = props.evidence.filter((n) => !n.confirmed).length;

  const filteredMaterials = useMemo(() => {
    if (matFilter === "all") return props.materials;
    return props.materials.filter((m) => m.type === matFilter);
  }, [props.materials, matFilter]);

  async function copyCompanyIntro() {
    const text = `【${COMPANY_PROFILE.name} · 公司简介与核心整装配置】\n${COMPANY_PROFILE.slogan}\n${COMPANY_PROFILE.intro}\n核心整装配置：\n${props.packages
      .map(
        (p) =>
          `· ${p.name}（¥${p.basePrice.toLocaleString()} 起 · ${p.baseAreaLabel}）：${p.tagline}`
      )
      .join("\n")}\n服务覆盖：${COMPANY_PROFILE.showroom}`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* ignore */
    }
    setCopiedIntro(true);
    props.onNotify("公司简介与双套配置已复制，可直接发给业主");
    window.setTimeout(() => setCopiedIntro(false), 2000);
  }

  return (
    <div
      className={
        props.compact
          ? "px-4 py-5 space-y-6"
          : "mx-auto max-w-[1160px] px-6 py-10 space-y-12"
      }
    >
      {/* 1. Brand & Company Hero (Apple Showcase Style) */}
      <section className="overflow-hidden rounded-[32px] bg-[#141416] text-white shadow-[0_24px_64px_rgba(0,0,0,0.15)]">
        <div className="relative">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=85"
              alt="壹品整装实景美学空间"
              className="h-full w-full object-cover opacity-52"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(110deg, rgba(16,16,18,0.92) 0%, rgba(16,16,18,0.72) 55%, rgba(16,16,18,0.28) 100%)"
              }}
            />
          </div>

          <div className={`relative z-10 ${props.compact ? "p-6" : "px-12 pb-10 pt-12"}`}>
            <div className="liquid-glass-dark inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12px] font-medium text-white/90">
              <Award className="h-3.5 w-3.5 text-[#30d158]" />
              <span>
                {COMPANY_PROFILE.name} · {COMPANY_PROFILE.english}
              </span>
            </div>

            <h1
              className={`mt-5 text-balance font-semibold tracking-[-0.03em] text-white ${
                props.compact ? "text-[30px] leading-[1.12]" : "text-[52px] leading-[1.05]"
              }`}
            >
              {COMPANY_PROFILE.slogan}
            </h1>

            <p
              className={`mt-4 max-w-[40rem] text-pretty leading-7 text-white/80 ${
                props.compact ? "text-[14px]" : "text-[16px]"
              }`}
            >
              {COMPANY_PROFILE.intro}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById("home-products");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="ios-press inline-flex h-11 items-center gap-2 rounded-full bg-[#007aff] px-6 text-[14px] font-medium text-white shadow-lg shadow-[#007aff]/25 hover:bg-[#0071e3]"
              >
                查看整装产品
                <ArrowRight className="h-4 w-4" />
              </button>

              {props.enabled.includes("library") && (
                <button
                  type="button"
                  onClick={() => props.onScreen("library")}
                  className="ios-press liquid-glass-dark inline-flex h-11 items-center gap-1.5 rounded-full px-5 text-[14px] font-medium text-white"
                >
                  <Images className="h-4 w-4 text-white/80" />
                  公司素材库 ({props.materials.length})
                </button>
              )}

              <button
                type="button"
                onClick={copyCompanyIntro}
                className="ios-press inline-flex h-11 items-center gap-1.5 rounded-full px-4 text-[13px] font-medium text-white/80 hover:text-white"
              >
                {copiedIntro ? (
                  <Check className="h-4 w-4 text-[#30d158]" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copiedIntro ? "已复制简介" : "复制公司简介"}
              </button>
            </div>

            {/* 4 Brand Pillars Bar inside Hero */}
            <div
              className={`mt-8 grid gap-2.5 ${
                props.compact ? "grid-cols-2" : "grid-cols-4"
              }`}
            >
              {COMPANY_PROFILE.metrics.map((m) => (
                <div
                  key={m.label}
                  className="liquid-glass-dark rounded-[20px] px-4 py-3.5"
                >
                  <p className="text-[18px] font-semibold tracking-[-0.02em] text-white tabular-nums">
                    {m.value}
                  </p>
                  <p className="mt-0.5 text-[12px] text-white/70">{m.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Core Renovation Products Lineup — Official 美丽家 79,800起 & 尊贵家 99,800起 */}
      <section id="home-products" className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              className={`font-semibold tracking-[-0.025em] text-[#1d1d1f] ${
                props.compact ? "text-[22px]" : "text-[32px] leading-tight"
              }`}
            >
              核心整装产品
            </h2>
            <p className="mt-1 text-[14px] text-[#6e6e73]">
              两大主推整装配置，全套空间主材与严选辅材明细可查，支持随材料迭代随时在线更新。
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => props.onOpenPackage("zunguijia", "compare")}
              className="ios-press liquid-glass-subtle inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium text-[#1d1d1f]"
            >
              <ArrowLeftRight className="h-3.5 w-3.5 text-[#007aff]" />
              2 万元差价对比
            </button>
            <button
              type="button"
              onClick={() => props.onOpenPackage("meilijia", "rooms")}
              className="ios-press inline-flex h-9 items-center gap-1.5 rounded-full bg-[#1d1d1f] px-3.5 text-[13px] font-medium text-white"
            >
              <Clock className="h-3.5 w-3.5 text-[#30d158]" />
              更新材料清单
            </button>
          </div>
        </div>

        <div className={`grid gap-6 ${props.compact ? "grid-cols-1" : "md:grid-cols-2"}`}>
          {props.packages.map((pkg) => {
            const totalItems = pkg.items.length;
            return (
              <article
                key={pkg.id}
                className="liquid-glass-subtle ios-card-hover flex flex-col overflow-hidden rounded-[30px]"
              >
                <button
                  type="button"
                  onClick={() => props.onOpenPackage(pkg.id, "rooms")}
                  className="group relative aspect-[16/9] w-full overflow-hidden bg-[#1d1d1f] text-left"
                >
                  <img
                    src={pkg.cover}
                    alt={pkg.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute left-4 right-4 top-4 flex items-center justify-between gap-2">
                    <span className="liquid-glass-dark rounded-full px-3 py-1 text-[11px] font-medium text-white">
                      {pkg.badge}
                    </span>
                    <span className="liquid-glass-dark inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium text-white/90 tabular-nums">
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: "#30d158" }}
                      />
                      {pkg.version} · {totalItems}项主材
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between gap-3 text-white">
                    <div>
                      <p className="text-[12px] text-white/75">{pkg.baseAreaLabel}</p>
                      <h3 className="mt-0.5 text-[26px] font-semibold tracking-[-0.025em]">
                        {pkg.name}
                      </h3>
                    </div>
                    <div className="text-right">
                      <p className="text-[26px] font-semibold tracking-[-0.025em] tabular-nums">
                        ¥{pkg.basePrice.toLocaleString()}
                        <span className="ml-1 text-[13px] font-normal text-white/80">起</span>
                      </p>
                      <p className="text-[11px] text-white/75 tabular-nums">
                        超出 +¥{pkg.overSqmDelta}/㎡
                      </p>
                    </div>
                  </div>
                </button>

                <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
                  <div>
                    <p className="text-[14px] leading-6 text-[#6e6e73]">{pkg.tagline}</p>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {pkg.highlights.map((h) => (
                        <div
                          key={h}
                          className="flex items-start gap-2 rounded-2xl bg-white/85 px-3 py-2.5 text-[12.5px] leading-5 text-[#1d1d1f]"
                        >
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#34c759]" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {pkg.topBrands.map((brand) => (
                        <span
                          key={brand}
                          className="rounded-full bg-black/[0.045] px-2.5 py-1 text-[11px] font-medium text-[#6e6e73]"
                        >
                          {brand}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-2.5 border-t border-black/[0.06] pt-4">
                    <button
                      type="button"
                      onClick={() => props.onOpenPackage(pkg.id, "rooms")}
                      className="ios-press inline-flex items-center gap-1 text-[13.5px] font-medium text-[#007aff]"
                    >
                      查看完整配置与更新材料
                      <ArrowUpRight className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => props.onQuoteWithPackage(pkg)}
                      className="ios-press rounded-full bg-[#1d1d1f] px-4 py-2 text-[12.5px] font-medium text-white hover:bg-black/85"
                    >
                      按此精准算价
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* 3. Company Materials Showcase (Primary Visual Asset Library) */}
      {props.enabled.includes("library") && (
        <section className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2
                className={`font-semibold tracking-[-0.025em] text-[#1d1d1f] ${
                  props.compact ? "text-[22px]" : "text-[32px] leading-tight"
                }`}
              >
                公司实景素材
              </h2>
              <p className="mt-1 text-[14px] text-[#6e6e73]">
                同小区完工实拍、改造前后对比与活动海报，点开即可拖动对比或一键转发。
              </p>
            </div>

            <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-0.5">
              {(
                [
                  ["all", "全部"],
                  ["before_after", "实景对比"],
                  ["case", "完工案例"],
                  ["poster", "活动海报"]
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMatFilter(id)}
                  className={`ios-press h-8 shrink-0 rounded-full px-3.5 text-[12px] font-medium ${
                    matFilter === id
                      ? "bg-[#1d1d1f] text-white"
                      : "liquid-glass-subtle text-[#6e6e73] hover:text-[#1d1d1f]"
                  }`}
                >
                  {label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => props.onScreen("library")}
                className="ios-press ml-1 shrink-0 text-[13px] font-medium text-[#007aff]"
              >
                全部 ›
              </button>
            </div>
          </div>

          <div className={`grid gap-5 ${props.compact ? "grid-cols-1" : "md:grid-cols-2"}`}>
            {filteredMaterials.slice(0, 4).map((item) => (
              <article
                key={item.id}
                className="liquid-glass-subtle ios-card-hover group overflow-hidden rounded-[26px]"
              >
                <button
                  type="button"
                  onClick={() => {
                    props.onMaterial(item.id);
                    props.onScreen("library");
                  }}
                  className="relative block aspect-[16/10] w-full overflow-hidden bg-[#1d1d1f] text-left"
                >
                  <img
                    src={item.after_image || item.before_image}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <span className="liquid-glass-dark absolute left-3.5 top-3.5 rounded-full px-3 py-1 text-[11px] font-medium text-white">
                    {MATERIAL_TYPE_LABEL[item.type] || "实景素材"}
                  </span>
                  <span className="liquid-glass-dark absolute bottom-3 left-3.5 rounded-full px-3 py-1 text-[11px] font-medium text-white tabular-nums">
                    {item.area_sqm}㎡ · 全包 {item.budget_wan} 万
                  </span>
                </button>

                <div className="flex items-center justify-between gap-3 p-4 sm:p-5">
                  <button
                    type="button"
                    onClick={() => {
                      props.onMaterial(item.id);
                      props.onScreen("library");
                    }}
                    className="min-w-0 text-left"
                  >
                    <p className="text-[12px] font-medium text-[#6e6e73]">
                      {item.community_name} · {item.style}
                    </p>
                    <h3 className="mt-0.5 truncate text-[16px] font-semibold text-[#1d1d1f] group-hover:text-[#007aff] transition-colors">
                      {item.title}
                    </h3>
                  </button>

                  {props.enabled.includes("close") && (
                    <button
                      type="button"
                      onClick={() => props.onCarry(item.id)}
                      className="ios-press shrink-0 rounded-full bg-[#f2f2f7] px-3.5 py-1.5 text-[12px] font-medium text-[#1d1d1f] hover:bg-[#1d1d1f] hover:text-white"
                    >
                      去签单
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* 4. Company Profile, Craft Guarantees & Partner Brands */}
      <section className="liquid-glass-subtle rounded-[30px] p-6 sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[12px] font-semibold text-[#007aff]">关于{COMPANY_PROFILE.name}</p>
            <h2
              className={`mt-1 font-semibold tracking-[-0.025em] text-[#1d1d1f] ${
                props.compact ? "text-[22px]" : "text-[28px]"
              }`}
            >
              为什么业主更放心把家交给我们
            </h2>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[12px] text-[#6e6e73]">
            <MapPin className="h-3.5 w-3.5 text-[#007aff]" />
            {COMPANY_PROFILE.showroom}
          </span>
        </div>

        <div className={`mt-6 grid gap-3.5 ${props.compact ? "grid-cols-1" : "md:grid-cols-2 lg:grid-cols-4"}`}>
          {COMPANY_PROFILE.pillars.map((pillar, index) => (
            <div key={pillar.title} className="rounded-[22px] bg-[#f2f2f7]/80 p-4">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-[12px] font-semibold text-[#1d1d1f] tabular-nums shadow-xs">
                0{index + 1}
              </span>
              <h3 className="mt-3 text-[15px] font-semibold text-[#1d1d1f]">{pillar.title}</h3>
              <p className="mt-1.5 text-[13px] leading-6 text-[#6e6e73]">{pillar.desc}</p>
            </div>
          ))}
        </div>

        {/* One-Stop Full-House Categories */}
        <div className="mt-6 border-t border-black/[0.06] pt-5">
          <p className="text-[12px] font-medium text-[#6e6e73]">
            全案整装一站式直供品类（全屋主材 / 定制 / 软装 / 家电全覆盖）
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {COMPANY_PROFILE.oneStopCategories.map((cat) => (
              <span
                key={cat}
                className="rounded-full bg-[#f2f2f7] px-3 py-1 text-[12px] font-medium text-[#1d1d1f]"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>

        {/* Partner Brand Strip */}
        <div className="mt-5 border-t border-black/[0.06] pt-5">
          <p className="text-[12px] font-medium text-[#6e6e73]">一线环保主材与严选辅材直采品牌</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {COMPANY_PROFILE.partners.map((brand) => (
              <span
                key={brand}
                className="rounded-full bg-white px-3.5 py-1.5 text-[12px] font-medium text-[#1d1d1f] shadow-xs"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Compact Employee Micro-Tools Bar (Evidence Chain as a compact utility!) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-[#1d1d1f]">员工常用小工具</h2>
          <button
            type="button"
            onClick={props.onOpenDrawer}
            className="text-[12px] font-medium text-[#007aff]"
          >
            增删工具模块 ›
          </button>
        </div>

        <div className={`grid gap-3 ${props.compact ? "grid-cols-2" : "grid-cols-2 lg:grid-cols-4"}`}>
          {[
            {
              title: "证据链存证",
              sub:
                pendingEvidenceCount > 0
                  ? `${pendingEvidenceCount} 条待业主确认`
                  : `已归档 ${props.evidence.length} 条记录`,
              icon: ShieldCheck,
              color: "bg-[#34c759]/12 text-[#1d8a4e]",
              onClick: () => {
                if (props.enabled.includes("evidence")) {
                  if (lead) props.onEvidenceLead(lead.id);
                  props.onScreen("evidence");
                } else props.onOpenDrawer();
              }
            },
            {
              title: "赋能签单台",
              sub: "对客演示 · 异议反击",
              icon: Briefcase,
              color: "bg-[#007aff]/10 text-[#007aff]",
              onClick: () => {
                if (props.enabled.includes("close")) {
                  if (lead) props.onLead(lead.id);
                  props.onScreen("close");
                } else props.onOpenDrawer();
              }
            },
            {
              title: "10秒闭口报价",
              sub: "选户型档位实时算价",
              icon: Calculator,
              color: "bg-[#5856d6]/10 text-[#5856d6]",
              onClick: () => {
                if (props.enabled.includes("close")) props.onScreen("close");
                else props.onOpenDrawer();
              }
            },
            {
              title: "同小区看工地",
              sub: `${SITE_BROADCASTS.length} 套在建实景可约`,
              icon: HardHat,
              color: "bg-[#ff9500]/12 text-[#d47a00]",
              onClick: () => {
                if (props.enabled.includes("sites")) props.onScreen("sites");
                else props.onOpenDrawer();
              }
            }
          ].map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.title}
                type="button"
                onClick={tool.onClick}
                className={`ios-press ios-card-hover liquid-glass-subtle rounded-[22px] p-4 text-left ${
                  props.compact ? "flex flex-col items-start gap-2.5" : "flex items-center gap-3.5"
                }`}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${tool.color}`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[14px] font-semibold text-[#1d1d1f]">
                    {tool.title}
                  </span>
                  <span className="mt-0.5 block text-[12px] text-[#6e6e73]">{tool.sub}</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function MoreSheet(props: React.ComponentProps<typeof AppViewport>) {
  const extra = props.tabs.filter((id) => id !== "today").slice(3);
  return (
    <div className="px-4 py-6 space-y-5">
      <div>
        <h1 className="text-[26px] font-semibold tracking-[-0.025em] text-[#1d1d1f]">更多工具</h1>
        <p className="mt-1 text-[13px] text-[#6e6e73]">已开启的扩展能力模块</p>
      </div>

      <div className="liquid-glass-subtle divide-y divide-black/[0.06] overflow-hidden rounded-[24px]">
        {extra.map((id) => {
          const meta = moduleById(id as ModuleId);
          return (
            <button
              key={id}
              type="button"
              onClick={() => props.onScreen(id)}
              className="ios-press flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#007aff]/10 text-[#007aff]">
                  <ScreenIcon id={id} className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-[15px] font-semibold text-[#1d1d1f]">
                    {meta.label}
                  </span>
                  <span className="mt-0.5 block text-[12px] text-[#6e6e73]">{meta.blurb}</span>
                </span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-[#8e8e93]" />
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={props.onOpenDrawer}
        className="ios-press flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#1d1d1f] text-[14px] font-medium text-white"
      >
        <SlidersHorizontal className="h-4 w-4" />
        调整这一版包含的模块
      </button>
    </div>
  );
}

function LegacyModuleView(props: React.ComponentProps<typeof AppViewport>) {
  const id = props.screen as ModuleId;
  return (
    <div className="mx-auto max-w-[1160px] px-2 sm:px-4">
      {id === "communities" && (
        <CommunityKnowledgeBase communities={props.communities} onRefresh={props.onRefresh} />
      )}
      {id === "leads" && <LeadsDashboard leads={props.leads} onRefresh={props.onRefresh} />}
      {id === "copy" && (
        <MultiChannelCopyStudio communities={props.communities} onPublished={props.onRefresh} />
      )}
      {id === "space" && <SpaceTransformStudio onPublished={props.onRefresh} />}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="mx-auto max-w-[1160px] px-6 py-10 space-y-6" aria-hidden>
      <div className="h-[380px] animate-pulse rounded-[32px] bg-black/[0.06] motion-reduce:animate-none" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-[22px] bg-black/[0.05] motion-reduce:animate-none"
          />
        ))}
      </div>
    </div>
  );
}
