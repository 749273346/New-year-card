
import { getRandomBuiltinBackground } from "./backgrounds";

// Extracted fallback image generation logic
function generateFallbackImage() {
  // Use high-quality built-in horse images instead of abstract SVG
  return getRandomBuiltinBackground();
}

export async function generateImage(prompt: string) {
  const apiKey = process.env.ZHIPU_API_KEY;
  
  // If no API key, return fallback immediately
  if (!apiKey) {
    return generateFallbackImage();
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

  try {
    const response = await fetch("https://open.bigmodel.cn/api/paas/v4/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "cogview-4-250304", 
        prompt: `${prompt}。${variant}。每次生成保持构图与细节不同，无文字。请确保主体位于画面中心，保留完整头部，周围留白，广角视角。`,
        size: "768x1344", // Vertical aspect ratio for mobile
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.warn("Zhipu Image API Error:", error);
      // Fallback on API error (e.g. quota exceeded)
      return generateFallbackImage();
    }

    const data = await response.json();
    return data.data[0].url;
  } catch (error) {
    console.warn("Image generation failed, using fallback:", error);
    return generateFallbackImage();
  }
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
  const referencePrompt = `\n\n请发挥你的文学创意，结合“铁路/高铁”与“马年”元素，为用户创作一段温暖、走心且富有文采的新年祝福。以下是一些参考范例，你可以借鉴其意境，但**不必拘泥于句式**，请自由发挥，写出新意。祝福语中**必须自然地融入**用户姓名（${name}）。\n参考范例：\n${randomTemplates.map((t, i) => `${i + 1}. ${t}`).join('\n')}`;

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
              content: `你是一个精通中国传统文化和诗词的AI助手。请为用户生成一段2026马年新年祝福。
核心要求：
1. 创作一首*七言绝句*（每句七个字，共四句），必须紧扣*铁路/火车/高铁*行业特色以及*马年*元素。诗句中**不要**出现用户姓名。
2. 编写一段温暖走心的祝福语（wish），其中必须包含用户姓名（${name}）。
3. **关键优化**：请拆解用户姓名，提取“名”的字义（如“杨昊”取“昊”意为广阔天际，“林淑婉”取“淑婉”意为美好柔和）。**特别注意**：不要生硬地引用名字（例如：不要写“如‘昊’天般”或“像‘强’一样”），不要给名字加引号。要将名字的含义化入句子中，写出专属的藏头或藏意祝福，如“愿您拥有昊天般广阔的胸襟”，“祝您意志如钢轨般坚强”。
4. 整体意境要豪迈大气，体现铁路人的无私奉献，同时不失个人专属的温度。
${referencePrompt} 
返回JSON格式，包含 poem (数组，每句一行) 和 wish (字符串)。`
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
           content: `你是一个精通中国传统文化和诗词的AI助手。请为用户生成一段2026马年新年祝福。
核心要求：
1. 创作一首*七言绝句*（每句七个字，共四句），必须紧扣*铁路/火车/高铁*行业特色以及*马年*元素。诗句中**绝对不要**出现用户姓名。
2. 编写一段温暖走心的祝福语（wish），其中必须包含用户姓名（${name}）。
3. **关键优化**：请拆解用户姓名，提取“名”的字义（如“杨昊”取“昊”意为广阔天际，“林淑婉”取“淑婉”意为美好柔和）。**特别注意**：不要生硬地引用名字（例如：不要写“如‘昊’天般”或“像‘强’一样”），不要给名字加引号。要将名字的含义化入句子中，写出专属的藏头或藏意祝福，如“愿您拥有昊天般广阔的胸襟”，“祝您意志如钢轨般坚强”。
4. 整体意境要豪迈大气，体现铁路人的奉献与时代的飞速发展。
${referencePrompt} 
返回JSON格式，包含 poem (数组，每句一行) 和 wish (字符串)。`
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
