"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeftRight,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Edit3,
  Plus,
  RotateCcw,
  Save,
  Sparkles,
  Trash2,
  X
} from "lucide-react";
import {
  AUX_BANNER_IMAGE,
  PACKAGE_DIFF_HIGHLIGHTS,
  PackageId,
  PackageMaterialItem,
  ProductPackage,
  ROOM_KEYS,
  ROOM_VISUALS,
  RoomKey,
  SHARED_AUX_MATERIALS
} from "@/lib/packages";

type TabId = "rooms" | "aux" | "rules" | "compare";

type Props = {
  packages: ProductPackage[];
  activePackageId: PackageId;
  initialTab?: TabId;
  onSelectPackage: (id: PackageId) => void;
  onUpdatePackage: (pkg: ProductPackage, changeSummary?: string) => void;
  onResetPackages: () => void;
  onQuoteWithPackage: (pkg: ProductPackage) => void;
  onClose: () => void;
  onNotify: (msg: string) => void;
};

export default function PackageConfigModal({
  packages,
  activePackageId,
  initialTab = "rooms",
  onSelectPackage,
  onUpdatePackage,
  onResetPackages,
  onQuoteWithPackage,
  onClose,
  onNotify
}: Props) {
  const pkg = packages.find((p) => p.id === activePackageId) ?? packages[0];
  const [tab, setTab] = useState<TabId>(initialTab);
  const [room, setRoom] = useState<RoomKey>("厨房空间");
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftBrand, setDraftBrand] = useState("");
  const [draftSpec, setDraftSpec] = useState("");
  const [draftTag, setDraftTag] = useState("");

  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newBrand, setNewBrand] = useState("");
  const [newSpec, setNewSpec] = useState("");
  const [changeNote, setChangeNote] = useState("");
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Lock background page & phone-preview container scrolling while modal is open
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const scrollbarWidth = window.innerWidth - html.clientWidth;

    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevBodyPaddingRight = body.style.paddingRight;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const phoneScrollers = Array.from(
      document.querySelectorAll<HTMLElement>('[data-phone-scroll="true"]')
    );
    const prevPhoneOverflows = phoneScrollers.map((el) => el.style.overflow);
    phoneScrollers.forEach((el) => {
      el.style.overflow = "hidden";
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      body.style.paddingRight = prevBodyPaddingRight;
      phoneScrollers.forEach((el, idx) => {
        el.style.overflow = prevPhoneOverflows[idx];
      });
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [tab, room, pkg.id]);

  const roomItems = useMemo(
    () => pkg.items.filter((item) => item.room === room),
    [pkg.items, room]
  );
  const activeRoomVisual = ROOM_VISUALS[pkg.id][room];

  function startEdit(item: PackageMaterialItem) {
    setEditingId(item.id);
    setDraftName(item.name);
    setDraftBrand(item.brand);
    setDraftSpec(item.spec);
    setDraftTag(item.updatedTag || "");
  }

  function saveItemEdit(itemId: string) {
    const nextItems = pkg.items.map((item) =>
      item.id === itemId
        ? {
            ...item,
            name: draftName.trim() || item.name,
            brand: draftBrand.trim() || item.brand,
            spec: draftSpec.trim() || item.spec,
            updatedTag: draftTag.trim() || "刚更新"
          }
        : item
    );
    const note = changeNote.trim() || `更新「${room} · ${draftName.trim()}」品牌/规格为 ${draftBrand.trim()}`;
    onUpdatePackage({ ...pkg, items: nextItems }, note);
    setEditingId(null);
    setChangeNote("");
    onNotify(`已更新「${pkg.name}」材料配置并同步新版`);
  }

  function deleteItem(item: PackageMaterialItem) {
    const nextItems = pkg.items.filter((i) => i.id !== item.id);
    onUpdatePackage({ ...pkg, items: nextItems }, `下架「${item.room} · ${item.name}」`);
    onNotify(`已移除「${item.name}」`);
  }

  function addItem(event: React.FormEvent) {
    event.preventDefault();
    if (!newName.trim() || !newBrand.trim()) return;
    const item: PackageMaterialItem = {
      id: `custom-${Date.now()}`,
      room,
      name: newName.trim(),
      brand: newBrand.trim(),
      spec: newSpec.trim() || "展厅最新标配",
      updatedTag: "新增材料"
    };
    onUpdatePackage(
      { ...pkg, items: [...pkg.items, item] },
      `新增「${room} · ${item.name}（${item.brand}）」`
    );
    setNewName("");
    setNewBrand("");
    setNewSpec("");
    setAdding(false);
    onNotify(`已为「${pkg.name}」新增材料项`);
  }

  async function copyPackageSummary() {
    const text = [
      `【壹品整装 · ${pkg.name}配置单（${pkg.version}）】`,
      `基准价：¥${pkg.basePrice.toLocaleString()} 起（${pkg.baseAreaLabel}）`,
      `定位：${pkg.tagline}`,
      ``,
      ...ROOM_KEYS.map((rk) => {
        const rows = pkg.items
          .filter((i) => i.room === rk)
          .map((i) => `  · ${i.name}：${i.brand}（${i.spec}）`)
          .join("\n");
        return `【${rk}】\n${rows}`;
      }),
      ``,
      `不限量项目：${pkg.unlimitedItems.join("、")}`,
      `注：材料品牌如有升级调整，以小程序实时最新版配置单为准。`
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onNotify(`已复制「${pkg.name}」最新配置清单`);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      onNotify("配置清单已准备");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center overflow-hidden overscroll-contain bg-black/40 backdrop-blur-sm sm:items-center sm:p-5"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${pkg.name} 配置清单`}
        onClick={(event) => event.stopPropagation()}
        onWheel={(event) => event.stopPropagation()}
        className="animate-ios-sheet liquid-glass flex max-h-[92vh] w-full max-w-[840px] flex-col overflow-hidden rounded-t-[32px] sm:rounded-[32px]"
      >
        {/* Header Bar */}
        <div className="border-b border-black/[0.06] px-5 py-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="inline-flex rounded-full bg-black/[0.05] p-1">
                {packages.map((p) => {
                  const active = p.id === pkg.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        onSelectPackage(p.id);
                        setEditingId(null);
                      }}
                      className={`ios-press h-8 rounded-full px-3.5 text-[13px] font-semibold ${
                        active ? "bg-white text-[#1d1d1f] shadow-sm" : "text-[#6e6e73]"
                      }`}
                    >
                      {p.name} · ¥{(p.basePrice / 10000).toFixed(2)}万起
                    </button>
                  );
                })}
              </div>

              <span className="hidden items-center gap-1 rounded-full bg-[#007aff]/10 px-2.5 py-1 text-[11px] font-semibold text-[#007aff] sm:inline-flex">
                <Clock className="h-3 w-3" />
                {pkg.version} · {pkg.updatedAt} 更新
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditMode((v) => !v);
                  setEditingId(null);
                  setAdding(false);
                }}
                className={`ios-press inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[12px] font-medium ${
                  editMode
                    ? "bg-[#007aff] text-white"
                    : "bg-black/[0.05] text-[#1d1d1f] hover:bg-black/[0.09]"
                }`}
              >
                <Edit3 className="h-3.5 w-3.5" />
                {editMode ? "退出维护" : "更新材料"}
              </button>

              <button
                type="button"
                onClick={onClose}
                aria-label="关闭"
                className="ios-press flex h-8 w-8 items-center justify-center rounded-full bg-black/[0.06] text-[#1d1d1f]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* 4 Segmented Tabs */}
          <div className="no-scrollbar mt-3.5 flex items-center gap-1.5 overflow-x-auto">
            {(
              [
                ["rooms", "空间主材清单"],
                ["aux", "通用严选辅材"],
                ["rules", "计价与不限量细则"],
                ["compare", "2万差价对比"]
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`ios-press inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[12px] font-medium ${
                  tab === id
                    ? "bg-[#1d1d1f] text-white"
                    : "bg-white/70 text-[#6e6e73] hover:text-[#1d1d1f]"
                }`}
              >
                {id === "compare" && <ArrowLeftRight className="h-3.5 w-3.5" />}
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Body */}
        <div
          ref={scrollRef}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6"
        >
          {editMode && (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-[#007aff]/10 px-4 py-3 text-[12px] text-[#0055b3]">
              <span>
                <strong>材料实时维护模式已开启：</strong>
                修改品牌或规格后会自动更新版本号并写入变更记录，全员打开即同步最新配置单。
              </span>
              <button
                type="button"
                onClick={() => {
                  onResetPackages();
                  onNotify("已恢复 10.28 官方初始配置单");
                }}
                className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 font-medium text-[#1d1d1f]"
              >
                <RotateCcw className="h-3 w-3" />
                恢复10.28原版
              </button>
            </div>
          )}

          {/* TAB 1: Space Materials */}
          {tab === "rooms" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-0.5">
                  {ROOM_KEYS.map((rk) => {
                    const active = room === rk;
                    const thumb = ROOM_VISUALS[pkg.id][rk].image;
                    return (
                      <button
                        key={rk}
                        type="button"
                        onClick={() => {
                          setRoom(rk);
                          setEditingId(null);
                        }}
                        className={`ios-press inline-flex h-10 shrink-0 items-center gap-2 rounded-full pl-1.5 pr-3.5 text-[12px] font-medium ${
                          active
                            ? "bg-[#007aff] text-white shadow-sm"
                            : "bg-white/85 text-[#1d1d1f] hover:bg-white"
                        }`}
                      >
                        <img
                          src={thumb}
                          alt={rk}
                          className="h-7 w-7 rounded-full object-cover ring-1 ring-black/10"
                        />
                        <span>
                          {rk}（{pkg.items.filter((i) => i.room === rk).length}）
                        </span>
                      </button>
                    );
                  })}
                </div>

                {editMode && (
                  <button
                    type="button"
                    onClick={() => setAdding((v) => !v)}
                    className="ios-press inline-flex h-9 items-center gap-1 rounded-full bg-[#1d1d1f] px-3.5 text-[12px] font-medium text-white"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    新增{room}材料
                  </button>
                )}
              </div>

              {/* Active Room Showcase Visual */}
              <div className="relative overflow-hidden rounded-[24px] bg-[#e5e5ea] shadow-sm">
                <div className="relative aspect-[16/6.5] min-h-[156px] w-full overflow-hidden">
                  <img
                    key={`${pkg.id}-${room}`}
                    src={activeRoomVisual.image}
                    alt={`${pkg.name} ${room}`}
                    className="h-full w-full object-cover transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10" />
                  <div className="absolute left-4 top-3.5 flex items-center gap-2">
                    <span className="liquid-glass-dark rounded-full px-3 py-1 text-[11px] font-medium text-white">
                      {pkg.name} · {room}
                    </span>
                    <span className="liquid-glass-dark rounded-full px-2.5 py-1 text-[11px] font-medium text-white/90 tabular-nums">
                      共 {roomItems.length} 项配置
                    </span>
                  </div>
                  <div className="absolute bottom-3.5 left-4 right-4 text-white">
                    <p className="text-[13px] font-medium leading-5 text-white/95">
                      {activeRoomVisual.caption}
                    </p>
                  </div>
                </div>
              </div>

              {adding && editMode && (
                <form
                  onSubmit={addItem}
                  className="animate-ios-sheet space-y-2.5 rounded-2xl bg-white p-4 shadow-sm"
                >
                  <p className="text-[13px] font-semibold text-[#1d1d1f]">
                    往「{pkg.name} · {room}」添加新材料
                  </p>
                  <div className="grid gap-2 sm:grid-cols-3">
                    <input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="项目名称（如：智能马桶）"
                      className="h-9 rounded-xl bg-[#f2f2f7] px-3 text-[13px]"
                    />
                    <input
                      value={newBrand}
                      onChange={(e) => setNewBrand(e.target.value)}
                      placeholder="品牌（如：恒洁 / 箭牌）"
                      className="h-9 rounded-xl bg-[#f2f2f7] px-3 text-[13px]"
                    />
                    <input
                      value={newSpec}
                      onChange={(e) => setNewSpec(e.target.value)}
                      placeholder="规格说明"
                      className="h-9 rounded-xl bg-[#f2f2f7] px-3 text-[13px]"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setAdding(false)}
                      className="h-8 rounded-full px-3 text-[12px] text-[#6e6e73]"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      className="h-8 rounded-full bg-[#007aff] px-4 text-[12px] font-medium text-white"
                    >
                      确认添加并同步
                    </button>
                  </div>
                </form>
              )}

              <div className="divide-y divide-black/[0.06] overflow-hidden rounded-[22px] bg-white/90">
                {roomItems.map((item) => {
                  const isEditing = editMode && editingId === item.id;
                  if (isEditing) {
                    return (
                      <div key={item.id} className="space-y-2.5 bg-[#007aff]/[0.04] p-4">
                        <div className="grid gap-2 sm:grid-cols-3">
                          <input
                            value={draftName}
                            onChange={(e) => setDraftName(e.target.value)}
                            placeholder="项目名称"
                            className="h-9 rounded-xl bg-white px-3 text-[13px] ring-1 ring-black/10"
                          />
                          <input
                            value={draftBrand}
                            onChange={(e) => setDraftBrand(e.target.value)}
                            placeholder="品牌"
                            className="h-9 rounded-xl bg-white px-3 text-[13px] ring-1 ring-black/10"
                          />
                          <input
                            value={draftTag}
                            onChange={(e) => setDraftTag(e.target.value)}
                            placeholder="标签（如：新升级）"
                            className="h-9 rounded-xl bg-white px-3 text-[13px] ring-1 ring-black/10"
                          />
                        </div>
                        <input
                          value={draftSpec}
                          onChange={(e) => setDraftSpec(e.target.value)}
                          placeholder="规格与工艺说明"
                          className="h-9 w-full rounded-xl bg-white px-3 text-[13px] ring-1 ring-black/10"
                        />
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <input
                            value={changeNote}
                            onChange={(e) => setChangeNote(e.target.value)}
                            placeholder="可选：填写本次材料更新原因，写入变更记录"
                            className="h-8 flex-1 rounded-xl bg-white px-3 text-[12px] ring-1 ring-black/10"
                          />
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="h-8 rounded-full px-3 text-[12px] text-[#6e6e73]"
                            >
                              取消
                            </button>
                            <button
                              type="button"
                              onClick={() => saveItemEdit(item.id)}
                              className="inline-flex h-8 items-center gap-1 rounded-full bg-[#007aff] px-3.5 text-[12px] font-medium text-white"
                            >
                              <Save className="h-3.5 w-3.5" />
                              保存并同步
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={item.id}
                      className="flex flex-col gap-2 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0 sm:w-36 sm:shrink-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[14px] font-semibold text-[#1d1d1f]">
                            {item.name}
                          </span>
                          {item.updatedTag && (
                            <span className="rounded-full bg-[#007aff]/10 px-2 py-0.5 text-[10px] font-semibold text-[#007aff]">
                              {item.updatedTag}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-medium text-[#1d1d1f]">{item.brand}</p>
                        <p className="mt-0.5 text-[12px] text-[#6e6e73]">{item.spec}</p>
                      </div>
                      {editMode && (
                        <div className="flex shrink-0 items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => startEdit(item)}
                            className="rounded-full bg-[#f2f2f7] px-3 py-1 text-[12px] font-medium text-[#1d1d1f] hover:bg-[#007aff] hover:text-white"
                          >
                            修改
                          </button>
                          <button
                            type="button"
                            aria-label={`删除 ${item.name}`}
                            onClick={() => deleteItem(item)}
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ff3b30]/10 text-[#ff3b30]"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Change Log */}
              <div className="rounded-[20px] bg-white/75 p-4">
                <p className="text-[12px] font-semibold text-[#6e6e73]">材料更新记录（不定期同步）</p>
                <ul className="mt-2 space-y-1.5">
                  {pkg.changelog.slice(0, 4).map((log) => (
                    <li
                      key={log.id}
                      className="flex flex-wrap items-baseline gap-x-2 text-[12px] text-[#1d1d1f]"
                    >
                      <span className="font-semibold text-[#007aff] tabular-nums">
                        {log.version}
                      </span>
                      <span className="text-[#8e8e93] tabular-nums">{log.at}</span>
                      <span>{log.note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: Shared Auxiliary Materials */}
          {tab === "aux" && (
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-[24px] bg-[#1d1d1f]">
                <div className="relative aspect-[16/5.5] min-h-[140px] w-full overflow-hidden">
                  <img
                    src={AUX_BANNER_IMAGE}
                    alt="严选隐蔽工程与环保辅材"
                    className="h-full w-full object-cover opacity-75"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute bottom-3.5 left-4 right-4 text-white">
                    <span className="liquid-glass-dark rounded-full px-2.5 py-0.5 text-[11px] font-medium text-white/95">
                      全系列统一工艺标准 · 水电终保
                    </span>
                    <p className="mt-1.5 text-[14px] font-semibold">
                      8 大一线环保辅材，隐蔽工程看得见的扎实底子
                    </p>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-black/[0.06] overflow-hidden rounded-[22px] bg-white/90">
                {SHARED_AUX_MATERIALS.map((aux) => (
                  <div
                    key={aux.id}
                    className="flex flex-col gap-1.5 px-4 py-3.5 sm:flex-row sm:items-start sm:gap-4"
                  >
                    <span className="text-[14px] font-semibold text-[#1d1d1f] sm:w-36 sm:shrink-0">
                      {aux.name}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-[#007aff]">{aux.brand}</p>
                      <p className="mt-1 text-[12px] leading-5 text-[#6e6e73]">{aux.feature}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Pricing Rules & Unlimited Items */}
          {tab === "rules" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {ROOM_KEYS.map((rk) => (
                  <button
                    key={rk}
                    type="button"
                    onClick={() => {
                      setRoom(rk);
                      setTab("rooms");
                    }}
                    className="ios-press group relative aspect-[4/3] overflow-hidden rounded-[18px] bg-[#1d1d1f] text-left"
                  >
                    <img
                      src={ROOM_VISUALS[pkg.id][rk].image}
                      alt={rk}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                    <div className="absolute bottom-2 left-2.5 right-2.5 text-white">
                      <p className="text-[12px] font-semibold">{rk}</p>
                      <p className="text-[10px] text-white/75">
                        {pkg.items.filter((i) => i.room === rk).length} 项主材 ›
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="rounded-[22px] bg-white/90 p-5">
                <p className="text-[13px] font-semibold text-[#1d1d1f]">标配包含说明</p>
                <ul className="mt-3 space-y-2">
                  {pkg.includedSummary.map((line) => (
                    <li key={line} className="flex items-start gap-2 text-[13px] text-[#1d1d1f]">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#34c759]" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[22px] bg-white/90 p-5">
                <p className="text-[13px] font-semibold text-[#1d1d1f]">以下项目全部不限量</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {pkg.unlimitedItems.map((u) => (
                    <span
                      key={u}
                      className="rounded-full bg-[#34c759]/12 px-3 py-1 text-[12px] font-medium text-[#1d8a4e]"
                    >
                      {u}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-[22px] bg-white/90 p-5">
                <p className="text-[13px] font-semibold text-[#1d1d1f]">计价口径与温馨提示</p>
                <ol className="mt-3 space-y-2 text-[13px] leading-6 text-[#6e6e73]">
                  {pkg.rules.map((r, i) => (
                    <li key={r}>
                      {i + 1}. {r}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}

          {/* TAB 4: 20,000 RMB Difference Comparison */}
          {tab === "compare" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {packages.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      onSelectPackage(p.id);
                      setTab("rooms");
                    }}
                    className="ios-press group relative aspect-[16/9] overflow-hidden rounded-[22px] bg-[#1d1d1f] text-left"
                  >
                    <img
                      src={p.cover}
                      alt={p.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                    <div className="absolute bottom-3 left-3.5 right-3.5 text-white">
                      <p className="text-[11px] text-white/75">{p.baseAreaLabel}</p>
                      <div className="mt-0.5 flex items-baseline justify-between gap-2">
                        <span className="text-[17px] font-semibold">{p.name}</span>
                        <span className="text-[15px] font-semibold tabular-nums">
                          ¥{p.basePrice.toLocaleString()}起
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="rounded-[22px] bg-[#1d1d1f] p-4 sm:p-5 text-white">
                <p className="text-[12px] text-white/70">谈单升单核心对比</p>
                <h3 className="mt-1 text-[18px] font-semibold">
                  美丽家 ¥79,800 vs 尊贵家 ¥99,800，差 2 万升级了什么？
                </h3>
                <p className="mt-1 text-[12.5px] text-white/75">
                  尊贵家不仅基准面积多覆盖 10㎡（80–90㎡），橱柜、卫浴、门窗、开关、木地板与飘窗石全面跃升一线大牌。
                </p>
              </div>

              <div className="overflow-hidden rounded-[22px] bg-white/90">
                <div className="grid grid-cols-12 border-b border-black/[0.06] bg-black/[0.025] px-4 py-2.5 text-[12px] font-semibold text-[#6e6e73]">
                  <span className="col-span-3">配置项</span>
                  <span className="col-span-4 text-[#1d8a4e]">美丽家 · 79,800起</span>
                  <span className="col-span-5 text-[#d90a14]">尊贵家 · 99,800起</span>
                </div>
                <div className="divide-y divide-black/[0.06]">
                  {PACKAGE_DIFF_HIGHLIGHTS.map((row) => (
                    <div
                      key={row.item}
                      className="grid grid-cols-12 gap-2 px-4 py-3 text-[12px] leading-5"
                    >
                      <span className="col-span-3 font-semibold text-[#1d1d1f]">{row.item}</span>
                      <span className="col-span-4 text-[#6e6e73]">{row.meili}</span>
                      <span className="col-span-5 font-medium text-[#1d1d1f]">{row.zungui}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/[0.06] px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={copyPackageSummary}
            className="ios-press inline-flex h-10 items-center gap-1.5 rounded-full bg-white px-4 text-[13px] font-medium text-[#1d1d1f] shadow-xs"
          >
            {copied ? <Check className="h-4 w-4 text-[#34c759]" /> : <Copy className="h-4 w-4 text-[#007aff]" />}
            {copied ? "已复制最新清单" : "复制清单发微信"}
          </button>

          <button
            type="button"
            onClick={() => onQuoteWithPackage(pkg)}
            className="ios-press inline-flex h-10 items-center gap-1.5 rounded-full bg-[#007aff] px-5 text-[13px] font-medium text-white shadow-sm"
          >
            <Sparkles className="h-4 w-4" />
            按「{pkg.name}」精准算报价
          </button>
        </div>
      </div>
    </div>
  );
}
