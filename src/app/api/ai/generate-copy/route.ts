import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const communityName = String(body.community_name || "保利天珺").trim().slice(0, 60);
  const areaSqm = Math.max(20, Math.min(1000, Number(body.area_sqm || 128) || 128));
  const style = String(body.style || "现代奶油风").trim().slice(0, 40);
  const budgetWan = Math.max(1, Math.min(500, Number(body.budget_wan || 16.8) || 16.8));
  const highlights = String(
    body.highlights || "阳台打通并入客厅、全屋柔光砖通铺、ENF级环保主材闭口合同"
  )
    .trim()
    .slice(0, 300);

  const city = "广佛";
  const highlightList = highlights.split(/[、，,]/).filter(Boolean);

  const demoOutput = {
    xiaohongshu: `${city}${communityName} ${areaSqm}㎡｜这才是${style}该有的松弛感

很多同小区邻居收房都在纠结怎么改，这套 ${budgetWan}w 全包落地实景直接抄作业：
1. ${highlightList[0] || "打通阳台做全景落地窗"}，采光直接翻倍
2. ${highlightList[1] || "全屋通铺柔光大砖"}，视觉延伸显大 15㎡
3. 壹品整装闭口合同 + 德系直管工艺，签约前把清单锁死，拒绝后期增项。

同小区想看完整报价表和平面改造图的，评论区扣【${areaSqm}】发你
#${city}装修 #${communityName}装修 #壹品整装 #${style}`,
    douyin: `【0-3秒黄金钩子】${communityName}的业主先别急着找游击队！看看这套 ${areaSqm}㎡ 花 ${budgetWan}万装出来的 ${style} 有多绝！
【痛点直击】原本开发商交付的格局压抑又浪费，我们重点做了：${highlights}。
【信任背书】全程壹品整装自有产业工人直管，材料环保可溯源，预算多少落地就是多少。
【结尾转化】点击左下角小程序，10秒测算你家 ${communityName} 同款落地预算！`,
    moments: `【壹品整装·实景交付】${communityName} ${areaSqm}㎡ ${style}毕业照出炉
落地 ${budgetWan}w 全包，核心升级：${highlights}。
拒绝过度装修，把钱花在采光、收纳和环保主材上。同小区邻居私信预约，免费领户型改造方案+在建工地参观名额`,
    sales_script: `哥/姐您好，这是我们壹品整装刚整理的${communityName} ${areaSqm}㎡ ${style}实景方案，总造价 ${budgetWan} 万全包，重点解决了${highlightList[0] || "空间采光与收纳"}的问题。先发您参考一下，周末有空可以安排去同小区实景工地看看工艺~`
  };

  return NextResponse.json({
    mode: "demo_ai",
    note: "已使用壹品整装内置多渠道文案模板生成。",
    data: demoOutput
  });
}
