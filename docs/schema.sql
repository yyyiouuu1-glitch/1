-- ============================================================
-- 壹品整装 · YIPIN DECORATION
-- 三端（PC 企划工作台 + 小程序员工端 + 小程序业主端）核心数据库脚本
-- 在 Supabase 后台 -> SQL Editor 中粘贴并点击 Run 即可一键建表
-- ============================================================

-- 1. 用户表（区分企划管理员、内部员工、C端业主）
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) UNIQUE,
  openid VARCHAR(64) UNIQUE,
  name VARCHAR(50) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'staff', 'customer')),
  department VARCHAR(50),                 -- 企划部 / 网销部 / 设计部 / 市场部
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 本地楼盘与户型资产库
CREATE TABLE IF NOT EXISTS communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,             -- 小区名（如：保利天珺）
  city VARCHAR(50) DEFAULT '佛山',
  district VARCHAR(50),                   -- 区域（如：千灯湖 / 顺德 / 禅城）
  delivery_time VARCHAR(50),              -- 交房时间
  hot_layouts TEXT,                       -- 主流户型（如：98㎡三房 / 128㎡四房）
  pain_points TEXT NOT NULL,              -- 户型痛点与改造卖点（业主端可公开展示）
  competitor_script TEXT,                 -- 竞品套餐拆解与反击话术（仅 internal 员工可见！）
  cover_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 企划物料与实景案例库（PC 端生产 -> 一键推送至小程序）
CREATE TABLE IF NOT EXISTS materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  type VARCHAR(30) NOT NULL CHECK (type IN ('case', 'before_after', 'poster', 'copywriting')),
  visibility VARCHAR(20) NOT NULL DEFAULT 'internal' CHECK (visibility IN ('internal', 'public')),
  community_name VARCHAR(100),
  style VARCHAR(50),                      -- 现代奶油 / 原木侘寂 / 意式极简 / 中古法式
  area_sqm INT,
  budget_wan NUMERIC(6, 1),               -- 造价（万元）
  before_image TEXT,
  after_image TEXT,
  content_json JSONB DEFAULT '{}'::jsonb, -- 存放小红书/抖音/朋友圈/销售话术或生图 JSON 参数
  published BOOLEAN DEFAULT FALSE,        -- true = 已同步上架至小程序端
  created_by VARCHAR(50) DEFAULT '企划部',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 业主留资与员工归因线索表（核心转化闭环）
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_phone VARCHAR(20) NOT NULL,
  customer_name VARCHAR(50),
  community_name VARCHAR(100),
  area_sqm INT,
  target_style VARCHAR(50),
  estimated_budget VARCHAR(50),
  source_type VARCHAR(30) DEFAULT 'quote_calc', -- 'quote_calc' | 'community_unlock' | 'case_detail'
  referrer_id VARCHAR(64),                      -- 归因员工 ID（来自小程序分享参数 ?inviter=xxx）
  referrer_name VARCHAR(50),                    -- 归因员工姓名（冗余方便看板展示）
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'following', 'visited', 'signed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. AI 异步生图任务表（解决小程序与网页生图超时问题）
CREATE TABLE IF NOT EXISTS ai_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_type VARCHAR(30) DEFAULT 'space_transform',
  status VARCHAR(20) DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
  progress INT DEFAULT 10,
  input_payload JSONB,
  result_image_url TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 初始化壹品整装（广佛）演示种子数据
-- ============================================================

INSERT INTO users (phone, name, role, department) VALUES
  ('13800138000', '企划总监', 'admin', '企划部'),
  ('13800138001', '林顾问', 'staff', '网销部'),
  ('13800138002', '陈设计师', 'staff', '设计部')
ON CONFLICT (phone) DO NOTHING;

INSERT INTO communities (name, city, district, delivery_time, hot_layouts, pain_points, competitor_script, cover_image) VALUES
(
  '保利天珺', '佛山', '千灯湖板块', '2026年Q4集中交付', '118㎡四房 / 143㎡改善四房',
  '1. 精装交付阳台隔断显压抑，建议打通并入客厅做全景落地窗；2. 原配猪肝红门框与现代奶油/原木风不搭，需做无痕改色或极简套口；3. 厨房采光偏弱，推荐改半开放式岛台+超白长虹玻璃联动门。',
  '【内部反击话术】竞品低价套餐常把“精装局改拆旧保护费、阳角海棠角美缝、大板通铺人工费”藏在增项里。壹品整装主打一口价闭口合同，含全房德系工艺升级与一线主材，签约前把拆改清单列清，绝不中途加价。',
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85'
),
(
  '中海寰宇天下', '佛山', '桂城', '已交付 / 改善翻新热盘', '98㎡三房 / 125㎡四房',
  '1. 入户玄关偏窄，鞋柜深度不足，可向非承重墙借位15cm做满墙悬浮玄关柜；2. 次卧面积紧凑，采用一体化榻榻米+书桌设计可多出4㎡储物空间。',
  '【内部反击话术】针对小区业主担心的“隐蔽工程隐患”，重点展示壹品整装工地实拍的横平竖直水电工艺和全房防水闭水48小时验收标准，邀约业主直接去同小区在建工地眼见为实。',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85'
),
(
  '万科金域中央', '佛山', '禅城/南海交界', '次新房热装盘', '89㎡刚需三房 / 108㎡三房',
  '1. 客餐厅偏长，做无主灯+弧形吊顶可弱化横梁压迫感；2. 卫生间未做干湿分离，外移洗手台后早高峰使用效率翻倍。',
  '【内部反击话术】刚需盘客户对总价敏感，直接推壹品整装998/㎡全包透明套餐，重点对比“主材环保等级（ENF级）”和“工期延误赔付条款”，打消预算超支焦虑。',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85'
);

INSERT INTO materials (title, type, visibility, community_name, style, area_sqm, budget_wan, before_image, after_image, content_json, published, created_by) VALUES
(
  '保利天珺 128㎡ 现代奶油风实景变装', 'before_after', 'public', '保利天珺', '现代奶油风', 128, 16.8,
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85',
  '{"xiaohongshu": "佛山保利天珺128㎡｜打通阳台后，奶油风客餐厅像开了柔光滤镜✨\n全屋通铺柔光砖+极简双眼皮吊顶，16.8w全包落地，所见即所得！评论区扣【128】发你同小区完整清单👇", "moments": "【壹品整装·实景交付】保利天珺128㎡奶油风毕业照！拒绝过度装修，把钱花在采光、收纳和环保主材上。同小区业主私信预约，免费领户型改造方案一份🏠", "douyin": "【前3秒钩子】保利天珺的业主注意了！128㎡客厅千万别再做复杂背景墙了！\n【痛点】原本阳台推拉门把光线挡了一半...\n【收尾】左下角预约壹品整装，免费出你家同款对比图！", "sales_script": "哥/姐您好，这是我们壹品整装刚完工的保利天珺128㎡奶油风实景，阳台打通后采光特别好，造价16.8万全包。发您看看，周末有空可以带您去同小区工地实地转转~"}',
  true, '企划部'
),
(
  '壹品整装·年底样板房征集大促物料包', 'poster', 'public', '广佛全城通用', '意式极简', 110, 13.5,
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85',
  '{"xiaohongshu": "广佛装修先别急着定！壹品整装年底保价样板房征集开启🔥锁定今年工价不涨价，前20户免费升级全屋一线品牌卫浴！", "moments": "🔥【壹品整装·保价跨年季】今年定装修，明年不涨价！主材全线升级+工程直管零转包，广佛限额征集20套样板房，扫码测算你家精准报价👉", "douyin": "年底签装修到底是坑还是省钱？一条视频讲透壹品整装的保价协议怎么签最划算！", "sales_script": "您好，我们壹品整装年底保价样板房名额刚放出来，现在定下来明年开工按今年材料价结算，还能省出全屋家电预算，我把详细权益表发您参考一下？"}',
  true, '企划部'
);

INSERT INTO leads (customer_phone, customer_name, community_name, area_sqm, target_style, estimated_budget, source_type, referrer_id, referrer_name, status) VALUES
('1392856****', '张先生', '保利天珺', 128, '现代奶油风', '15.8万 - 17.5万', 'quote_calc', 'staff_lin', '林顾问', 'new'),
('1370291****', '陈女士', '中海寰宇天下', 98, '原木侘寂风', '11.5万 - 13.2万', 'community_unlock', 'staff_chen', '陈设计师', 'following');
