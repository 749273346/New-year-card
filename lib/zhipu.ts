
export async function generateImage(prompt: string) {
  const apiKey = process.env.ZHIPU_API_KEY;
  if (!apiKey) {
    const palettes = [
      ["#7a0b14", "#b3121f", "#f59e0b", "#fde68a"],
      ["#4c0519", "#9f1239", "#fbbf24", "#fff7ed"],
      ["#991b1b", "#dc2626", "#facc15", "#fef3c7"],
      ["#450a0a", "#b91c1c", "#f97316", "#fffbeb"],
    ];

    const palette = palettes[Math.floor(Math.random() * palettes.length)];
    const [c1, c2, c3, c4] = palette;
    const n = () => Math.floor(Math.random() * 900) + 62;
    const r = () => Math.floor(Math.random() * 120) + 30;
    const o = () => (Math.random() * 0.35 + 0.08).toFixed(3);

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c1}"/>
      <stop offset="0.55" stop-color="${c2}"/>
      <stop offset="1" stop-color="${c1}"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="35%" r="65%">
      <stop offset="0" stop-color="${c4}" stop-opacity="0.9"/>
      <stop offset="1" stop-color="${c4}" stop-opacity="0"/>
    </radialGradient>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="14"/>
    </filter>
  </defs>

  <rect width="1024" height="1024" fill="url(#bg)"/>
  <rect width="1024" height="1024" fill="url(#glow)"/>

  <g opacity="0.9" filter="url(#soft)">
    <circle cx="${n()}" cy="${n()}" r="${r()}" fill="${c3}" fill-opacity="${o()}"/>
    <circle cx="${n()}" cy="${n()}" r="${r()}" fill="${c4}" fill-opacity="${o()}"/>
    <circle cx="${n()}" cy="${n()}" r="${r()}" fill="${c3}" fill-opacity="${o()}"/>
    <circle cx="${n()}" cy="${n()}" r="${r()}" fill="${c4}" fill-opacity="${o()}"/>
  </g>

  <g opacity="0.95">
    <path d="M120 820c90-90 210-90 300 0s210 90 300 0 210-90 300 0v160H120z" fill="#000" fill-opacity="0.18"/>
    <path d="M-40 890c110-110 250-110 360 0s250 110 360 0 250-110 360 0v200H-40z" fill="#000" fill-opacity="0.14"/>
  </g>

  <g stroke="${c3}" stroke-opacity="0.65" stroke-width="3" fill="none">
    <path d="M${n()} ${n()} l18 -42 l18 42 l-42 -18 l42 18 l-42 18 l42 -18 l-18 42 l-18 -42" />
    <path d="M${n()} ${n()} l14 -34 l14 34 l-34 -14 l34 14 l-34 14 l34 -14 l-14 34 l-14 -34" />
    <path d="M${n()} ${n()} l22 -50 l22 50 l-50 -22 l50 22 l-50 22 l50 -22 l-22 50 l-22 -50" />
  </g>

  <g>
    <circle cx="860" cy="120" r="60" fill="${c3}" fill-opacity="0.22"/>
    <circle cx="860" cy="120" r="44" fill="${c4}" fill-opacity="0.18"/>
    <rect x="846" y="40" width="28" height="18" rx="6" fill="${c4}" fill-opacity="0.35"/>
    <path d="M860 58v16" stroke="${c4}" stroke-opacity="0.45" stroke-width="4" />
  </g>
</svg>`;

    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }

  const styleVariants = [
    "国潮插画风",
    "传统年画风",
    "剪纸风",
    "水墨+金箔风",
    "现代扁平插画风",
    "写实摄影感",
  ];
  const variant = styleVariants[Math.floor(Math.random() * styleVariants.length)];

  const response = await fetch("https://open.bigmodel.cn/api/paas/v4/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "glm-image", // or cogview-3-flash as per docs if needed, but glm-image is standard
      prompt: `${prompt}。${variant}。每次生成保持构图与细节不同，无文字。`,
      size: "1024x1024", // Standard size
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to generate image");
  }

  const data = await response.json();
  return data.data[0].url;
}

export async function generateGreeting(name: string) {
  const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
  const zhipuApiKey = process.env.ZHIPU_API_KEY;

  // 预设的祝福语模版库，包含不同风格
  const wishTemplates = [
    `钢轨为纸，车轮为笔，绘得出万里通途。丙午马年，致敬坚守岗位的铁路人——愿${name}的守护换得万家团圆。祝您身体硬朗如钢轨，精神抖擞似骏马，阖家安康！`,
    `信号灯闪烁归家的方向，检点锤敲响平安的乐章。马年新春，愿${name}守护的每一段线路都畅通无阻。祝您一马当先保安全，龙马精神创佳绩，万事顺遂！`,
    `别人的团圆，是你们的坚守。这一年，你们像不知疲倦的铁马，奔走在绵延的轨道上。丙午新春，愿${name}所有的奔波都能换来平安的靠站。祝马年大吉，工作顺心，万事如意！`,
    `铁龙飞驰迎新春，骏马奔腾报佳音。丙午年，愿${name}的工作像高铁一样风驰电掣，生活像标准轨距一样平稳顺遂。马年到，祝您“马”力全开，“铁”定幸福！`,
    `接过春运的接力棒，我们在钢轨上驰骋。丙午马年，是铁路人策马扬鞭的新征程。愿${name}以梦为马，不负韶华，跑出精彩人生。祝马到成功，平安归来！`
  ];

  // 随机选择2-3个模版作为Prompt参考
  const randomTemplates = [];
  const tempCopy = [...wishTemplates];
  for (let i = 0; i < 3; i++) {
    if (tempCopy.length === 0) break;
    const idx = Math.floor(Math.random() * tempCopy.length);
    randomTemplates.push(tempCopy[idx]);
    tempCopy.splice(idx, 1);
  }
  const referencePrompt = `\n\n参考以下祝福语风格（仅供参考，请发挥创意，不要完全照抄，必须包含用户姓名）：\n${randomTemplates.map((t, i) => `${i + 1}. ${t}`).join('\n')}`;

  if (deepseekApiKey) {
    // Use DeepSeek API
    try {
      const response = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${deepseekApiKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: `你是一个精通中国传统文化和诗词的AI助手。请为用户生成一段2026马年新年祝福，要求创作一首*七言绝句*（每句七个字，共四句），必须紧扣*铁路/火车/高铁*行业特色以及*马年*元素。诗句中**不要**出现用户姓名，也不要使用藏头诗形式。用户姓名**必须**出现在下方的祝福语（wish）中。整体意境要豪迈大气，体现铁路人的无私奉献。${referencePrompt} 返回JSON格式，包含 poem (数组，每句一行) 和 wish (字符串)。`
            },
            {
              role: "user",
              content: `我的名字是${name}，请为我生成马年铁路主题的新年祝福。`
            }
          ],
          temperature: 1.3, // High temperature for variety
          response_format: { type: "json_object" }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("DeepSeek API Error:", errorText);
        throw new Error(`DeepSeek API Failed: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error("DeepSeek generation failed, falling back...", error);
      // Fallback logic continues below
    }
  }

  if (!zhipuApiKey) {
    // console.warn("API Keys are not set, using mock greeting");
    // Mock greeting with railway/horse theme (7-character lines, 4 lines)
    return {
      poem: [
        "铁龙飞驰贯九州，",
        "马蹄声碎志未休。",
        "复兴号角催春意，",
        "万里坦途展宏图。"
      ],
      wish: wishTemplates[Math.floor(Math.random() * wishTemplates.length)]
    };
  }

  const response = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${zhipuApiKey}`,
    },
    body: JSON.stringify({
      model: "glm-4",
      messages: [
         {
           role: "system",
           content: `你是一个精通中国传统文化和诗词的AI助手。请为用户生成一段2026马年新年祝福，要求创作一首*七言绝句*（每句七个字，共四句），必须紧扣*铁路/火车/高铁*行业特色（如钢轨、风笛、复兴号、时刻表、信号灯、通途等）以及*马年*元素（如龙马精神、快马加鞭、万马奔腾等）。诗句中**绝对不要**出现用户姓名，也不要使用藏头诗形式。用户姓名**必须**出现在下方的祝福语（wish）中。内容要豪迈大气，体现铁路人的奉献与时代的飞速发展。${referencePrompt} 返回JSON格式，包含 poem (数组，每句一行) 和 wish (字符串)。`
         },
         {
           role: "user",
           content: `我的名字是${name}，请为我生成马年铁路主题的新年祝福。`
         }
       ],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to generate greeting");
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  // Try to parse JSON from the content if the model returns markdown code block
  try {
    const jsonStr = content.replace(/```json\n|\n```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch {
    // Fallback if not valid JSON
    return {
      poem: content.split("\n").filter((line: string) => line.trim()),
      wish: "新年快乐！"
    };
  }
}
