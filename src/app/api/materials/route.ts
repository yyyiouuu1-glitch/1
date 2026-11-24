import { NextRequest, NextResponse } from "next/server";
import { demoStore } from "@/lib/mock-data";
import { Material } from "@/lib/types";

const DEFAULT_AFTER =
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85";

function safeHttpsUrl(value: unknown, fallback?: string): string | undefined {
  if (typeof value !== "string" || !value.trim()) return fallback;
  try {
    const parsed = new URL(value.trim());
    if (parsed.protocol === "https:") return parsed.toString();
  } catch {
    /* fallback */
  }
  return fallback;
}

export async function GET(req: NextRequest) {
  const scope = req.nextUrl.searchParams.get("scope") || "internal";
  const publishedOnly = req.nextUrl.searchParams.get("published") === "true";

  let list = demoStore.materials;
  if (scope === "public") {
    list = list.filter((m) => m.visibility === "public" && m.published);
  } else if (publishedOnly) {
    list = list.filter((m) => m.published);
  }
  return NextResponse.json({ mode: "demo", data: list });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const payload: Omit<Material, "id" | "created_at"> = {
    title: String(body.title || "壹品整装精选案例").trim().slice(0, 100),
    type: body.type || "copywriting",
    visibility: body.visibility === "public" ? "public" : "internal",
    community_name: String(body.community_name || "广佛精选楼盘").trim().slice(0, 80),
    style: String(body.style || "现代奶油风").trim().slice(0, 40),
    area_sqm: Math.max(20, Math.min(1000, Number(body.area_sqm || 110) || 110)),
    budget_wan: Math.max(1, Math.min(500, Number(body.budget_wan || 14.8) || 14.8)),
    before_image: safeHttpsUrl(body.before_image),
    after_image: safeHttpsUrl(body.after_image, DEFAULT_AFTER),
    content_json: typeof body.content_json === "object" && body.content_json ? body.content_json : {},
    published: Boolean(body.published ?? true),
    created_by: String(body.created_by || "企划部").trim().slice(0, 40)
  };

  const newMat: Material = {
    id: `mat-${Date.now()}`,
    ...payload,
    created_at: new Date().toISOString()
  };
  demoStore.materials.unshift(newMat);
  if (demoStore.materials.length > 50) demoStore.materials.length = 50;
  return NextResponse.json({ mode: "demo", data: newMat });
}
