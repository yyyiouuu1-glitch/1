"use client";

import React from "react";
import { RefreshCw, UserCheck } from "lucide-react";
import { Lead } from "@/lib/types";

interface Props {
  leads: Lead[];
  onRefresh: () => void;
}

const SOURCE_LABELS: Record<string, string> = {
  quote_calc: "10秒报价器留资",
  community_unlock: "同小区方案解锁",
  case_detail: "案例同款预约"
};

export default function LeadsDashboard({ leads, onRefresh }: Props) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12 space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-yipin-red">
            Attribution Funnel
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-apple-text">
            小程序业主留资与归因看板
          </h1>
          <p className="mt-1.5 text-sm text-apple-muted">
            实时接收来自微信小程序业主端的报价与预约线索，自动绑定分享员工（referrer_id）。
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="inline-flex items-center gap-2 rounded-full bg-apple-surface px-4 py-2 text-xs font-medium text-apple-text hover:bg-black/[0.07]"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          刷新线索
        </button>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-black/[0.06] bg-white shadow-apple">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-black/[0.06] bg-apple-surface text-xs text-apple-muted">
              <tr>
                <th className="px-6 py-4 font-medium">意向业主</th>
                <th className="px-6 py-4 font-medium">楼盘 / 面积 / 风格</th>
                <th className="px-6 py-4 font-medium">测算预算</th>
                <th className="px-6 py-4 font-medium">留资入口</th>
                <th className="px-6 py-4 font-medium">归因员工</th>
                <th className="px-6 py-4 font-medium">状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-apple-surface/40">
                  <td className="px-6 py-4">
                    <div className="font-medium text-apple-text">{lead.customer_name}</div>
                    <div className="text-xs text-apple-muted">{lead.customer_phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-apple-text">{lead.community_name}</div>
                    <div className="text-xs text-apple-muted">
                      {lead.area_sqm}㎡ · {lead.target_style}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-apple-text">
                    {lead.estimated_budget}
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-apple-surface px-3 py-1 text-xs text-apple-text">
                      {SOURCE_LABELS[lead.source_type] || lead.source_type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-apple-text">
                      <UserCheck className="h-3.5 w-3.5 text-yipin-red" />
                      {lead.referrer_name}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {lead.status === "new" ? (
                      <span className="rounded-full bg-yipin-soft px-2.5 py-1 text-xs font-semibold text-yipin-red">
                        待跟进 NEW
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                        跟进中
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
