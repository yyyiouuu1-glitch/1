import { NextRequest, NextResponse } from "next/server";
import { demoStore } from "@/lib/mock-data";
import { buildSpaceTransformJsonPrompt } from "@/lib/prompts";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const style = String(body.style || "现代奶油风").trim().slice(0, 40);
  const lighting = String(body.lighting || "4000K 自然暖白").trim().slice(0, 40);
  const structureLock = Math.max(50, Math.min(100, Number(body.structureLock || 85) || 85));
  const roomType = String(body.roomType || "客餐厅全景").trim().slice(0, 40);

  const promptJson = buildSpaceTransformJsonPrompt({
    style,
    lighting,
    structureLock,
    roomType
  });

  const taskId = `task_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  // Bound in-memory task map size
  const keys = Object.keys(demoStore.tasks);
  if (keys.length >= 30) {
    delete demoStore.tasks[keys[0]];
  }

  demoStore.tasks[taskId] = {
    id: taskId,
    status: "queued",
    progress: 15,
    created_at: Date.now(),
    style
  };

  return NextResponse.json({
    task_id: taskId,
    status: "queued",
    prompt_json: promptJson,
    source_received: Boolean(body.sourceImage)
  });
}
