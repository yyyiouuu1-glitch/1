export function buildMultiChannelSystemPrompt(brandName: string, city: string, communityContext?: string) {
  return `你是「${brandName}（${city}）」资深家装企划总监。你极其熟悉本地业主心理，擅长把一个装修案例或楼盘卖点一次性拆解为高转化的全渠道物料。

【核心写作规范】
1. 拒绝假大空：严禁使用“奢华、尊享、匠心独运、梦幻空间”等空洞词汇，必须用具体细节（如柔光砖通铺、打通阳台、ENF级环保、闭口合同零增项）。
2. 本地真实感：自然带入城市（${city}）与具体小区名，让同小区业主一眼停下来。
3. 强转化钩子：每个平台都要有明确且不生硬的引导动作（私信领报价清单、预约看同小区工地等）。
${communityContext ? `
【该公司知识库中的本小区背景资料】
${communityContext}
` : ""}

【严格输出格式】
必须且仅输出合法的 JSON 对象，不要包含 Markdown 代码块标记，字段如下：
{
  "xiaohongshu": "小红书种草图文（含吸睛标题、3-4条干货亮点、真实Emoji排版、结尾互动留资钩子与标签）",
  "douyin": "抖音/视频号45秒口播脚本（明确标注【0-3秒黄金钩子】【痛点反转】【实景卖点】【结尾引导】）",
  "moments": "微信朋友圈短文案（100字以内，适合设计师/网销配4张图直接发，口语化真实）",
  "sales_script": "企业微信1对1跟进话术（80字以内，发给同小区意向业主，亲切专业无压迫感）"
}`;
}

export function buildSpaceTransformJsonPrompt(params: {
  style: string;
  lighting: string;
  structureLock: number;
  roomType: string;
}) {
  const styleMap: Record<string, { palette: string; materials: string; mood: string }> = {
    现代奶油风: {
      palette: "warm cream white, oat beige, micro-cement travertine, muted walnut accents",
      materials: "matte 750x1500 soft-gloss floor tiles, curved gypsum ceiling, linen modular sofa",
      mood: "airy, serene, soft diffused daylight"
    },
    原木侘寂风: {
      palette: "natural white oak, limewash sand, charcoal stone, organic cotton",
      materials: "wide-plank natural oak flooring, textured micro-cement walls, travertine coffee table",
      mood: "calm, tactile, Zen architectural warmth"
    },
    意式极简风: {
      palette: "warm grey, smoked oak, matte black aluminum, travertine marble",
      materials: "large-format sintered stone, linear recessed magnetic track lights, Italian leather sofa",
      mood: "sharp architectural lines, gallery-like refinement"
    },
    中古法式风: {
      palette: "vintage walnut, warm ivory, antique brass, sage green velvet",
      materials: "herringbone hardwood floor, subtle plaster molding, Bauhaus accent chair",
      mood: "editorial, timeless, warm afternoon sunlight"
    }
  };

  const preset = styleMap[params.style] || styleMap["现代奶油风"];

  return {
    brand: "YIPIN DECORATION / 壹品整装",
    task: "architectural_interior_renovation_img2img",
    room_type: params.roomType,
    style: params.style,
    spatial_constraints: {
      preserve_load_bearing_walls: true,
      preserve_windows_and_doors: true,
      preserve_camera_perspective: true,
      controlnet_depth_weight: Number((params.structureLock / 100).toFixed(2)),
      controlnet_canny_weight: Number(((params.structureLock * 0.85) / 100).toFixed(2))
    },
    materials_and_palette: preset,
    lighting_setup: {
      color_temperature: params.lighting,
      natural_light: "soft directional window daylight with realistic bounce shadows",
      artificial_light: "hidden linear cove lighting + anti-glare 3000K-4000K downlights"
    },
    camera_realism: {
      camera: "Full-frame 24mm tilt-shift architectural photography, f/8",
      anti_ai_artifacts: "authentic wood grain, subtle natural plaster texture, realistic glass reflections, zero CGI gloss"
    }
  };
}
