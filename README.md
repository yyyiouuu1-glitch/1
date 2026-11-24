# 壹品整装 · YIPIN DECORATION 企划部 AI 协同工作台（第一包：PC 端 + 后端 API + 数据库）

本工程采用 **Next.js 14 (App Router) + TypeScript + Tailwind CSS + Supabase** 构建，内置苹果极简图文界面与「一壳双端」微信小程序所需的全部后端 API。

## 一、本地 1 分钟快速启动（无需先填密钥）

系统内置了**零配置演示模式**，解压后执行以下命令即可在浏览器看到完整界面并体验读写交互：

```bash
npm install
npm run dev
```

打开浏览器访问：`http://localhost:3000`

---

## 二、接入真实数据库（Supabase）与大模型 API

1. 复制 `.env.example` 并重命名为 `.env.local`
2. **开通 Supabase（免费）**：
   - 登录 [supabase.com](https://supabase.com) 新建项目
   - 打开左侧 **SQL Editor**，把本工程中 `docs/schema.sql` 的全部内容粘贴进去并点击 **Run**，自动建好 5 张表并写入广佛演示楼盘数据
   - 在 **Project Settings → API** 复制 URL、Anon Key 和 Service Role Key 填入 `.env.local`
3. **接入文本大模型（任选其一）**：
   - 支持 DeepSeek、通义千问、OpenAI、Gemini 等任意 OpenAI 兼容格式
   - 在 `.env.local` 填入 `AI_TEXT_API_BASE`、`AI_TEXT_API_KEY`、`AI_TEXT_MODEL`
   - 重启 `npm run dev`，进入「一案多吃」即可实时调用真实大模型写稿

---

## 三、已为微信小程序预留的后端 API 清单

第二包 Taro 微信小程序将直接调用以下接口（已配置 CORS）：

- `GET /api/materials?scope=public` —— 业主端拉取公开案例与变装对比图
- `GET /api/materials?scope=internal` —— 员工端拉取全部内部物料包
- `GET /api/communities?scope=public` —— 业主端查楼盘痛点（**自动剔除内部竞品话术**）
- `GET /api/communities?scope=internal` —— 员工端查楼盘痛点 + 竞品反击话术
- `POST /api/leads` —— 业主端报价/解锁留资提交（自动记录 `referrer_id` 归因员工）
- `POST /api/ai/transform-space` & `GET /api/ai/task/[id]` —— 异步空间变装生图接口
