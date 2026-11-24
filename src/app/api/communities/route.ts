import { NextRequest, NextResponse } from "next/server";
import { demoStore } from "@/lib/mock-data";

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85";

function safeHttpsUrl(value: unknown, fallback: string) {
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
  const keyword = (req.nextUrl.searchParams.get("q") || "").trim().slice(0, 80);

  let list = demoStore.communities;
  if (keyword) {
    list = list.filter((c) => c.name.includes(keyword) || c.district.includes(keyword));
  }
  const sanitized = list.map((item) => {
    if (scope === "public") {
      const { competitor_script, ...publicFields } = item;
      return publicFields;
    }
    return item;
  });
  return NextResponse.json({ mode: "demo", data: sanitized });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const payload = {
    name: String(body.name || "").trim().slice(0, 80),
    city: String(body.city || "佛山").trim().slice(0, 40),
    district: String(body.district || "核心板块").trim().slice(0, 60),
    delivery_time: String(body.delivery_time || "热装交付中").trim().slice(0, 60),
    hot_layouts: String(body.hot_layouts || "98㎡三房 / 128㎡四房").trim().slice(0, 120),
    pain_points: String(body.pain_points || "").trim().slice(0, 600),
    competitor_script: String(body.competitor_script || "").trim().slice(0, 600),
    cover_image: safeHttpsUrl(body.cover_image, DEFAULT_COVER)
  };

  if (!payload.name) {
    return NextResponse.json({ error: "请输入小区名称" }, { status: 400 });
  }

  const newItem = {
    id: `comm-${Date.now()}`,
    ...payload,
    created_at: new Date().toISOString()
  };
  demoStore.communities.unshift(newItem);
  if (demoStore.communities.length > 50) demoStore.communities.length = 50;
  return NextResponse.json({ mode: "demo", data: newItem });
}
