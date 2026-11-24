import { NextRequest, NextResponse } from "next/server";
import { demoStore, STYLE_PREVIEW_IMAGES } from "@/lib/mock-data";

// 异步任务轮询接口
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const task = demoStore.tasks[params.id];
  if (!task) {
    return NextResponse.json({ error: "任务不存在或已过期" }, { status: 404 });
  }

  const elapsed = Date.now() - task.created_at;
  if (elapsed < 1200) {
    task.status = "processing";
    task.progress = 42;
  } else if (elapsed < 2400) {
    task.status = "processing";
    task.progress = 78;
  } else {
    task.status = "completed";
    task.progress = 100;
    task.result_image_url =
      STYLE_PREVIEW_IMAGES[task.style] || STYLE_PREVIEW_IMAGES["现代奶油风"];
  }

  return NextResponse.json(task);
}
