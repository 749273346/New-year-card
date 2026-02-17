const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

async function main() {
  const baseUrl = process.env.BASE_URL || "http://localhost:3000";
  const downloadDir = path.join(process.cwd(), ".playwright-downloads");
  fs.mkdirSync(downloadDir, { recursive: true });
  const savePath = path.join(downloadDir, `card-${Date.now()}.png`);

  const browser = await chromium.launch();
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();

  const errors = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${String(e)}`));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(`console.error: ${msg.text()}`);
  });

  await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "生成我的贺卡" }).waitFor({ timeout: 30000 });
  await page.fill("#name", "杨昊");
  await page.getByRole("button", { name: "生成我的贺卡" }).click({ force: true });
  await page.getByText("正在为您制作贺卡...").waitFor({ timeout: 5000 });
  await page.waitForURL(/\/card\?name=/, { waitUntil: "commit", timeout: 60000 });

  await page.getByRole("button", { name: "保存贺卡" }).waitFor({ timeout: 30000 });
  await page.waitForTimeout(1500);

  const [download] = await Promise.all([
    page.waitForEvent("download", { timeout: 30000 }),
    page.getByRole("button", { name: "保存贺卡" }).click(),
  ]);

  await download.saveAs(savePath);
  const stat = fs.statSync(savePath);
  if (stat.size < 10_000) {
    throw new Error(`下载文件异常（过小）：${savePath} (${stat.size} bytes)`);
  }

  const bad = errors.filter((e) => /oklab|oklch/i.test(e));
  if (bad.length) {
    throw new Error(`发现 oklab 相关错误：\n${bad.join("\n")}`);
  }

  console.log(`OK: saved ${savePath} (${stat.size} bytes)`);

  await page.close();
  await context.close();
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
