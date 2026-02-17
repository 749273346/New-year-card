const SAFE_SVG_1 = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1600" viewBox="0 0 1200 1600"><defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#8b1b1b"/><stop offset="100%" stop-color="#3b0a0a"/></linearGradient><linearGradient id="g2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f7d774" stop-opacity="0.9"/><stop offset="100%" stop-color="#b66a17" stop-opacity="0.6"/></linearGradient></defs><rect width="1200" height="1600" fill="url(#g1)"/><circle cx="260" cy="320" r="220" fill="url(#g2)" opacity="0.35"/><circle cx="920" cy="1180" r="260" fill="url(#g2)" opacity="0.25"/><path d="M0 1220 Q300 1120 600 1240 T1200 1220 V1600 H0 Z" fill="#5a0f0f" opacity="0.5"/></svg>`;
const SAFE_SVG_2 = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1600" viewBox="0 0 1200 1600"><defs><linearGradient id="r1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#7f1010"/><stop offset="100%" stop-color="#2b0606"/></linearGradient><linearGradient id="r2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ffd46b" stop-opacity="0.65"/><stop offset="100%" stop-color="#9b4f14" stop-opacity="0.25"/></linearGradient></defs><rect width="1200" height="1600" fill="url(#r1)"/><rect x="80" y="100" width="1040" height="1400" rx="40" fill="none" stroke="#ffd46b" stroke-opacity="0.25" stroke-width="6"/><path d="M0 300 C200 240 400 360 600 300 C800 240 1000 360 1200 300" stroke="#ffd46b" stroke-opacity="0.2" stroke-width="6" fill="none"/><path d="M0 1320 C200 1260 400 1380 600 1320 C800 1260 1000 1380 1200 1320" stroke="#ffd46b" stroke-opacity="0.2" stroke-width="6" fill="none"/><circle cx="900" cy="420" r="180" fill="url(#r2)" opacity="0.35"/></svg>`;

export const HORSE_BACKGROUNDS = [
  `data:image/svg+xml;utf8,${encodeURIComponent(SAFE_SVG_1)}`,
  `data:image/svg+xml;utf8,${encodeURIComponent(SAFE_SVG_2)}`,
  "https://image.pollinations.ai/prompt/Chinese%20ink%20painting%20of%20a%20galloping%20horse%20red%20gold%20festive%20background?width=1024&height=1024&seed=101&nologo=true",
  "https://image.pollinations.ai/prompt/Majestic%20horse%20running%20traditional%20Chinese%20art%20red%20atmosphere?width=1024&height=1024&seed=102&nologo=true",
  "https://image.pollinations.ai/prompt/Golden%20horse%20illustration%20Chinese%20New%20Year%20style%20red%20background?width=1024&height=1024&seed=103&nologo=true",
  "https://image.pollinations.ai/prompt/Powerful%20horse%20silhouette%20against%20red%20lanterns%20digital%20art?width=1024&height=1024&seed=104&nologo=true",
  "https://image.pollinations.ai/prompt/Artistic%20Chinese%20horse%20watercolor%20red%20and%20gold%20splash?width=1024&height=1024&seed=105&nologo=true",
  "https://image.pollinations.ai/prompt/Festive%20Lunar%20New%20Year%20horse%20artwork%20glowing%20red?width=1024&height=1024&seed=106&nologo=true",
  "https://image.pollinations.ai/prompt/Dynamic%20horse%20pose%20Chinese%20brush%20style%20celebration?width=1024&height=1024&seed=107&nologo=true",
  "https://image.pollinations.ai/prompt/Elegant%20horse%20standing%20traditional%20pattern%20background%20red?width=1024&height=1024&seed=108&nologo=true",
  "https://image.pollinations.ai/prompt/Abstract%20horse%20concept%20Chinese%20red%20gold%20elements?width=1024&height=1024&seed=109&nologo=true",
  "https://image.pollinations.ai/prompt/Detailed%20illustration%20of%20a%20horse%20Chinese%20mythology%20style?width=1024&height=1024&seed=110&nologo=true"
];

const LOCAL_STORAGE_KEY = "new_year_card_backgrounds";

function normalizeBackgroundUrl(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (typeof value !== "object" || value === null) return null;
  const maybe = value as { url?: unknown };
  if (typeof maybe.url === "string") return maybe.url;
  return null;
}

function isExpiredSignedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const expires = parsed.searchParams.get("Expires");
    if (!expires) return false;
    const exp = Number(expires);
    if (!Number.isFinite(exp)) return false;
    return exp * 1000 <= Date.now() + 60_000;
  } catch {
    return false;
  }
}

function readLocalBackgrounds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    const normalized = parsed
      .map(normalizeBackgroundUrl)
      .filter((u): u is string => typeof u === "string" && u.length > 0)
      .filter((u) => !isExpiredSignedUrl(u))
      .slice(0, 20);

    if (normalized.length !== parsed.length) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(normalized));
    }

    return normalized;
  } catch (e) {
    console.warn("Failed to read local backgrounds:", e);
    return [];
  }
}

export function getNextBuiltinBackground(currentUrl?: string | null): string {
  let available = HORSE_BACKGROUNDS;
  if (currentUrl) {
    available = HORSE_BACKGROUNDS.filter(url => url !== currentUrl);
  }
  if (available.length === 0) return HORSE_BACKGROUNDS[0];
  return available[Math.floor(Math.random() * available.length)];
}

export function getRandomBuiltinBackground(): string {
  // Try to get locally stored backgrounds first
  if (typeof window !== "undefined") {
    const localBackgrounds = readLocalBackgrounds();
    if (localBackgrounds.length > 0 && Math.random() > 0.5) {
      return localBackgrounds[Math.floor(Math.random() * localBackgrounds.length)];
    }
  }
  
  return HORSE_BACKGROUNDS[Math.floor(Math.random() * HORSE_BACKGROUNDS.length)];
}

export function saveBackgroundToLocal(url: string) {
  if (typeof window === "undefined" || !url) return;
  
  try {
    if (isExpiredSignedUrl(url)) return;
    let backgrounds = readLocalBackgrounds();
    
    // Avoid duplicates
    if (!backgrounds.includes(url)) {
      // Keep only the latest 20 generated backgrounds to manage storage size
      backgrounds = [url, ...backgrounds].slice(0, 20);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(backgrounds));
    }
  } catch (e) {
    console.warn("Failed to save background locally:", e);
  }
}
