"use client";

import React, { useEffect } from "react";
import { Check, Layers, Monitor, Smartphone, X } from "lucide-react";
import { MODULES, ModuleId, PRESETS, PresetId, ViewMode } from "@/lib/platform";

type Props = {
  open: boolean;
  preset: PresetId;
  enabled: ModuleId[];
  view: ViewMode;
  showDeviceSwitch: boolean;
  onClose: () => void;
  onPreset: (id: Exclude<PresetId, "custom">) => void;
  onToggle: (id: ModuleId) => void;
  onView: (view: ViewMode) => void;
};

export default function FrameworkDrawer({
  open,
  preset,
  enabled,
  view,
  showDeviceSwitch,
  onClose,
  onPreset,
  onToggle,
  onView
}: Props) {
  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center overflow-hidden overscroll-contain bg-black/30 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="定制平台功能框架"
        onClick={(event) => event.stopPropagation()}
        onWheel={(event) => event.stopPropagation()}
        className="animate-ios-sheet liquid-glass flex max-h-[88vh] w-full max-w-[640px] flex-col overflow-hidden rounded-t-[32px] sm:rounded-[32px]"
      >
        <div className="flex items-center justify-between border-b border-black/[0.06] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#007aff]/10 text-[#007aff]">
              <Layers className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-[17px] font-semibold text-[#1d1d1f]">定制员工平台框架</h2>
              <p className="text-[12px] text-[#6e6e73]">
                自由勾选第一期要上线的小程序模块，页面实时生效
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="ios-press flex h-8 w-8 items-center justify-center rounded-full bg-black/[0.06] text-[#1d1d1f]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5 space-y-6">
          {showDeviceSwitch && (
            <div className="flex items-center justify-between rounded-2xl bg-black/[0.04] p-3">
              <div>
                <p className="text-[14px] font-semibold text-[#1d1d1f]">双端预览形态</p>
                <p className="text-[12px] text-[#6e6e73]">
                  一套架构同时适配电脑桌面与微信小程序
                </p>
              </div>
              <div className="inline-flex rounded-full bg-white/80 p-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => onView("desk")}
                  className={`ios-press inline-flex h-8 items-center gap-1.5 rounded-full px-3.5 text-[12px] font-medium ${
                    view === "desk" ? "bg-[#1d1d1f] text-white" : "text-[#6e6e73]"
                  }`}
                >
                  <Monitor className="h-3.5 w-3.5" />
                  电脑版
                </button>
                <button
                  type="button"
                  onClick={() => onView("phone")}
                  className={`ios-press inline-flex h-8 items-center gap-1.5 rounded-full px-3.5 text-[12px] font-medium ${
                    view === "phone" ? "bg-[#1d1d1f] text-white" : "text-[#6e6e73]"
                  }`}
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  小程序
                </button>
              </div>
            </div>
          )}

          {/* Presets */}
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-wider text-[#6e6e73]">
              推荐版本组合
            </p>
            <div className="mt-2.5 grid gap-2.5 sm:grid-cols-3">
              {PRESETS.map((item) => {
                const active = preset === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onPreset(item.id)}
                    className={`ios-press rounded-2xl p-3.5 text-left ${
                      active
                        ? "bg-[#1d1d1f] text-white"
                        : "bg-white/80 text-[#1d1d1f] hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[14px] font-semibold">{item.label}</span>
                      {active && <Check className="h-4 w-4 text-[#30d158]" />}
                    </div>
                    <p
                      className={`mt-1 text-[11px] ${
                        active ? "text-white/75" : "text-[#007aff]"
                      }`}
                    >
                      {item.short}
                    </p>
                    <p
                      className={`mt-2 text-[12px] leading-5 ${
                        active ? "text-white/70" : "text-[#6e6e73]"
                      }`}
                    >
                      {item.detail}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Individual iOS Switch Module List */}
          <div>
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-semibold uppercase tracking-wider text-[#6e6e73]">
                细项模块开关（已选 {enabled.length}/{MODULES.length}）
              </p>
              {preset === "custom" && (
                <span className="rounded-full bg-[#007aff]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#007aff]">
                  自定义组合
                </span>
              )}
            </div>

            <div className="mt-2.5 divide-y divide-black/[0.06] overflow-hidden rounded-2xl bg-white/85">
              {MODULES.map((item) => {
                const on = enabled.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4 px-4 py-3.5"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-semibold text-[#1d1d1f]">
                          {item.label}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            item.tag === "核心"
                              ? "bg-[#007aff]/10 text-[#007aff]"
                              : item.tag === "推荐"
                                ? "bg-[#34c759]/12 text-[#1d8a4e]"
                                : "bg-black/[0.05] text-[#6e6e73]"
                          }`}
                        >
                          {item.tag}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[12px] leading-5 text-[#6e6e73]">{item.blurb}</p>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={on}
                      aria-label={`开关 ${item.label}`}
                      onClick={() => onToggle(item.id)}
                      className={`ios-press relative inline-flex h-[28px] w-[48px] shrink-0 items-center rounded-full transition-colors ${
                        on ? "bg-[#34c759]" : "bg-[#e5e5ea]"
                      }`}
                    >
                      <span
                        className={`inline-block h-[24px] w-[24px] rounded-full bg-white shadow-sm transition-transform duration-200 ${
                          on ? "translate-x-[22px]" : "translate-x-[2px]"
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-black/[0.06] px-6 py-4">
          <span className="text-[12px] text-[#6e6e73]">选定框架后可直接对接后端与微信小程序打包</span>
          <button
            type="button"
            onClick={onClose}
            className="ios-press h-10 rounded-full bg-[#007aff] px-6 text-[14px] font-medium text-white"
          >
            完成并预览
          </button>
        </div>
      </div>
    </div>
  );
}
