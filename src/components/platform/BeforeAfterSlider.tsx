"use client";

import React, { useRef, useState } from "react";
import { MoveHorizontal } from "lucide-react";

type Props = {
  beforeUrl: string;
  afterUrl: string;
  title: string;
  compact?: boolean;
};

export default function BeforeAfterSlider({ beforeUrl, afterUrl, title, compact }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [percent, setPercent] = useState(52);
  const [dragging, setDragging] = useState(false);

  function updateFromClientX(clientX: number) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const next = Math.max(4, Math.min(96, ((clientX - rect.left) / rect.width) * 100));
    setPercent(Math.round(next));
  }

  return (
    <div className="space-y-3">
      <div
        ref={containerRef}
        onPointerDown={(event) => {
          setDragging(true);
          (event.currentTarget as HTMLDivElement).setPointerCapture(event.pointerId);
          updateFromClientX(event.clientX);
        }}
        onPointerMove={(event) => {
          if (!dragging) return;
          updateFromClientX(event.clientX);
        }}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
        className={`relative w-full select-none overflow-hidden rounded-2xl bg-[#1d1d1f] touch-none cursor-ew-resize ${
          compact ? "aspect-[4/3]" : "aspect-[16/9]"
        }`}
      >
        <img
          src={afterUrl}
          alt={`${title} 改造后`}
          draggable={false}
          className="h-full w-full object-cover"
        />
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - percent}% 0 0)` }}
        >
          <img
            src={beforeUrl}
            alt={`${title} 改造前`}
            draggable={false}
            className="h-full w-full object-cover"
          />
        </div>

        <span className="apple-glass-dark pointer-events-none absolute left-3.5 top-3.5 rounded-full px-3 py-1 text-[12px] font-medium text-white">
          改造前
        </span>
        <span className="apple-glass-dark pointer-events-none absolute right-3.5 top-3.5 rounded-full px-3 py-1 text-[12px] font-medium text-white">
          实景交付
        </span>

        <div
          className="pointer-events-none absolute inset-y-0 w-[2px] bg-white/95"
          style={{ left: `${percent}%` }}
        >
          <div className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#1d1d1f] shadow-md">
            <MoveHorizontal className="h-4 w-4" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 px-1">
        <span className="text-[12px] text-[#6e6e73]">左右拖动对比毛坯与实景交付</span>
        <input
          type="range"
          min={4}
          max={96}
          value={percent}
          aria-label="拖动对比改造前后"
          onChange={(event) => setPercent(Number(event.target.value))}
          className="h-1 w-32 accent-[#1d1d1f]"
        />
      </div>
    </div>
  );
}
