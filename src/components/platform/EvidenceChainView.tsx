"use client";

import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  Camera,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  FileCheck2,
  Fingerprint,
  Plus,
  ShieldCheck,
  X
} from "lucide-react";
import {
  EVIDENCE_STAGES,
  EvidenceNode,
  EvidenceStage,
  STATUS_LABEL,
  formatWhen,
  makeEvidenceCode,
  makeShortHash
} from "@/lib/platform";
import { Lead } from "@/lib/types";

type Props = {
  leads: Lead[];
  evidence: EvidenceNode[];
  selectedLeadId: string | null;
  employee: string;
  compact: boolean;
  onSelectLead: (id: string | null) => void;
  onToggleConfirm: (id: string) => void;
  onAddEvidence: (node: EvidenceNode) => void;
  onNotify: (msg: string) => void;
};

const QUICK_PHOTOS = [
  {
    label: "毛坯量房原况",
    url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=80"
  },
  {
    label: "水电管线实拍",
    url: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=900&q=80"
  },
  {
    label: "完工参考定稿",
    url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=80"
  }
];

export default function EvidenceChainView({
  leads,
  evidence,
  selectedLeadId,
  employee,
  compact,
  onSelectLead,
  onToggleConfirm,
  onAddEvidence,
  onNotify
}: Props) {
  const [stageFilter, setStageFilter] = useState<"全部" | EvidenceStage>("全部");
  const [composerOpen, setComposerOpen] = useState(false);
  const [newStage, setNewStage] = useState<EvidenceStage>("方案报价");
  const [newTitle, setNewTitle] = useState("");
  const [newSaid, setNewSaid] = useState("");
  const [newPhoto, setNewPhoto] = useState<string | undefined>(QUICK_PHOTOS[0].url);
  const [newConfirmed, setNewConfirmed] = useState(true);
  const [copiedSummary, setCopiedSummary] = useState(false);

  const showList = compact ? !selectedLeadId : true;
  const showDetail = compact ? Boolean(selectedLeadId) : true;
  const activeLead =
    leads.find((item) => item.id === selectedLeadId) ?? (!compact ? leads[0] ?? null : null);

  const allLeadNodes = useMemo(() => {
    if (!activeLead) return [];
    return evidence
      .filter((node) => node.leadId === activeLead.id)
      .slice()
      .sort((a, b) => +new Date(a.at) - +new Date(b.at));
  }, [evidence, activeLead]);

  const visibleNodes = useMemo(() => {
    if (stageFilter === "全部") return allLeadNodes;
    return allLeadNodes.filter((n) => n.stage === stageFilter);
  }, [allLeadNodes, stageFilter]);

  const confirmedCount = allLeadNodes.filter((n) => n.confirmed).length;

  async function copyWeChatReceipt() {
    if (!activeLead) return;
    const lines = [
      `【壹品整装 · 全流程沟通存证确认函】`,
      `业主：${activeLead.customer_name}（${activeLead.community_name} ${activeLead.area_sqm}㎡）`,
      `负责顾问：${employee}`,
      `已归档节点：${allLeadNodes.length} 条（业主已确认 ${confirmedCount} 条）`,
      ``,
      ...allLeadNodes.map(
        (node, i) =>
          `${i + 1}. [${node.stage}] ${node.title}（${formatWhen(node.at)}）\n   内容：${node.said}\n   编号：${node.code} · 状态：${
            node.confirmed ? "已确认" : "待确认"
          }`
      ),
      ``,
      `如以上内容无误，请您在本微信群直接回复「确认」，系统将同步锁定后续设计与施工交付标准。`
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopiedSummary(true);
      onNotify("微信确认函已复制，可直接发给业主");
      window.setTimeout(() => setCopiedSummary(false), 2200);
    } catch {
      onNotify("已生成确认函");
    }
  }

  function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    if (!activeLead || !newSaid.trim()) return;
    const now = Date.now();
    const text = newSaid.trim();
    onAddEvidence({
      id: `ev-${now}`,
      code: makeEvidenceCode(now),
      hash: makeShortHash(`${activeLead.id}|${text}|${now}`),
      stage: newStage,
      leadId: activeLead.id,
      customerName: activeLead.customer_name,
      at: new Date(now).toISOString(),
      title: newTitle.trim() || `${newStage}现场存证`,
      said: text,
      by: employee,
      attachment: newPhoto ? "现场实拍 + 文本存证" : "沟通文本存证",
      photo: newPhoto,
      confirmed: newConfirmed,
      confirmChannel: newConfirmed ? "业主现场已签认" : "待业主微信确认"
    });
    setNewTitle("");
    setNewSaid("");
    setComposerOpen(false);
    onNotify("新存证节点已上链编号");
  }

  return (
    <div className={compact ? "px-4 py-5" : "mx-auto max-w-[1160px] px-6 py-10"}>
      {!compact && (
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[38px] font-semibold leading-[1.08] tracking-[-0.025em] text-[#1d1d1f]">
              全流程数字证据链
            </h1>
            <p className="mt-2 text-[15px] text-[#6e6e73]">
              从首次谈单、量房原况到水电隐蔽验收，每一句承诺与现场照片均自动编号存证，交付零扯皮。
            </p>
          </div>
          {activeLead && (
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={copyWeChatReceipt}
                className="ios-press liquid-glass-subtle inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-[13px] font-medium text-[#1d1d1f]"
              >
                {copiedSummary ? (
                  <Check className="h-4 w-4 text-[#34c759]" />
                ) : (
                  <Copy className="h-4 w-4 text-[#007aff]" />
                )}
                {copiedSummary ? "已复制确认函" : "生成微信确认函"}
              </button>
              <button
                type="button"
                onClick={() => setComposerOpen(true)}
                className="ios-press inline-flex h-10 items-center gap-1.5 rounded-full bg-[#007aff] px-4 text-[13px] font-medium text-white shadow-sm hover:bg-[#0071e3]"
              >
                <Plus className="h-4 w-4" />
                新增现场存证
              </button>
            </div>
          )}
        </div>
      )}

      <div className={compact ? "" : "grid grid-cols-12 items-start gap-6"}>
        {/* Left Master Customer List */}
        {showList && (
          <aside className={compact ? "space-y-3" : "col-span-4 space-y-3"}>
            {compact && (
              <div className="mb-4">
                <h1 className="text-[26px] font-semibold tracking-[-0.025em] text-[#1d1d1f]">
                  证据链档案
                </h1>
                <p className="mt-1 text-[13px] text-[#6e6e73]">
                  按客户查看全部沟通承诺、实拍原况与确认状态
                </p>
              </div>
            )}

            <div className="liquid-glass-subtle overflow-hidden rounded-[24px] p-2">
              {leads.map((item) => {
                const list = evidence.filter((n) => n.leadId === item.id);
                const done = list.filter((n) => n.confirmed).length;
                const pending = list.length - done;
                const active = item.id === activeLead?.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelectLead(item.id);
                      setStageFilter("全部");
                    }}
                    className={`ios-press flex w-full items-center justify-between gap-3 rounded-[18px] px-4 py-3.5 text-left ${
                      active && !compact
                        ? "bg-[#1d1d1f] text-white"
                        : "text-[#1d1d1f] hover:bg-black/[0.04]"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-[15px] font-semibold">
                          {item.customer_name}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            active && !compact
                              ? "bg-white/15 text-white/90"
                              : "bg-black/[0.05] text-[#6e6e73]"
                          }`}
                        >
                          {STATUS_LABEL[item.status]}
                        </span>
                      </div>
                      <p
                        className={`mt-1 truncate text-[12px] ${
                          active && !compact ? "text-white/70" : "text-[#6e6e73]"
                        }`}
                      >
                        {item.community_name} · {item.area_sqm}㎡ · {item.target_style}
                      </p>
                    </div>

                    <div className="shrink-0 text-right tabular-nums">
                      <span
                        className={`block text-[13px] font-semibold ${
                          active && !compact ? "text-white" : "text-[#1d1d1f]"
                        }`}
                      >
                        {list.length} 条
                      </span>
                      <span
                        className={`mt-0.5 block text-[11px] ${
                          pending > 0
                            ? active && !compact
                              ? "text-[#ffd60a]"
                              : "text-[#ff9500]"
                            : active && !compact
                              ? "text-[#30d158]"
                              : "text-[#34c759]"
                        }`}
                      >
                        {pending > 0 ? `${pending} 待确认` : "全部已签认"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>
        )}

        {/* Right Detail Dossier */}
        {showDetail && activeLead && (
          <div className={compact ? "space-y-4" : "col-span-8 space-y-5"}>
            {compact && (
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onSelectLead(null)}
                  className="ios-press inline-flex items-center gap-1 text-[14px] font-medium text-[#007aff]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  全部客户
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={copyWeChatReceipt}
                    className="ios-press liquid-glass-subtle inline-flex h-8 items-center gap-1 rounded-full px-3 text-[12px] font-medium text-[#1d1d1f]"
                  >
                    <Copy className="h-3.5 w-3.5 text-[#007aff]" />
                    确认函
                  </button>
                  <button
                    type="button"
                    onClick={() => setComposerOpen(true)}
                    className="ios-press inline-flex h-8 items-center gap-1 rounded-full bg-[#007aff] px-3 text-[12px] font-medium text-white"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    存证
                  </button>
                </div>
              </div>
            )}

            {/* Dossier Summary Header */}
            <div className="liquid-glass-subtle rounded-[24px] p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-[#34c759]" />
                    <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">
                      {activeLead.customer_name} · 专属存证档案
                    </h2>
                  </div>
                  <p className="mt-1 text-[13px] text-[#6e6e73]">
                    {activeLead.community_name} {activeLead.area_sqm}㎡ · {activeLead.target_style} · 预估{" "}
                    {activeLead.estimated_budget}
                  </p>
                </div>

                <div className="flex items-center gap-3 tabular-nums">
                  <div className="rounded-2xl bg-[#f2f2f7] px-3.5 py-2 text-center">
                    <span className="block text-[18px] font-semibold text-[#1d1d1f]">
                      {allLeadNodes.length}
                    </span>
                    <span className="text-[11px] text-[#6e6e73]">总存证</span>
                  </div>
                  <div className="rounded-2xl bg-[#34c759]/10 px-3.5 py-2 text-center">
                    <span className="block text-[18px] font-semibold text-[#1d8a4e]">
                      {confirmedCount}
                    </span>
                    <span className="text-[11px] text-[#1d8a4e]">业主已确认</span>
                  </div>
                </div>
              </div>

              {/* 6-Stage Filter Pills */}
              <div className="no-scrollbar mt-5 flex items-center gap-1.5 overflow-x-auto pb-0.5">
                {(["全部", ...EVIDENCE_STAGES] as const).map((st) => {
                  const active = stageFilter === st;
                  const count =
                    st === "全部"
                      ? allLeadNodes.length
                      : allLeadNodes.filter((n) => n.stage === st).length;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStageFilter(st)}
                      className={`ios-press h-8 shrink-0 rounded-full px-3 text-[12px] font-medium ${
                        active
                          ? "bg-[#1d1d1f] text-white"
                          : "bg-[#f2f2f7] text-[#6e6e73] hover:text-[#1d1d1f]"
                      }`}
                    >
                      {st}
                      {count > 0 ? ` · ${count}` : ""}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Inline Composer Sheet */}
            {composerOpen && (
              <form
                onSubmit={handleCreate}
                className="animate-ios-sheet liquid-glass rounded-[24px] p-5 sm:p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="h-4 w-4 text-[#007aff]" />
                    <h3 className="text-[16px] font-semibold text-[#1d1d1f]">新增现场存证节点</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setComposerOpen(false)}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-black/[0.06] text-[#6e6e73]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {EVIDENCE_STAGES.map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setNewStage(st)}
                      className={`ios-press h-8 rounded-full px-3 text-[12px] font-medium ${
                        newStage === st
                          ? "bg-[#007aff] text-white"
                          : "bg-[#f2f2f7] text-[#1d1d1f]"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <input
                  value={newTitle}
                  onChange={(event) => setNewTitle(event.target.value)}
                  placeholder="节点标题（如：水电定位验收 / 增项零加价确认）"
                  className="mt-3 h-10 w-full rounded-xl bg-[#f2f2f7] px-3.5 text-[14px] text-[#1d1d1f] placeholder:text-[#8e8e93]"
                />

                <textarea
                  value={newSaid}
                  onChange={(event) => setNewSaid(event.target.value)}
                  rows={3}
                  placeholder="详细写清双方沟通结论、材料品牌型号或尺寸约定..."
                  className="mt-2.5 w-full resize-none rounded-xl bg-[#f2f2f7] p-3.5 text-[14px] leading-6 text-[#1d1d1f] placeholder:text-[#8e8e93]"
                />

                <div className="mt-3">
                  <p className="flex items-center gap-1.5 text-[12px] font-medium text-[#6e6e73]">
                    <Camera className="h-3.5 w-3.5" />
                    附带现场实拍图（可点选演示图）
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {QUICK_PHOTOS.map((pic) => {
                      const picked = newPhoto === pic.url;
                      return (
                        <button
                          key={pic.label}
                          type="button"
                          onClick={() => setNewPhoto(picked ? undefined : pic.url)}
                          className={`ios-press flex items-center gap-2 rounded-full p-1 pr-3 text-[12px] font-medium ${
                            picked
                              ? "bg-[#1d1d1f] text-white"
                              : "bg-[#f2f2f7] text-[#1d1d1f]"
                          }`}
                        >
                          <img
                            src={pic.url}
                            alt={pic.label}
                            className="h-6 w-6 rounded-full object-cover"
                          />
                          {pic.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-black/[0.06] pt-4">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={newConfirmed}
                    onClick={() => setNewConfirmed((v) => !v)}
                    className="flex items-center gap-2.5 text-[13px] font-medium text-[#1d1d1f]"
                  >
                    <span
                      className={`relative inline-flex h-[26px] w-[44px] items-center rounded-full transition-colors ${
                        newConfirmed ? "bg-[#34c759]" : "bg-[#e5e5ea]"
                      }`}
                    >
                      <span
                        className={`inline-block h-[22px] w-[22px] rounded-full bg-white shadow transition-transform duration-200 ${
                          newConfirmed ? "translate-x-[20px]" : "translate-x-[2px]"
                        }`}
                      />
                    </span>
                    业主已当场签认
                  </button>

                  <button
                    type="submit"
                    disabled={!newSaid.trim()}
                    className="ios-press h-10 rounded-full bg-[#007aff] px-5 text-[13px] font-medium text-white disabled:opacity-40"
                  >
                    生成编号并归档
                  </button>
                </div>
              </form>
            )}

            {/* Timeline Feed */}
            {visibleNodes.length === 0 ? (
              <div className="liquid-glass-subtle rounded-[24px] px-6 py-12 text-center">
                <p className="text-[15px] font-medium text-[#1d1d1f]">该阶段还没有存证记录</p>
                <p className="mt-1 text-[13px] text-[#6e6e73]">
                  点击右上角「新增现场存证」，把现场沟通或验收照片实时归档。
                </p>
              </div>
            ) : (
              <ol className="space-y-3.5">
                {visibleNodes.map((node) => (
                  <li
                    key={node.id}
                    className="liquid-glass-subtle ios-card-hover rounded-[24px] p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[#007aff]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#007aff]">
                          {node.stage}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[12px] text-[#6e6e73] tabular-nums">
                          <Clock className="h-3.5 w-3.5" />
                          {formatWhen(node.at)}
                        </span>
                        <span className="text-[12px] text-[#8e8e93] tabular-nums">{node.code}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => onToggleConfirm(node.id)}
                        className={`ios-press inline-flex items-center gap-1 rounded-full px-3 py-1 text-[12px] font-medium ${
                          node.confirmed
                            ? "bg-[#34c759]/12 text-[#1d8a4e]"
                            : "bg-[#ff9500]/14 text-[#b26200]"
                        }`}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {node.confirmed ? "业主已确认" : "待确认 · 点此核验"}
                      </button>
                    </div>

                    <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-[17px] font-semibold text-[#1d1d1f]">{node.title}</h3>
                        <p className="mt-2 text-[14px] leading-6 text-[#1d1d1f]/90">{node.said}</p>

                        <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] text-[#6e6e73]">
                          <span>记录人：{node.by}</span>
                          <span>附件：{node.attachment}</span>
                          <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[#8e8e93]">
                            <Fingerprint className="h-3 w-3" />
                            {node.hash}
                          </span>
                        </div>
                      </div>

                      {node.photo && (
                        <img
                          src={node.photo}
                          alt={node.title}
                          className="h-28 w-full shrink-0 rounded-2xl object-cover sm:w-36"
                        />
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
