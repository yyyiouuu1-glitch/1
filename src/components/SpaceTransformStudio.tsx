"use client";

import React, { useState } from "react";
import { Upload, Sparkles, Check, Send, Code2, Loader2 } from "lucide-react";
import { buildSpaceTransformJsonPrompt } from "@/lib/prompts";

interface SpaceStudioProps {
  onPublished: () => void;
}

const STYLES = ["现代奶油风", "原木侘寂风", "意式极简风", "中古法式风"];
const LIGHTINGS = ["3000K 温馨暖光", "4000K 自然暖白", "5000K 清透日光"];

const DEFAULT_BEFORE =
  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1400&q=80";
const DEFAULT_AFTER = "/home/hall-white.jpg";

export default function SpaceTransformStudio({ onPublished }: SpaceStudioProps) {
  const [beforeImg, setBeforeImg] = useState(DEFAULT_BEFORE);
  const [afterImg, setAfterImg] = useState(DEFAULT_AFTER);
  const [slider, setSlider] = useState(50);
  const [style, setStyle] = useState("现代奶油风");
  const [lighting, setLighting] = useState("4000K 自然暖白");
  const [structureLock, setStructureLock] = useState(85);
  const [communityName, setCommunityName] = useState("保利天珺");
  const [showJson, setShowJson] = useState(false);

  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [publishing, setPublishing] = useState(false);
  const [toast, setToast] = useState("");

  const promptJson = buildSpaceTransformJsonPrompt({
    style,
    lighting,
    structureLock,
    roomType: "客餐厅全景"
  });

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setBeforeImg(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setProgress(15);
    setToast("");

    try {
      const res = await fetch("/api/ai/transform-space", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          style,
          lighting,
          structureLock,
          roomType: "客餐厅全景",
          sourceImage: beforeImg
        })
      });
      const data = await res.json();
      const taskId = data.task_id;

      // 异步轮询进度（模拟真实生图任务队列）
      const timer = setInterval(async () => {
        const pollRes = await fetch(`/api/ai/task/${taskId}`);
        const task = await pollRes.json();
        setProgress(task.progress || 50);
        if (task.status === "completed") {
          clearInterval(timer);
          if (task.result_image_url) setAfterImg(task.result_image_url);
          setGenerating(false);
          setToast(`已按「${style}」完成结构锁定渲染`);
        }
      }, 650);
    } catch {
      setGenerating(false);
      setToast("生成失败，请检查网络或后端接口");
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      await fetch("/api/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${communityName} ${style} 实景变装对比`,
          type: "before_after",
          visibility: "public",
          community_name: communityName,
          style,
          area_sqm: 120,
          budget_wan: 15.8,
          before_image: beforeImg.startsWith("data:") ? DEFAULT_BEFORE : beforeImg,
          after_image: afterImg,
          content_json: { prompt_json: promptJson },
          published: true
        })
      });
      onPublished();
      setToast("已同步至小程序（业主端灵感页 + 员工端物料库）");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-yipin-red">
            AI Space Studio
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-apple-text">
            毛坯 / 老房空间变装
          </h1>
          <p className="mt-1.5 text-sm text-apple-muted">
            拖动中间滑块对比前后效果，系统自动生成结构化 JSON 控图参数并走异步队列出图。
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-apple-surface px-4 py-2.5 text-xs font-medium text-apple-text transition hover:bg-black/[0.07]">
            <Upload className="h-4 w-4" />
            上传本地毛坯图
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
          </label>
          <button
            onClick={handlePublish}
            disabled={publishing}
            className="inline-flex items-center gap-2 rounded-full bg-yipin-red px-5 py-2.5 text-xs font-medium text-white transition hover:bg-yipin-redHover disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
            {publishing ? "同步中..." : "一键推送小程序"}
          </button>
        </div>
      </div>

      {/* Interactive Before/After Canvas */}
      <div className="relative h-[460px] w-full select-none overflow-hidden rounded-[28px] bg-apple-surface shadow-apple">
        <img
          src={afterImg}
          alt="改造后效果图"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - slider}% 0 0)` }}
        >
          <img
            src={beforeImg}
            alt="改造前实拍"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Labels */}
        <span className="absolute left-5 top-5 rounded-full bg-black/55 px-3.5 py-1 text-xs font-medium text-white backdrop-blur-md">
          Before · 毛坯实拍
        </span>
        <span className="absolute right-5 top-5 rounded-full bg-white/85 px-3.5 py-1 text-xs font-medium text-apple-text backdrop-blur-md">
          After · 壹品整装 {style}
        </span>

        {/* Divider */}
        <div
          className="pointer-events-none absolute bottom-0 top-0 w-0.5 bg-white shadow"
          style={{ left: `${slider}%` }}
        >
          <div className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-xs font-bold text-apple-text shadow-lg">
            ⇄
          </div>
        </div>

        <input
          type="range"
          min={5}
          max={95}
          value={slider}
          onChange={(e) => setSlider(Number(e.target.value))}
          aria-label="对比滑块"
          className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
        />

        {generating && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/45 text-white backdrop-blur-sm">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="mt-3 text-sm font-medium">异步队列渲染中 · {progress}%</p>
            <p className="mt-1 text-xs text-white/75">
              锁定门窗承重结构 ({structureLock}%) · 去除人工 AI 塑料感
            </p>
          </div>
        )}
      </div>

      {/* Apple Floating Control Bar */}
      <div className="rounded-[24px] bg-apple-surface p-6 space-y-5">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-12 md:items-center">
          <div className="md:col-span-5">
            <label className="text-xs font-medium text-apple-muted">目标风格</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {STYLES.map((s) => (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  className={`rounded-full px-4 py-2 text-xs font-medium transition ${
                    style === s
                      ? "bg-apple-text text-white"
                      : "bg-white text-apple-text hover:bg-black/[0.04]"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-4">
            <label className="text-xs font-medium text-apple-muted">光影色温</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {LIGHTINGS.map((l) => (
                <button
                  key={l}
                  onClick={() => setLighting(l)}
                  className={`rounded-full px-3 py-2 text-xs font-medium transition ${
                    lighting === l
                      ? "bg-apple-text text-white"
                      : "bg-white text-apple-text hover:bg-black/[0.04]"
                  }`}
                >
                  {l.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-apple-muted">结构锁定强度</span>
              <span className="font-semibold text-apple-text">{structureLock}%</span>
            </div>
            <input
              type="range"
              min={50}
              max={100}
              value={structureLock}
              onChange={(e) => setStructureLock(Number(e.target.value))}
              className="mt-3 w-full accent-apple-text"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-black/[0.06] pt-4">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={communityName}
              onChange={(e) => setCommunityName(e.target.value)}
              placeholder="关联小区名"
              className="w-40 rounded-full bg-white px-4 py-2 text-xs text-apple-text outline-none ring-1 ring-black/10 focus:ring-apple-text"
            />
            <button
              onClick={() => setShowJson(!showJson)}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-medium text-apple-muted hover:text-apple-text"
            >
              <Code2 className="h-3.5 w-3.5" />
              {showJson ? "收起 JSON 提示词" : "查看 JSON 提示词"}
            </button>
          </div>

          <div className="flex items-center gap-3">
            {toast && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                <Check className="h-3.5 w-3.5" />
                {toast}
              </span>
            )}
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="inline-flex items-center gap-2 rounded-full bg-apple-text px-6 py-2.5 text-xs font-medium text-white transition hover:bg-black/85 disabled:opacity-50"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {generating ? "渲染中..." : "开始 AI 异步变装"}
            </button>
          </div>
        </div>

        {showJson && (
          <pre className="max-h-72 overflow-auto rounded-2xl bg-[#1D1D1F] p-5 text-xs leading-relaxed text-emerald-300">
            {JSON.stringify(promptJson, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
