export type Visibility = "internal" | "public";

export interface Community {
  id: string;
  name: string;
  city: string;
  district: string;
  delivery_time: string;
  hot_layouts: string;
  pain_points: string;
  competitor_script?: string; // 仅 internal 视角可见
  cover_image: string;
  created_at?: string;
}

export interface MaterialContentJson {
  xiaohongshu?: string;
  douyin?: string;
  moments?: string;
  sales_script?: string;
  prompt_json?: Record<string, unknown>;
}

export interface Material {
  id: string;
  title: string;
  type: "case" | "before_after" | "poster" | "copywriting";
  visibility: Visibility;
  community_name: string;
  style: string;
  area_sqm: number;
  budget_wan: number;
  before_image?: string;
  after_image?: string;
  content_json: MaterialContentJson;
  published: boolean;
  created_by: string;
  created_at?: string;
}

export interface Lead {
  id: string;
  customer_phone: string;
  customer_name: string;
  community_name: string;
  area_sqm: number;
  target_style: string;
  estimated_budget: string;
  source_type: "quote_calc" | "community_unlock" | "case_detail";
  referrer_id: string;
  referrer_name: string;
  status: "new" | "following" | "visited" | "signed";
  created_at: string;
}
