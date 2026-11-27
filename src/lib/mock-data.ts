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
        "【内部反击话术】竞品低价套餐常把“精装拆旧保护费、海棠角美缝、大板通铺人工费”藏在增项里。我们壹品坚持闭口合同，签约前把拆改清单列清，全房直管不转包。",
      cover_image: "/home/hall-white.jpg",
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
        "【内部反击话术】业主担心隐蔽工程时，直接打开我们自己的同小区工地：横平竖直水电 + 48小时闭水验收，邀约周末去看。",
      cover_image: "/home/hall-plaster.jpg",
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
        "【内部反击话术】刚需改善客对总价敏感，就拿我们的透明整装套餐讲：主材写进配置单，延期按天赔，先把总价对齐。",
      cover_image: "/home/hall-stone.jpg",
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
      after_image: "/home/hall-white.jpg",
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
      id: "mat-5",
      title: "我们和广佛竞品 · 谈单把报价单对齐",
      type: "competitor",
      visibility: "internal",
      community_name: "广佛本地",
      style: "仅员工可见",
      area_sqm: 0,
      budget_wan: 0,
      after_image:
        "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1400&q=85",
      content_json: {
        compare: {
          note: "我们就是壹品。左列是我们自己的美丽家、尊贵家，右边是业主常拿来比的报价结构，具体以对方当次书面报价单为准。这张表不要发到公域。",
          columns: [
            { key: "yipin", name: "我们", hint: "壹品整装", ours: true },
            { key: "dongjian", name: "东箭装饰", hint: "佛山本地连锁" },
            { key: "xingyi", name: "星艺装饰", hint: "设计型连锁" },
            { key: "liang", name: "靓家居配套", hint: "卖场主材 + 施工" },
            { key: "crew", name: "清包 / 游击队", hint: "本地散工" }
          ],
          rows: [
            {
              item: "报价方式",
              cells: {
                yipin: "美丽家 ¥79,800 起、尊贵家 ¥99,800 起，主材规格写进配置单",
                dongjian: "套餐分基础档和升级档，升级品牌通常另计",
                xingyi: "设计方案拆成工艺清单，按项报价",
                liang: "主材在卖场选，施工另外签",
                crew: "人工开口价，材料业主自己买"
              }
            },
            {
              item: "面积口径",
              cells: {
                yipin:
                  "美丽家按 80㎡，不足减 ¥598/㎡、超出加 ¥698/㎡；尊贵家 80–90㎡，不足减 ¥600/㎡、超出加 ¥1,200/㎡",
                dongjian: "按套餐面积段，超出面积另计",
                xingyi: "按实际工程量，不按一口价面积包干",
                liang: "没有整装面积包干价",
                crew: "没有统一面积口径"
              }
            },
            {
              item: "主材品牌",
              cells: {
                yipin: "配置单写死品牌和规格，假一罚十",
                dongjian: "套餐品牌和升级品牌分档",
                xingyi: "品牌可选，差价另计",
                liang: "卖场标价，活动价和结算价要核对",
                crew: "品牌和批次难追溯"
              }
            },
            {
              item: "水电质保",
              cells: {
                yipin: "水电终保，隐蔽工程留定位图",
                dongjian: "按合同年限保隐蔽工程",
                xingyi: "按合同年限保隐蔽工程",
                liang: "材料和施工分开保",
                crew: "多数没有书面终保"
              }
            },
            {
              item: "工期",
              cells: {
                yipin: "延期一天赔 100 元，写进合同",
                dongjian: "有合同工期，赔付以合同原文为准",
                xingyi: "有合同工期，赔付以合同原文为准",
                liang: "主材和施工衔接容易拉长",
                crew: "一般不锁完工日期"
              }
            },
            {
              item: "增项",
              cells: {
                yipin: "个性化项目先改单价，再写入清单，开工前说清",
                dongjian: "拆改、升级主材常在套餐外",
                xingyi: "效果图落地时工艺项容易增加",
                liang: "主材差价和施工增项分开加",
                crew: "开工后按天、按项加是常见结算方式"
              }
            },
            {
              item: "验收",
              cells: {
                yipin: "36 项不合格砸无赦，节点可写进证据链",
                dongjian: "公司标准验收",
                xingyi: "设计师和项目经理共同验收",
                liang: "材料商和施工队责任分开",
                crew: "没有固定节点验收"
              }
            },
            {
              item: "更适合",
              cells: {
                yipin: "要一口价、要清单、要售后的刚需和改善",
                dongjian: "认本地大品牌、接受升级加价的业主",
                xingyi: "重设计、预算可以浮动的业主",
                liang: "愿意自己逛卖场、能盯材料的业主",
                crew: "预算极低、业主自己监工"
              }
            }
          ]
        },
        sales_script:
          "哥/姐，广佛现在常见就这几类：东箭是本地套餐加升级，星艺是设计清单按项报价，靓家居是卖场材料加施工分开签，清包是人工开口价。我们壹品是美丽家 79,800 起、尊贵家 99,800 起，品牌规格写在配置单里。不比口号，把对方这份报价单和我们的配置单逐项对齐：面积怎么加、水电保几年、延期赔不赔、哪些项没写进合同。对齐完再看总价。",
        moments:
          "【内部】广佛竞品对照表已更新。谈单时不要只说我们更贵或更便宜，把美丽家 / 尊贵家配置单和对方报价单逐项对齐：面积口径、主材品牌、水电质保、延期赔付、增项是否先写进清单。本表仅员工使用，不要发到业主群以外。",
        xiaohongshu:
          "内部培训口径：业主拿东箭、星艺、靓家居或清包来比价时，先要对方书面报价单，再打开我们的配置单。对比面积加减价、主材是否写死、水电是否终保、延期是否按天赔、增项是否开工前写清。不要在公域点名贬低任何一家。",
        douyin:
          "15 秒内部话术：业主说别家更便宜，不要急着降价。先问报价单在不在。东箭看升级是否另计，星艺看工艺项是否拆开，靓家居看材料和施工是否两份合同，清包看有没有水电终保。我们把美丽家、尊贵家的品牌和加减价写在一张配置单上。"
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
      after_image: "/home/hall-olive.jpg",
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
      after_image: "/home/hall-plaster.jpg",
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
      after_image: "/home/hall-stone.jpg",
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
  现代奶油风: "/home/hall-cream.jpg",
  原木侘寂风: "/home/hall-plaster.jpg",
  意式极简风: "/home/hall-stone.jpg",
  中古法式风: "/home/hall-walnut.jpg"
};