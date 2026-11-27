export type PackageId = "meilijia" | "zunguijia";

export type RoomKey = "厨房空间" | "卫浴空间" | "客餐厅" | "卧室";

export const ROOM_KEYS: RoomKey[] = ["客餐厅", "厨房空间", "卫浴空间", "卧室"];

export type RoomVisualMeta = {
  image: string;
  caption: string;
};

export const ROOM_VISUALS: Record<PackageId, Record<RoomKey, RoomVisualMeta>> = {
  meilijia: {
    厨房空间: {
      image:
        "/home/cream-kitchen.jpg",
      caption: "3m 地柜 + 2m 吊柜石英石台面 · 东鹏/冠珠/马可波罗厨砖 · 科顺 2.4m 防水"
    },
    卫浴空间: {
      image:
        "/home/cream-bath.jpg",
      caption: "浴室柜/座便器/恒温花洒/淋浴隔断全配 · 2.4m 高标准防水 · 集成吊顶不限量"
    },
    客餐厅: {
      image:
        "/home/hall-cream.jpg",
      caption: "800×800 一线大地砖满铺 · 踢脚线/三棵树净味乳胶漆/开关插座全部不限量"
    },
    卧室: {
      image:
        "/home/cream-bed.jpg",
      caption: "800×800 瓷砖或木地板任选 · 金狮顿/美林小镇环保实木复合门 · 净味墙面漆"
    }
  },
  zunguijia: {
    厨房空间: {
      image:
        "/home/italian-kitchen.jpg",
      caption: "升级欧派/索菲亚 4m 地柜 + 2m 吊柜 · 2.0 极窄长虹玻璃推拉门 · 奥普大板吊顶"
    },
    卫浴空间: {
      image:
        "/home/italian-bath.jpg",
      caption: "全面升级恒洁/尚高/贝朗卫浴套件 · 朗斯淋浴隔断 · 奥普吊顶及浴霸"
    },
    客餐厅: {
      image:
        "/home/hall-walnut.jpg",
      caption: "马可波罗/冠珠/东鹏 800×800 满铺 · 辉瑞康飘窗石 · 西门子/施耐德/公牛开关"
    },
    卧室: {
      image:
        "/home/italian-bed.jpg",
      caption: "升级大自然木地板（砖木任选）· 大自然/梦天品牌木门 · 三棵树/多乐士乳胶漆"
    }
  }
};

export const AUX_BANNER_IMAGE =
  "/home/hall-stone.jpg";

export type PackageMaterialItem = {
  id: string;
  room: RoomKey;
  name: string;
  brand: string;
  spec: string;
  updatedTag?: string;
};

export type AuxMaterialItem = {
  id: string;
  name: string;
  brand: string;
  feature: string;
};

export type PackageChangeLog = {
  id: string;
  at: string;
  version: string;
  by: string;
  note: string;
};

export type ProductPackage = {
  id: PackageId;
  name: string;
  tagline: string;
  badge: string;
  accent: string;
  basePrice: number;
  baseAreaLabel: string;
  minBaseArea: number;
  maxBaseArea: number;
  underSqmDelta: number;
  overSqmDelta: number;
  extraBathPrice: number;
  extraDoorPrice: number;
  baseLayout: string;
  cover: string;
  version: string;
  updatedAt: string;
  highlights: string[];
  topBrands: string[];
  unlimitedItems: string[];
  includedSummary: string[];
  rules: string[];
  items: PackageMaterialItem[];
  changelog: PackageChangeLog[];
};

export const INITIAL_PACKAGES: ProductPackage[] = [
  {
    id: "meilijia",
    name: "美丽家",
    tagline: "全屋硬装一站式搞定 · 高性价比",
    badge: "80㎡ 标配起",
    accent: "#34c759",
    basePrice: 79800,
    baseAreaLabel: "80㎡（2室2厅1厨1卫）",
    minBaseArea: 80,
    maxBaseArea: 80,
    underSqmDelta: 598,
    overSqmDelta: 698,
    extraBathPrice: 9800,
    extraDoorPrice: 1098,
    baseLayout: "2室2厅1厨1卫（单卫标配）",
    cover:
      "/home/hall-cream.jpg",
    version: "v10.28",
    updatedAt: "2026-10-28",
    highlights: [
      "80㎡ 基准价 ¥79,800 起（超 80㎡ 按 +698元/㎡，不足减 598元/㎡）",
      "含 3m 地柜 + 2m 吊柜定制橱柜、3㎡ 厨房推拉门",
      "东鹏/冠珠/马可波罗一线瓷砖 + 三棵树净味乳胶漆 + 科顺防水",
      "厨卫吊顶、客餐厅/卧室地砖、踢脚线、乳胶漆全部不限量"
    ],
    topBrands: ["东鹏", "冠珠", "马可波罗", "三棵树", "科顺防水", "故音门窗", "海希蓝", "金狮顿"],
    unlimitedItems: [
      "厨卫集成吊顶不限量",
      "厨房/阳台小地砖不限量",
      "客餐厅地砖不限量",
      "卧室地砖不限量",
      "踢脚线与阴阳角护条不限量",
      "房间石膏线与全房乳胶漆不限量"
    ],
    includedSummary: [
      "橱柜地柜 3m + 吊柜 2m（石英石台面）",
      "厨房 2.0 厚铝合金推拉门 3㎡（单包边）",
      "房间木门 2.2m×0.9m（墙厚 15cm 内，含门套/锁具/五金）",
      "卫生间 2.0 厚铝合金平开门单包 1.76㎡（标配橡胶门吸）"
    ],
    rules: [
      "计价面积以实测图纸外框面积为准；无房产证按实测套内面积 + 墙厚 28cm 计算。",
      "仅适用于原始结构不作改动的毛坯房，不含拆旧、拆墙、封窗、砌墙及门洞修补。",
      "基准覆盖 80㎡ 2室2厅1厨1卫：不足 80㎡ 减 598元/㎡，超出 80㎡ 加 698元/㎡。",
      "增加标准卫生间 9,800元/个；增加标准房间门 1,098元/樘。",
      "标配含卫生间排污管隔音封管、水电开槽防爆裂网格布及新老墙拼接封网。"
    ],
    items: [
      // 厨房空间
      { id: "m-k1", room: "厨房空间", name: "墙面瓷砖", brand: "东鹏 / 冠珠 / 马可波罗 / 金巴利 / 瀚百川 / 利家福", spec: "400×800 / 400×400" },
      { id: "m-k2", room: "厨房空间", name: "地面瓷砖", brand: "东鹏 / 冠珠 / 马可波罗 / 金巴利 / 瀚百川 / 利家福", spec: "800×800（满铺）" },
      { id: "m-k3", room: "厨房空间", name: "门槛砖", brand: "金巴利", spec: "标配" },
      { id: "m-k4", room: "厨房空间", name: "防水", brand: "科顺", spec: "柔性防水 ZS200 / 刚性防水 ZS101 / 2.4米" },
      { id: "m-k5", room: "厨房空间", name: "整体定制橱柜", brand: "瀚百川 / 金銮 / 菲思卡尔", spec: "吊柜 2米 + 地柜 3米 / 石英石台面" },
      { id: "m-k6", room: "厨房空间", name: "定制橱柜专用配套", brand: "品牌标配", spec: "水槽龙头及五金标配" },
      { id: "m-k7", room: "厨房空间", name: "2.0 厚推拉门", brand: "故音门窗 / 瀚百川", spec: "单包边（含 3㎡）" },
      { id: "m-k8", room: "厨房空间", name: "集成吊顶", brand: "广思美德", spec: "300×300 / 300×600（不限量）" },
      { id: "m-k9", room: "厨房空间", name: "集成 LED 灯具", brand: "博尔美", spec: "300×300 / 300×600" },
      { id: "m-k10", room: "厨房空间", name: "开关插座面板", brand: "金狮顿 S50", spec: "展厅标配白色 / 灰色" },
      // 卫浴空间
      { id: "m-b1", room: "卫浴空间", name: "墙面瓷砖", brand: "东鹏 / 冠珠 / 马可波罗 / 金巴利 / 瀚百川 / 利家福", spec: "400×800 / 400×400" },
      { id: "m-b2", room: "卫浴空间", name: "地面瓷砖", brand: "东鹏 / 冠珠 / 马可波罗 / 金巴利 / 瀚百川 / 利家福", spec: "400×400（满铺）" },
      { id: "m-b3", room: "卫浴空间", name: "卫生间防水", brand: "科顺", spec: "柔性防水 ZS200 / 刚性防水 ZS101 / 2.4米" },
      { id: "m-b4", room: "卫浴空间", name: "卫生间沉箱架空", brand: "直管工艺标准", spec: "沙砖砌筑 + 水泥钢筋加强预制板" },
      { id: "m-b5", room: "卫浴空间", name: "卫浴四件套", brand: "瀚百川 / 劳柯斐", spec: "洗漱柜 + 镜柜 + 龙头 + 下水 + 二三出水花洒 + 坐便器" },
      { id: "m-b6", room: "卫浴空间", name: "包立管工艺", brand: "直管工艺标准", spec: "隔音棉 + 水泥预制板砌筑工艺" },
      { id: "m-b7", room: "卫浴空间", name: "2.0 厚铝合金门", brand: "故音门窗 / 瀚百川", spec: "单边门套 / 2.0 厚铝合金门" },
      { id: "m-b8", room: "卫浴空间", name: "集成吊顶与 LED 灯", brand: "广思美德 / 博尔美", spec: "300×300 / 300×600" },
      { id: "m-b9", room: "卫浴空间", name: "防臭地漏与开关", brand: "金富诚 / 金狮顿 S50", spec: "展厅标配白色 / 灰色" },
      // 客餐厅
      { id: "m-l1", room: "客餐厅", name: "客餐厅地砖", brand: "东鹏 / 冠珠 / 马可波罗 / 金巴利 / 瀚百川 / 利家福", spec: "800×800 满铺；金巴利/瀚百川/利家福可选 600×1200" },
      { id: "m-l2", room: "客餐厅", name: "墙顶面基层处理", brand: "多邦腻子粉", spec: "环保耐水腻子粉" },
      { id: "m-l3", room: "客餐厅", name: "墙顶面乳胶漆", brand: "三棵树", spec: "美好生活悦享家净味随意洗墙面漆 / 抗碱封闭底" },
      { id: "m-l4", room: "客餐厅", name: "石膏线与门槛砖", brand: "穗华 / 金巴利", spec: "全房标配" },
      { id: "m-l5", room: "客餐厅", name: "踢脚线", brand: "超薄铝合金踢脚线", spec: "6 / 8cm 铝合金明装踢脚线" },
      { id: "m-l6", room: "客餐厅", name: "开关插座面板", brand: "金狮顿 S50", spec: "展厅标配白色 / 灰色" },
      // 卧室
      { id: "m-r1", room: "卧室", name: "卧室地砖", brand: "东鹏 / 冠珠 / 马可波罗 / 金巴利 / 瀚百川", spec: "800×800（不限量）" },
      { id: "m-r2", room: "卧室", name: "木门", brand: "海希蓝", spec: "含配套门套、锁具、五金" },
      { id: "m-r3", room: "卧室", name: "墙顶面与乳胶漆", brand: "多邦腻子粉 / 三棵树", spec: "环保腻子 + 悦享家净味随意洗墙面漆" },
      { id: "m-r4", room: "卧室", name: "石膏线与踢脚线", brand: "穗华 / 超薄铝合金", spec: "12cm 卧室一圈 + 6/8cm 踢脚线" },
      { id: "m-r5", room: "卧室", name: "开关插座面板", brand: "金狮顿 S50", spec: "展厅标配白色 / 灰色" }
    ],
    changelog: [
      {
        id: "cl-m1",
        at: "2026-10-28",
        version: "v10.28",
        by: "采购企划部",
        note: "发布 10.28 版美丽家配置单：客餐厅新增 600×1200 地砖可选，标配科顺蓝墙绿地防水系统。"
      }
    ]
  },
  {
    id: "zunguijia",
    name: "尊贵家",
    tagline: "空间配置更舒适 · 更有颜 · 更省心",
    badge: "80–90㎡ 标配起",
    accent: "#d90a14",
    basePrice: 99800,
    baseAreaLabel: "80–90㎡（2室2厅1厨1卫）",
    minBaseArea: 80,
    maxBaseArea: 90,
    underSqmDelta: 600,
    overSqmDelta: 1200,
    extraBathPrice: 12800,
    extraDoorPrice: 1850,
    baseLayout: "2室2厅1厨1卫（含2个飘窗石）",
    cover:
      "/home/hall-walnut.jpg",
    version: "v10.28",
    updatedAt: "2026-10-28",
    highlights: [
      "80–90㎡ 基准价 ¥99,800 起（超 90㎡ 按 +1200元/㎡，不足 80㎡ 减 600元/㎡）",
      "升级欧派/索菲亚 4m 地柜 + 2m 吊柜、极窄边框 2.0 长虹/油砂玻璃门",
      "全面升级恒洁/尚高/贝朗卫浴、奥普吊顶、西门子/施耐德/公牛开关",
      "新增大自然木地板（砖木任选）、大自然/梦天木门、辉瑞康飘窗石"
    ],
    topBrands: ["欧派", "索菲亚", "马可波罗", "大自然", "梦天木门", "恒洁", "奥普", "西门子"],
    unlimitedItems: [
      "厨卫集成吊顶不限量",
      "厨房/阳台小地砖不限量",
      "客餐厅地砖不限量",
      "卧室木地板或地砖不限量",
      "嵌入式/铝合金踢脚线不限量",
      "墙顶面阴阳角、石膏线、全房乳胶漆不限量"
    ],
    includedSummary: [
      "欧派/索菲亚/菲思卡尔橱柜：地柜 4m + 吊柜 2m（含前后挡水）",
      "含 2 个房间辉瑞康飘窗石（深度 70cm 内）",
      "极窄边框 2.0 厚铝合金推拉门 3㎡（含 5.6 米门套线，长虹/灰油砂/白油砂）",
      "房间木门 2.2m×0.9m（墙厚 24cm 内，+2000元可升索菲亚静音门）"
    ],
    rules: [
      "计价面积以实测图纸外框面积为准；无房产证按实测套内面积 + 墙厚 28cm 计算。",
      "仅适用于原始结构不作改动的毛坯房，不含拆旧、拆墙、封窗、砌墙及门洞修补。",
      "基准覆盖 80–90㎡ 2室2厅1厨1卫：不足 80㎡ 减 600元/㎡，超出 90㎡ 加 1,200元/㎡。",
      "增加标准卫生间 12,800元/个；增加标准房间配置 1,850元/个。",
      "标配含卫生间排污管封管、水电开槽防爆裂网格布及新老墙拼接封网。"
    ],
    items: [
      // 厨房空间
      { id: "z-k1", room: "厨房空间", name: "墙地砖", brand: "马可波罗 / 冠珠 / 东鹏 / 金巴利", spec: "墙砖 400×800，地砖 400×400 全瓷多款可选（含人工辅材）" },
      { id: "z-k2", room: "厨房空间", name: "整体橱柜", brand: "欧派 / 索菲亚 / 菲思卡尔", spec: "4米地柜 + 2米吊柜 / 石英石台面（含前后挡水）", updatedTag: "大牌升级" },
      { id: "z-k3", room: "厨房空间", name: "水槽龙头", brand: "品牌标配", spec: "水槽（单盆 / 双盆任选）" },
      { id: "z-k4", room: "厨房空间", name: "极窄推拉门", brand: "故音门窗 / 瀚百川", spec: "极窄边框 2.0 厚铝合金门（长虹 / 灰油砂 / 白油砂）", updatedTag: "颜值升级" },
      { id: "z-k5", room: "厨房空间", name: "集成吊顶", brand: "奥普吊顶", spec: "300×300 / 300×600（不限量）" },
      { id: "z-k6", room: "厨房空间", name: "集成灯具", brand: "千亮照明", spec: "300×300 / 300×600" },
      { id: "z-k7", room: "厨房空间", name: "开关插座", brand: "西门子 / 松本 / 施耐德 / 公牛", spec: "展厅标配白色 / 灰色 / 金色" },
      { id: "z-k8", room: "厨房空间", name: "防水", brand: "科顺", spec: "柔性防水 ZS200 / 刚性防水 ZS101 / 2.4米" },
      // 卫浴空间
      { id: "z-b1", room: "卫浴空间", name: "墙地瓷砖", brand: "马可波罗 / 冠珠 / 东鹏 / 金巴利", spec: "墙砖 400×800，地砖 400×400 全瓷（含人工辅材）" },
      { id: "z-b2", room: "卫浴空间", name: "卫生间防水与沉箱", brand: "科顺 / 直管标准", spec: "2.4米防水 + 沙砖砌筑水泥钢筋加强预制板" },
      { id: "z-b3", room: "卫浴空间", name: "门槛砖", brand: "金雅陶", spec: "标配" },
      { id: "z-b4", room: "卫浴空间", name: "卫浴四件套", brand: "恒洁 / 尚高 / 贝朗", spec: "洗漱柜 + 镜柜 + 龙头 + 下水 + 二三出水花洒 + 坐便器", updatedTag: "一线升级" },
      { id: "z-b5", room: "卫浴空间", name: "极窄铝合金门", brand: "故音门窗 / 瀚百川", spec: "极窄边框 2.0 厚铝合金门（长虹 / 灰油砂 / 白油砂）" },
      { id: "z-b6", room: "卫浴空间", name: "吊顶与干区 LED 灯", brand: "奥普吊顶 / 千亮照明", spec: "300×300 / 300×600" },
      { id: "z-b7", room: "卫浴空间", name: "包立管 / 地漏 / 龙头", brand: "金富诚 / 直管标准", spec: "隔音棉预制板包立管 + 防臭地漏 + 洗衣机龙头" },
      { id: "z-b8", room: "卫浴空间", name: "开关插座面板", brand: "西门子 / 松本 / 施耐德 / 公牛", spec: "展厅标配白色 / 灰色 / 金色" },
      // 客餐厅
      { id: "z-l1", room: "客餐厅", name: "地砖", brand: "马可波罗 / 冠珠 / 东鹏 / 金巴利", spec: "800×800 / 600×1200（满铺，含人工辅材）" },
      { id: "z-l2", room: "客餐厅", name: "木地板（可选）", brand: "大自然木地板", spec: "1221×168×11 / 1215×199×10.3 / 1215×169×10.3", updatedTag: "砖木任选" },
      { id: "z-l3", room: "客餐厅", name: "墙顶面基层与乳胶漆", brand: "多邦腻子粉 / 三棵树乳胶漆", spec: "环保腻子 + 美好生活悦享家净味随意洗 / 抗碱封闭底" },
      { id: "z-l4", room: "客餐厅", name: "踢脚线", brand: "嵌入式瓷砖 / 超薄铝合金", spec: "6 / 8cm（含嵌入式工艺可选）" },
      { id: "z-l5", room: "客餐厅", name: "开关插座面板", brand: "西门子 / 松本 / 施耐德 / 公牛", spec: "展厅标配白色 / 灰色 / 金色" },
      // 卧室
      { id: "z-r1", room: "卧室", name: "地砖或木地板", brand: "马可波罗等一线砖 / 大自然木地板", spec: "800×800 地砖满铺或大自然木地板任选（不限量）" },
      { id: "z-r2", room: "卧室", name: "卧室木门", brand: "大自然木门 / 梦天 / 志腾 / 云迪", spec: "含门套/锁具/五金（+2000元可升级索菲亚静音门）", updatedTag: "静音可选" },
      { id: "z-r3", room: "卧室", name: "窗台石", brand: "辉瑞康", spec: "含 2 个飘窗石（深度 70cm 内）" },
      { id: "z-r4", room: "卧室", name: "墙顶面 / 石膏线 / 踢脚线", brand: "多邦 / 三棵树 / 穗华", spec: "环保乳胶漆 + 嵌入式瓷砖或超薄铝合金 6/8cm" },
      { id: "z-r5", room: "卧室", name: "开关插座面板", brand: "西门子 / 松本 / 施耐德 / 公牛", spec: "展厅标配白色 / 灰色 / 金色" }
    ],
    changelog: [
      {
        id: "cl-z1",
        at: "2026-10-28",
        version: "v10.28",
        by: "采购企划部",
        note: "发布 10.28 版尊贵家配置单：橱柜标配欧派/索菲亚 4m+2m，门窗全面升级极窄 2.0 长虹/油砂玻璃门。"
      }
    ]
  }
];

export const SHARED_AUX_MATERIALS: AuxMaterialItem[] = [
  { id: "aux-1", name: "上下水管及配件", brand: "金标线水电优品管道（PPR）", feature: "北欧化工原料、21点在线品控、能量环专利、国标 59-1 铜大通径。" },
  { id: "aux-2", name: "下水管及配件", brand: "联塑（PVC-U）", feature: "专利防漏预埋管接、全面无铅化，耐腐蚀寿命长达 50 年。" },
  { id: "aux-3", name: "强电线", brand: "金联宇", feature: "高纯度无氧铜芯足米足平方，B 级阻燃 ZB 防火等级，离火自熄。" },
  { id: "aux-4", name: "弱电网线", brand: "安普粤信通（超六双屏）", feature: "支持 10Gbps 万兆带宽，超六类双屏蔽抗电磁干扰。" },
  { id: "aux-5", name: "线管与底盒", brand: "金标线水电优品管道（PVC）", feature: "国标正公差、阻燃绝缘，弯曲无明显变色，抗压强度高。" },
  { id: "aux-6", name: "防水涂料", brand: "科顺建材", feature: "升级为蓝墙绿地防水系统（墙刚地柔），防水效果持久。" },
  { id: "aux-7", name: "腻子粉 / 发泡胶", brand: "多邦 / 智辰", feature: "耐水防霉防潮腻子 + 高发泡高韧性发泡胶。" },
  { id: "aux-8", name: "水泥沙子与保护膜", brand: "海螺牌 / 壹品定制保护膜", feature: "普通硅酸盐水泥沙子 + 编织布+OPP+120g棉防潮成品保护。" }
];

export const PACKAGE_DIFF_HIGHLIGHTS = [
  { item: "基准面积与价格", meili: "80㎡ 起 · ¥79,800", zungui: "80–90㎡ 起 · ¥99,800（多享10㎡）" },
  { item: "整体橱柜", meili: "瀚百川/金銮/菲思卡尔 · 3m地柜+2m吊柜", zungui: "欧派/索菲亚/菲思卡尔 · 4m地柜+2m吊柜" },
  { item: "厨卫推拉/平开门", meili: "2.0厚铝合金门（单包边）", zungui: "极窄边框2.0厚门（长虹/灰油砂/白油砂）" },
  { item: "卫浴四件套", meili: "瀚百川 / 劳柯斐", zungui: "恒洁 / 尚高 / 贝朗" },
  { item: "吊顶与照明", meili: "广思美德 + 博尔美", zungui: "奥普吊顶 + 千亮照明" },
  { item: "地面与木门", meili: "全房地砖 + 海希蓝木门", zungui: "新增大自然木地板任选 + 大自然/梦天木门" },
  { item: "开关插座", meili: "金狮顿 S50（白/灰）", zungui: "西门子 / 松本 / 施耐德 / 公牛（白/灰/金）" },
  { item: "窗台石与踢脚线", meili: "6/8cm 超薄铝合金踢脚线", zungui: "含2个辉瑞康飘窗石 + 嵌入式瓷砖踢脚线可选" }
];

export function calculatePackageQuote(
  pkg: ProductPackage,
  areaSqm: number,
  extraBaths: number,
  extraDoors: number,
  addonsTotal: number
) {
  let areaDelta = 0;
  let areaFormula = `基准 ${pkg.baseAreaLabel}`;

  if (areaSqm < pkg.minBaseArea) {
    const diff = pkg.minBaseArea - areaSqm;
    areaDelta = -diff * pkg.underSqmDelta;
    areaFormula = `不足 ${pkg.minBaseArea}㎡ 减 ${diff}㎡ × ¥${pkg.underSqmDelta}`;
  } else if (areaSqm > pkg.maxBaseArea) {
    const diff = areaSqm - pkg.maxBaseArea;
    areaDelta = diff * pkg.overSqmDelta;
    areaFormula = `超出 ${pkg.maxBaseArea}㎡ 加 ${diff}㎡ × ¥${pkg.overSqmDelta}`;
  }

  const bathCost = Math.max(0, extraBaths) * pkg.extraBathPrice;
  const doorCost = Math.max(0, extraDoors) * pkg.extraDoorPrice;
  const total = Math.max(0, pkg.basePrice + areaDelta + bathCost + doorCost + addonsTotal);

  return {
    basePrice: pkg.basePrice,
    areaDelta,
    areaFormula,
    bathCost,
    doorCost,
    addonsTotal,
    total
  };
}
