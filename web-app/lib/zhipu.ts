
export async function generateImage(prompt: string) {
  const apiKey = process.env.ZHIPU_API_KEY;
  if (!apiKey) {
    console.warn("ZHIPU_API_KEY is not set, using mock image");
    return "https://images.unsplash.com/photo-1463130436848-18c7c978061e?q=80&w=1000&auto=format&fit=crop"; // Red lantern background
  }

  const response = await fetch("https://open.bigmodel.cn/api/paas/v4/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "glm-image", // or cogview-3-flash as per docs if needed, but glm-image is standard
      prompt: prompt,
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
  const apiKey = process.env.ZHIPU_API_KEY;
  if (!apiKey) {
    console.warn("ZHIPU_API_KEY is not set, using mock greeting");
    // Mock acrostic poem based on name length
    const poem = name.split("").map(char => `${char}风得意马蹄疾`); // Simple mock
    return {
      poem: [
        `${name[0]}风得意马蹄疾`,
        `${name[1] || "福"}气东来满乾坤`,
        "新岁宏图千万里",
        "马到成功步步高"
      ],
      wish: "祝您2026马年大吉，龙马精神，万事如意！"
    };
  }

  const response = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "glm-4",
      messages: [
         {
           role: "system",
           content: "你是一个精通中国传统文化和诗词的AI助手。请为用户生成一段2026马年新年祝福，要求包含藏头诗（以名字的每个字开头）和一段简短的祝福语。返回JSON格式，包含 poem (数组，每句一行) 和 wish (字符串)。"
         },
         {
           role: "user",
           content: `我的名字是${name}，请为我生成马年新年祝福。`
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
  } catch (e) {
    // Fallback if not valid JSON
    return {
      poem: content.split("\n").filter((line: string) => line.trim()),
      wish: "新年快乐！"
    };
  }
}
