import { NextRequest, NextResponse } from "next/server";
import { demoStore } from "@/lib/mock-data";

export async function GET(req: NextRequest) {
  const referrerId = (req.nextUrl.searchParams.get("referrer_id") || "").slice(0, 60);
  let list = demoStore.leads;
  if (referrerId) {
    list = list.filter((l) => l.referrer_id === referrerId);
  }
  return NextResponse.json({ mode: "demo", data: list });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const phone = String(body.customer_phone || "").trim().slice(0, 24);
  if (!phone) {
    return NextResponse.json({ error: "缺少客户手机号" }, { status: 400 });
  }

  const newLead = {
    id: `lead-${Date.now()}`,
    customer_phone: phone,
    customer_name: String(body.customer_name || "小程序意向业主").trim().slice(0, 40),
    community_name: String(body.community_name || "未填写小区").trim().slice(0, 80),
    area_sqm: Math.max(20, Math.min(1000, Number(body.area_sqm || 100) || 100)),
    target_style: String(body.target_style || "现代奶油风").trim().slice(0, 40),
    estimated_budget: String(body.estimated_budget || "12万 - 15万").trim().slice(0, 40),
    source_type: body.source_type || "quote_calc",
    referrer_id: String(body.referrer_id || "organic").trim().slice(0, 60),
    referrer_name: String(body.referrer_name || "自然流量/公海池").trim().slice(0, 60),
    status: "new" as const,
    created_at: new Date().toISOString()
  };

  demoStore.leads.unshift(newLead);
  if (demoStore.leads.length > 50) demoStore.leads.length = 50;
  return NextResponse.json({ mode: "demo", data: newLead });
}
