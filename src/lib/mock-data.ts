import { Community, Lead, Material } from "./types";

export const demoStore: {
  communities: Community[];
  materials: Material[];
  leads: Lead[];
  tasks: Record<
    string,
    {
      id: string;
      status: "queued" | "processing" | "completed" | "failed";
      progress: number;
      result_image_url?: string;
      created_at: number;
      style: string;
    }
  >;
} = {
  communities: [
    {
      id: "comm-1",
      name: "保利天珺",
      city: "佛山",
      district: "千灯湖板块",
      delivery_time: "2026年Q4集中交付",
      hot_layouts: "118㎡四房 / 143㎡改善四房",
      pain_points:
        "1. 精装交付阳台隔断显压抑，建议打通并入客厅做全景落地窗；2. 原配深色门框与现代奶油/原木风不搭，建议做极简隐形套口；3. 厨房采光偏弱，推荐半开放式岛台+超白长虹玻璃联动门。",
      competitor_script:
        "【内部反击话术】竞品低价套餐常把“精装拆旧保护费、海棠角美缝、大板通铺人工费”藏在增项里。壹品整装坚持闭口合同，签约前把拆改清单列清，全房德系工艺直管不转包。",
      cover_image:
        "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85",
      created_at: new Date().toISOString()
    },
    {
      id: "comm-2",
      name: "中海寰宇天下",
      city: "佛山",
      district: "桂城",
      delivery_time: "热装改善盘",
      hot_layouts: "98㎡三房 / 125㎡四房",
      pain_points:
        "1. 入户玄关偏窄，鞋柜深度不足，可向非承重墙借位15cm做满墙悬浮玄关柜；2. 次卧面积紧凑，一体化榻榻米+书桌可多出4㎡储物空间。",
      competitor_script:
        "【内部反击话术】针对业主担心的隐蔽工程问题，直接展示壹品整装同小区工地实拍：横平竖直水电工艺 + 48小时闭水验收记录，邀约周末看实景工地。",
      cover_image:
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85",
      created_at: new Date().toISOString()
    },
    {
      id: "comm-3",
      name: "万科金域中央",
      city: "佛山",
      district: "禅城/南海交界",
      delivery_time: "次新房翻新热盘",
      hot_layouts: "89㎡三房 / 108㎡三房",
      pain_points:
        "1. 客餐厅偏长，做无主灯+弧形吊顶可弱化横梁压迫感；2. 卫生间未做干湿分离，外移洗手台后早高峰使用效率翻倍。",
      competitor_script:
        "【内部反击话术】刚需改善客对总价敏感，主打壹品整装透明整装套餐，对比 ENF 级环保主材与工期延误赔付承诺，打消预算超支焦虑。",
      cover_image:
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85",
      created_at: new Date().toISOString()
    }
  ],
  materials: [
    {
      id: "mat-1",
      title: "保利天珺 128㎡ 现代奶油风实景变装",
      type: "before_after",
      visibility: "public",
      community_name: "保利天珺",
      style: "现代奶油风",
      area_sqm: 128,
      budget_wan: 16.8,
      before_image:
        "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80",
      after_image:
        "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85",
      content_json: {
        xiaohongshu:
          "佛山保利天珺128㎡｜打通阳台后，奶油风客厅像开了柔光滤镜✨\n全屋柔光砖通铺+极简双眼皮吊顶，16.8w全包落地，所见即所得！评论区扣【128】发你同小区报价清单👇",
        douyin:
          "【0-3秒钩子】保利天珺128㎡的业主注意！客厅千万别再做复杂背景墙了！\n【痛点】打通阳台并入客厅，显大至少15平。\n【转化】点左下角测算壹品整装同款落地价！",
        moments:
          "【壹品整装·实景交付】保利天珺128㎡现代奶油风毕业照！把预算花在采光、收纳和环保主材上。同小区业主私信预约，免费领户型优化方案一份🏠",
        sales_script:
          "哥/姐您好，这是我们壹品整装刚完工的保利天珺128㎡奶油风实景，阳台打通后采光非常通透，造价16.8万全包。发您参考，周末可以约您去同小区在建工地看看工艺~"
      },
      published: true,
      created_by: "企划部",
      created_at: new Date().toISOString()
    },
    {
      id: "mat-2",
      title: "壹品整装·跨年保价样板房征集海报包",
      type: "poster",
      visibility: "public",
      community_name: "广佛全城通用",
      style: "意式极简",
      area_sqm: 110,
      budget_wan: 13.5,
      before_image:
        "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80",
      after_image:
        "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=85",
      content_json: {
        xiaohongshu:
          "广佛装修先别急着定！壹品整装跨年保价样板房征集开启🔥锁定今年工价不涨价，前20户享一线主材免费升级！",
        douyin:
          "年底签装修到底是省钱还是踩坑？30秒看懂壹品整装保价协议的核心3条！",
        moments:
          "🔥【壹品整装·保价跨年季】今年定装修，明年不涨价！工程直管零转包，广佛限额征集20套样板房，扫码10秒测算你家报价👉",
        sales_script:
          "您好，我们壹品整装跨年保价样板房名额刚放出来，现在定下来明年开工按今年材料价结算，能省出不少预算，我把详细权益清单发您看看？"
      },
      published: true,
      created_by: "企划部",
      created_at: new Date().toISOString()
    },
    {
      id: "mat-3",
      title: "中海寰宇天下 98㎡ 原木侘寂风实景交付",
      type: "case",
      visibility: "public",
      community_name: "中海寰宇天下",
      style: "原木侘寂风",
      area_sqm: 98,
      budget_wan: 12.6,
      before_image:
        "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80",
      after_image:
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85",
      content_json: {
        xiaohongshu:
          "中海寰宇天下98㎡｜向非承重墙借15cm，入户多出整面悬浮玄关柜。次卧一体榻榻米+书桌，三房住出四房收纳感。",
        douyin:
          "98平刚需三房怎么装最显大？看中海寰宇天下这套原木侘寂实景交付，12.6万全包落地。",
        moments:
          "【实景交付】中海寰宇天下 98㎡ 原木侘寂风完工，全屋 ENF 级环保主材，48小时闭水验收一次通过。",
        sales_script:
          "这套是我们刚交付的中海寰宇天下 98㎡ 原木风，入户玄关借位做了满墙鞋柜，次卧做了一体化榻榻米，总造价 12.6 万全包，我把实拍发您参考。"
      },
      published: true,
      created_by: "设计一部",
      created_at: new Date().toISOString()
    },
    {
      id: "mat-4",
      title: "万科金域中央 108㎡ 意式极简翻新实录",
      type: "before_after",
      visibility: "public",
      community_name: "万科金域中央",
      style: "意式极简风",
      area_sqm: 108,
      budget_wan: 14.2,
      before_image:
        "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80",
      after_image:
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85",
      content_json: {
        xiaohongshu:
          "万科金域中央108㎡次新房翻新｜无主灯+弧形吊顶收掉客餐厅大梁，洗手台外移干湿分离，早高峰彻底不排队。",
        douyin:
          "客餐厅横梁压顶怎么救？这套万科金域中央108㎡实景给你标准答案。",
        moments:
          "万科金域中央 108㎡ 意式极简实景交付，老房翻新零增项闭口合同，工期按天节点验收。",
        sales_script:
          "哥/姐，万科金域中央 108㎡ 客餐厅有横梁的问题我们做过很多套了，用无主灯加弧形吊顶收掉最显层高，这是刚完工的实拍，总价 14.2 万。"
      },
      published: true,
      created_by: "工程企划组",
      created_at: new Date().toISOString()
    }
  ],
  leads: [
    {
      id: "lead-1",
      customer_phone: "1392856****",
      customer_name: "张先生",
      community_name: "保利天珺",
      area_sqm: 128,
      target_style: "现代奶油风",
      estimated_budget: "15.8万 - 17.5万",
      source_type: "quote_calc",
      referrer_id: "staff_lin",
      referrer_name: "林顾问（网销部）",
      status: "new",
      created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString()
    },
    {
      id: "lead-2",
      customer_phone: "1370291****",
      customer_name: "陈女士",
      community_name: "中海寰宇天下",
      area_sqm: 98,
      target_style: "原木侘寂风",
      estimated_budget: "11.5万 - 13.2万",
      source_type: "community_unlock",
      referrer_id: "staff_chen",
      referrer_name: "陈设计师（设计部）",
      status: "following",
      created_at: new Date(Date.now() - 1000 * 60 * 55).toISOString()
    },
    {
      id: "lead-3",
      customer_phone: "1380921****",
      customer_name: "周先生",
      community_name: "万科金域中央",
      area_sqm: 108,
      target_style: "意式极简风",
      estimated_budget: "13.8万 - 15.0万",
      source_type: "case_detail",
      referrer_id: "staff_lin",
      referrer_name: "林顾问（网销部）",
      status: "visited",
      created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString()
    }
  ],
  tasks: {}
};

export const STYLE_PREVIEW_IMAGES: Record<string, string> = {
  现代奶油风:
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=85",
  原木侘寂风:
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85",
  意式极简风:
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=85",
  中古法式风:
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=85"
};