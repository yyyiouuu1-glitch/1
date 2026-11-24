import { Community } from "./types";

export type ModuleId =
  | "library"
  | "close"
  | "evidence"
  | "sites"
  | "communities"
  | "leads"
  | "copy"
  | "space";

export type PresetId = "field" | "studio" | "full" | "custom";
export type ViewMode = "phone" | "desk";
export type ScreenId = "today" | "more" | ModuleId;

export type EvidenceStage =
  | "需求沟通"
  | "现场量房"
  | "方案报价"
  | "合同签单"
  | "隐蔽验收"
  | "竣工交付";

export const EVIDENCE_STAGES: EvidenceStage[] = [
  "需求沟通",
  "现场量房",
  "方案报价",
  "合同签单",
  "隐蔽验收",
  "竣工交付"
];

export type EvidenceNode = {
  id: string;
  code: string;
  hash: string;
  stage: EvidenceStage;
  leadId: string;
  customerName: string;
  at: string;
  title: string;
  said: string;
  by: string;
  attachment: string;
  photo?: string;
  confirmed: boolean;
  confirmChannel?: string;
};

export type Talk = {
  budget: string;
  craft: string;
  schedule: string;
};

export type ObjectionCard = {
  id: string;
  topic: string;
  question: string;
  reply: string;
  proof: string;
};

export type AddonCategory = "拆改土建" | "水电暖通" | "泥木油工艺" | "定制与升级";

export const ADDON_CATEGORIES: AddonCategory[] = [
  "拆改土建",
  "水电暖通",
  "泥木油工艺",
  "定制与升级"
];

export type QuoteAddon = {
  id: string;
  category: AddonCategory;
  label: string;
  unit: string;
  unitPrice: number;
  defaultQty: number;
  note: string;
};

export type SiteBroadcast = {
  id: string;
  community: string;
  unit: string;
  areaSqm: number;
  stage: string;
  progress: number;
  manager: string;
  updatedAt: string;
  highlight: string;
  checks: string[];
  photo: string;
  canVisit: boolean;
};

export const MODULES: {
  id: ModuleId;
  label: string;
  nav: string;
  tag: "核心" | "推荐" | "扩展";
  blurb: string;
  legacy?: boolean;
}[] = [
  {
    id: "library",
    label: "公司素材库",
    nav: "素材库",
    tag: "核心",
    blurb: "高清实景、改造前后拖动对比、工艺实拍与海报，一键发给业主。"
  },
  {
    id: "close",
    label: "赋能签单台",
    nav: "签单台",
    tag: "核心",
    blurb: "对客演示/内部口径双模式、10秒闭口报价器、异议反击库与当场留痕。"
  },
  {
    id: "evidence",
    label: "全流程证据链",
    nav: "证据链",
    tag: "核心",
    blurb: "6阶段存证档案、实拍留痕、业主确认状态与一键微信确认函。"
  },
  {
    id: "sites",
    label: "同小区工地",
    nav: "看工地",
    tag: "推荐",
    blurb: "水电/泥木实景巡检播报，顾问可一键邀约业主周末实地看工艺。"
  },
  {
    id: "communities",
    label: "楼盘情报库",
    nav: "楼盘",
    tag: "扩展",
    blurb: "热门交付楼盘户型痛点、交付时间与竞品反击策略。",
    legacy: true
  },
  {
    id: "leads",
    label: "线索归因",
    nav: "线索",
    tag: "扩展",
    blurb: "小程序转发留资自动归属到人，跟进漏斗一目了然。",
    legacy: true
  },
  {
    id: "copy",
    label: "一案多吃话术",
    nav: "话术",
    tag: "扩展",
    blurb: "一套实景自动拆解朋友圈、小红书、抖音与私聊谈单话术。",
    legacy: true
  },
  {
    id: "space",
    label: "AI 空间变装",
    nav: "变装",
    tag: "扩展",
    blurb: "毛坯或旧房照片现场生成多风格效果图辅助成交。",
    legacy: true
  }
];

export const PRESETS: {
  id: Exclude<PresetId, "custom">;
  label: string;
  short: string;
  detail: string;
  modules: ModuleId[];
}[] = [
  {
    id: "field",
    label: "一线签单版",
    short: "素材库 · 签单台 · 证据链",
    detail: "专为顾问与设计师打造的轻量小程序：找实景、算闭口、谈单、留存证一气呵成。",
    modules: ["library", "close", "evidence"]
  },
  {
    id: "studio",
    label: "企划供稿版",
    short: "素材库 · 楼盘 · 话术 · 变装",
    detail: "适合总部企划与运营在电脑端制作案例、楼盘策略和营销物料，下发给全员。",
    modules: ["library", "communities", "copy", "space"]
  },
  {
    id: "full",
    label: "全员旗舰版",
    short: "全部 8 项模块打通",
    detail: "总部供稿、一线签单、透明工地、证据存证与线索归因全公司统一平台。",
    modules: MODULES.map((item) => item.id)
  }
];

export const COMPANY_PROFILE = {
  name: "壹品整装",
  english: "YIPIN DECORATION",
  slogan: "好整装，眼见为实。",
  intro:
    "全国 11 家直营分公司，10000+ 全球严选主材假一罚十。坚持 36 项砸无赦施工验收、水电终保、0 恶意增项与延期必赔，一站式配齐硬装、定制与家电，省心、省力、更省钱。",
  showroom: "佛山壹品整装美学展厅 · 全屋硬装与万款主材实景直选",
  metrics: [
    { value: "11 家", label: "全国直营分公司保障" },
    { value: "36 项", label: "验收不合格砸无赦" },
    { value: "水电终保", label: "超长质保售后无忧" },
    { value: "¥100/天", label: "工期延期按日赔付" }
  ],
  pillars: [
    {
      title: "超长质保 · 水电终保",
      desc: "行业率先推出水电终保服务，隐蔽工程规范留档，让居住再无后顾之忧。"
    },
    {
      title: "保真环保 · 假一罚十",
      desc: "10000+ 全球严选大牌主材签订保真与环保协议，材料环保不达标负全责。"
    },
    {
      title: "36 项砸无赦 · 0 恶意增项",
      desc: "标准化施工节点验收不合格免费砸掉重做，一口价闭口清单杜绝被动增项。"
    },
    {
      title: "延期必赔 · 1 站式配齐",
      desc: "严格锁定施工工期，延误一天赔付 100 元；涵盖窗户、空调、定制、电器一站搞定。"
    }
  ],
  partners: [
    "马可波罗",
    "东鹏瓷砖",
    "冠珠瓷砖",
    "欧派橱柜",
    "索菲亚",
    "大自然家居",
    "梦天木门",
    "恒洁卫浴",
    "奥普吊顶",
    "三棵树",
    "西门子",
    "科顺防水"
  ],
  oneStopCategories: [
    "窗户",
    "防盗门",
    "暖气/地暖",
    "中央空调&新风",
    "全屋净水",
    "定制家具",
    "窗帘灯饰",
    "嵌入式电器",
    "冰箱空调洗衣机"
  ]
};

export const QUOTE_ADDONS: QuoteAddon[] = [
  // 拆改土建
  {
    id: "demolish-wall",
    category: "拆改土建",
    label: "打拆原有非承重墙体",
    unit: "㎡",
    unitPrice: 85,
    defaultQty: 8,
    note: "含人工拆除及袋装建渣清运"
  },
  {
    id: "build-wall",
    category: "拆改土建",
    label: "新建轻质砖 / 红砖隔墙",
    unit: "㎡",
    unitPrice: 220,
    defaultQty: 6,
    note: "含植筋、挂防裂钢丝网与双面抹灰"
  },
  {
    id: "balcony-open",
    category: "拆改土建",
    label: "阳台打通并入客厅",
    unit: "项",
    unitPrice: 3800,
    defaultQty: 1,
    note: "含原推拉门拆除、门垛修补与基层找平"
  },
  {
    id: "site-protect",
    category: "拆改土建",
    label: "成品保护与建渣清运外运",
    unit: "项",
    unitPrice: 3600,
    defaultQty: 1,
    note: "入户门/电梯/地面保护及物业指定清运"
  },

  // 水电暖通
  {
    id: "water-elec-extra",
    category: "水电暖通",
    label: "全屋个性化水电增量改造",
    unit: "㎡",
    unitPrice: 65,
    defaultQty: 20,
    note: "按新增点位或改造面积核算，水电终保"
  },
  {
    id: "no-main-light",
    category: "水电暖通",
    label: "无主灯磁吸轨道 / 射灯预埋",
    unit: "组",
    unitPrice: 1280,
    defaultQty: 2,
    note: "含线路定位、吊顶预埋槽及开孔（不含灯具）"
  },
  {
    id: "ac-soffit",
    category: "水电暖通",
    label: "中央空调 / 风管机局部吊顶",
    unit: "米",
    unitPrice: 240,
    defaultQty: 12,
    note: "轻钢龙骨双层石膏板，含风口预留加固"
  },
  {
    id: "water-purifier",
    category: "水电暖通",
    label: "前置净水 / 软水机管路预留",
    unit: "套",
    unitPrice: 1800,
    defaultQty: 1,
    note: "含冷热水管路改位、三通及打压测试"
  },

  // 泥木油工艺
  {
    id: "ceiling-eyelid",
    category: "泥木油工艺",
    label: "客餐厅双眼皮 / 悬浮边吊顶",
    unit: "米",
    unitPrice: 180,
    defaultQty: 24,
    note: "轻钢龙骨 + 错缝防裂双层石膏板工艺"
  },
  {
    id: "large-tile-upgrade",
    category: "泥木油工艺",
    label: "750×1500 大板瓷砖升级通铺",
    unit: "㎡",
    unitPrice: 110,
    defaultQty: 45,
    note: "含大板瓷砖胶薄贴与调平器人工材料差价"
  },
  {
    id: "polyurea-grout",
    category: "泥木油工艺",
    label: "全房聚脲调色美缝（含海棠角）",
    unit: "㎡",
    unitPrice: 28,
    defaultQty: 85,
    note: "防霉耐污不发黄，瓷砖阳角精细倒角"
  },
  {
    id: "tv-feature-wall",
    category: "泥木油工艺",
    label: "客厅电视背景墙木饰面 / 格栅",
    unit: "㎡",
    unitPrice: 480,
    defaultQty: 10,
    note: "含欧松板基层打底与金属收口条"
  },
  {
    id: "bath-niche",
    category: "泥木油工艺",
    label: "卫生间壁龛 / 下沉隔音包管",
    unit: "个",
    unitPrice: 880,
    defaultQty: 2,
    note: "红砖砌筑、双层防水加强及隔音棉降噪"
  },

  // 定制与升级
  {
    id: "custom-wardrobe",
    category: "定制与升级",
    label: "ENF 级全屋定制衣柜 / 玄关柜",
    unit: "㎡",
    unitPrice: 899,
    defaultQty: 16,
    note: "按投影面积计价，含品牌阻尼缓冲五金"
  },
  {
    id: "window-seal",
    category: "定制与升级",
    label: "系统断桥铝封窗（双层中空钢化）",
    unit: "㎡",
    unitPrice: 680,
    defaultQty: 12,
    note: "含窗框外防水密封胶及标配开启扇五金"
  },
  {
    id: "invisible-door",
    category: "定制与升级",
    label: "极简隐形门 / 钛镁合金长虹门",
    unit: "樘",
    unitPrice: 2680,
    defaultQty: 1,
    note: "含闭门器 / 极窄边框定制及现场收口安装"
  },
  {
    id: "kitchen-island",
    category: "定制与升级",
    label: "厨房定制岛台 / 岩板餐吧",
    unit: "延米",
    unitPrice: 2400,
    defaultQty: 2,
    note: "含防潮多层柜体、岩板台面及轨道插座预留"
  }
];

export const OBJECTION_CARDS: ObjectionCard[] = [
  {
    id: "obj-1",
    topic: "嫌总价比别家贵",
    question: "“隔壁公司报 11 万全包，你们怎么要 16 万？”",
    reply:
      "咱们把两份报价单逐项对齐看：低价开口套餐通常把拆旧保护、大板通铺人工、海棠角、水电超米和垃圾清运放在开工后算增项。我们把这 5 项直接写进闭口合同，实际完工总价反而更省。",
    proof: "调取《闭口清单对比表》+ 同小区 0 增项结算单"
  },
  {
    id: "obj-2",
    topic: "担心隐蔽工程偷工减料",
    question: "“水电封在墙里以后出问题怎么办？”",
    reply:
      "所有工地公司直管不转包，水电完工必须拍全景定位图进入您的专属证据链档案，48 小时闭水试验业主本人确认签字后才进下一道工序。",
    proof: "直接打开「看工地」展示保利天珺水电验收实拍"
  },
  {
    id: "obj-3",
    topic: "怕后期扯皮 / 拖工期",
    question: "“销售答应的赠品和做法，开工后项目经理不认怎么办？”",
    reply:
      "今天我们聊定的每一项做法、主材型号和赠品，离开前就会写入数字证据链并同步发您微信确认，设计师、监理、项目经理看的是同一份档案。",
    proof: "现场演示「证据链」并发送一条微信确认函"
  }
];

export const SITE_BROADCASTS: SiteBroadcast[] = [
  {
    id: "site-1",
    community: "保利天珺",
    unit: "3栋 1802 · 128㎡",
    areaSqm: 128,
    stage: "水电验收通过",
    progress: 38,
    manager: "黄工长（12年直管）",
    updatedAt: "今天 11:20",
    highlight: "强弱电分色横平竖直排布，交叉处全包锡箔防干扰，打压测试 0.8MPa 稳压 30 分钟零掉压。",
    checks: ["强弱电间距达标", "水管打压通过", "全景 VR 留档完成"],
    photo: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=85",
    canVisit: true
  },
  {
    id: "site-2",
    community: "中海寰宇天下",
    unit: "9栋 1105 · 98㎡",
    areaSqm: 98,
    stage: "泥木施工中",
    progress: 64,
    manager: "梁工长（9年直管）",
    updatedAt: "昨天 17:45",
    highlight: "卫生间 48 小时闭水试验已由业主视频确认无渗漏；全房 750×1500 柔光砖薄贴通铺完成 85%。",
    checks: ["48h 闭水已签认", "墙砖空鼓率 < 1%", "玄关借位放线复核"],
    photo: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=85",
    canVisit: true
  },
  {
    id: "site-3",
    community: "万科金域中央",
    unit: "2栋 2201 · 108㎡",
    areaSqm: 108,
    stage: "软装保洁交付",
    progress: 96,
    manager: "周总监（全案巡检）",
    updatedAt: "昨天 14:10",
    highlight: "全屋柜体收口打胶顺直，空气质量第三方复检甲醛 0.03mg/m³，优于国标要求，本周六正式交钥匙。",
    checks: ["甲醛复检达标", "全屋灯具调光完成", "零增项结算签字"],
    photo: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85",
    canVisit: true
  }
];

const TALKS: Record<string, Talk> = {
  保利天珺: {
    budget:
      "总价清晰锁定在 15.8 万 – 17.5 万区间。拆旧保护、海棠角美缝、大板通铺人工全部写进闭口清单，签约后不设隐藏增项。",
    craft:
      "打通阳台并入客厅形成全景采光面，原深色门套改极简隐形套口；现场可直接调取同小区横平竖直水电与 48 小时闭水实拍。",
    schedule:
      "保利天珺 2026 年 Q4 集中交付。现在锁定方案与 ENF 主材，交房次日即可办齐物业进场手续，省去高峰期排队工期。"
  },
  中海寰宇天下: {
    budget:
      "98㎡ 刚改三房预算控制在 11.5 万 – 13.2 万。把预算集中在玄关借位储物与次卧一体柜，不做高溢价造型背景墙。",
    craft:
      "入户玄关向非承重墙借位 15cm 做满墙悬浮鞋柜；次卧榻榻米衔接书桌，多释放约 4㎡ 实用收纳空间。",
    schedule:
      "量房数据已入档。确认玄关柜深度与主材色板后即可锁定排期，标准工期 75 个工作日按节点播报。"
  },
  万科金域中央: {
    budget:
      "面向总价敏感型翻新家庭，采用透明整装套餐，明确标注 ENF 环保主材品牌与工期延误赔付条款。",
    craft:
      "客餐厅偏长采用无主灯与弧形吊顶弱化横梁压迫；卫生间外移洗手台实现干湿分离，提升早高峰效率。",
    schedule:
      "次新房翻新进场前完成楼道成品保护与原房隐患拍照存证，明确拆旧交接边界，避免与原装修责任混淆。"
  }
};

const FALLBACK_TALK: Talk = {
  budget: "先明确总预算上限，给出含拆改与主材的透明区间，不以低价开口套餐诱导。",
  craft: "结合本户量房实拍讲清隐蔽工程与收纳解法，用同小区工地记录建立信任。",
  schedule: "主材与拆改清单确认后再锁定工期节点，所有口头约定均同步写入证据链。"
};

export function moduleById(id: ModuleId) {
  return MODULES.find((item) => item.id === id)!;
}

export function matchPreset(ids: ModuleId[]): PresetId {
  const key = [...ids].sort().join(",");
  const found = PRESETS.find((preset) => [...preset.modules].sort().join(",") === key);
  return found?.id ?? "custom";
}

export function splitPoints(text: string) {
  return text
    .split(/\d+\.\s*/)
    .map((part) => part.replace(/[；;]\s*$/g, "").trim())
    .filter(Boolean);
}

export function talkFor(community?: Community): Talk {
  if (!community) return FALLBACK_TALK;
  return TALKS[community.name] ?? FALLBACK_TALK;
}

export function formatWhen(iso: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(new Date(iso));
}

export function formatToday(date = new Date()) {
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    month: "long",
    day: "numeric",
    weekday: "short"
  }).format(date);
}

export function makeEvidenceCode(seed = Date.now()) {
  const d = new Date(seed);
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const seq = String(seed % 90 + 10);
  return `EV-${yy}${mm}${dd}-${seq}`;
}

export function makeShortHash(text: string) {
  let acc = 2166136261;
  for (let i = 0; i < text.length; i++) {
    acc ^= text.charCodeAt(i);
    acc = Math.imul(acc, 16777619);
  }
  return `SHA256:${(acc >>> 0).toString(16).padStart(8, "0")}…${((acc ^ 0x5f3759df) >>> 0)
    .toString(16)
    .slice(0, 6)}`;
}

export const INITIAL_EVIDENCE: EvidenceNode[] = [
  {
    id: "ev-1",
    code: "EV-261118-01",
    hash: "SHA256:9f4c12a8…7e31b2",
    stage: "需求沟通",
    leadId: "lead-1",
    customerName: "张先生",
    at: "2026-11-18T06:20:00.000Z",
    title: "首次到店需求确认",
    said: "明确预算控制在 16 万上下，不做复杂电视背景墙；偏好现代奶油风，希望参考保利天珺同户型完工实景。",
    by: "林顾问",
    attachment: "到店需求记录单",
    confirmed: true,
    confirmChannel: "微信群已签认"
  },
  {
    id: "ev-2",
    code: "EV-261120-02",
    hash: "SHA256:3b81e70d…4a09c5",
    stage: "现场量房",
    leadId: "lead-1",
    customerName: "张先生",
    at: "2026-11-20T02:05:00.000Z",
    title: "现场量房与原况拍照存证",
    said: "阳台隔断拟打通并入客厅，厨房原采光偏弱建议改半开放式岛台。现场留存 12 张原始结构与墙面空鼓实拍，业主在场复核。",
    by: "陈设计师",
    attachment: "现场实拍 12 张",
    photo: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=80",
    confirmed: true,
    confirmChannel: "现场手写确认"
  },
  {
    id: "ev-3",
    code: "EV-261122-03",
    hash: "SHA256:7d19f442…c128aa",
    stage: "方案报价",
    leadId: "lead-1",
    customerName: "张先生",
    at: "2026-11-22T11:40:00.000Z",
    title: "初版方案与闭口报价讲解",
    said: "已讲解 128㎡ 奶油风平面与闭口合同清单（15.8万–17.5万），拆旧保护与美缝人工已含在内；待业主到店确认主材花色后落定。",
    by: "林顾问",
    attachment: "闭口报价单 V1",
    photo: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=80",
    confirmed: false,
    confirmChannel: "待业主微信确认"
  },
  {
    id: "ev-4",
    code: "EV-261119-01",
    hash: "SHA256:5a20c881…19d4e0",
    stage: "现场量房",
    leadId: "lead-2",
    customerName: "陈女士",
    at: "2026-11-19T03:30:00.000Z",
    title: "现场量房复尺",
    said: "入户玄关向非承重墙借位 15cm 做悬浮鞋柜；次卧规划一体榻榻米加书桌。",
    by: "陈设计师",
    attachment: "量房复尺图",
    photo: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80",
    confirmed: true,
    confirmChannel: "微信群已签认"
  },
  {
    id: "ev-5",
    code: "EV-261121-02",
    hash: "SHA256:8e64b10a…f30719",
    stage: "方案报价",
    leadId: "lead-2",
    customerName: "陈女士",
    at: "2026-11-21T13:12:00.000Z",
    title: "微信节点确认",
    said: "业主微信回复确认次卧榻榻米方案，玄关柜深度待本周六到展厅体验后最终签字。",
    by: "陈设计师",
    attachment: "微信确认截图",
    confirmed: true,
    confirmChannel: "微信截图存证"
  },
  {
    id: "ev-6",
    code: "EV-261123-01",
    hash: "SHA256:c104a9f2…88b21d",
    stage: "隐蔽验收",
    leadId: "lead-3",
    customerName: "周先生",
    at: "2026-11-23T07:45:00.000Z",
    title: "旧房交接与拆改水电交底",
    said: "确认卫生间洗手台外移改水电方案，原地板拆除保护及物业报建流程已书面告知，业主已当场确认。",
    by: "林顾问",
    attachment: "拆改交底单",
    photo: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80",
    confirmed: true,
    confirmChannel: "现场电子签认"
  }
];

export function seedEvidence(
  leads: { id: string; customer_name: string }[]
): EvidenceNode[] {
  return INITIAL_EVIDENCE.flatMap((node) => {
    const lead =
      leads.find((item) => item.id === node.leadId) ||
      leads.find((item) => item.customer_name === node.customerName);
    if (!lead) return [];
    return [{ ...node, leadId: lead.id }];
  });
}

export const STATUS_LABEL: Record<string, string> = {
  new: "待首次谈单",
  following: "方案跟进中",
  visited: "已到店/量房",
  signed: "已签约交付"
};

export const MATERIAL_TYPE_LABEL: Record<string, string> = {
  before_after: "实景对比",
  case: "实景案例",
  poster: "活动海报",
  copywriting: "签单话术"
};
