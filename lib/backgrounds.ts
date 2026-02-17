export const HORSE_BACKGROUNDS = [
  "/backgrounds/bg-1.jpg",
  "/backgrounds/bg-2.jpg",
  "/backgrounds/bg-3.jpg",
  "/backgrounds/bg-4.jpg",
  "/backgrounds/bg-5.jpg",
  "/backgrounds/bg-6.jpg",
  "/backgrounds/bg-7.jpg",
  "/backgrounds/bg-8.jpg",
  "/backgrounds/bg-9.jpg",
  "/backgrounds/bg-10.jpg",
];

const STORAGE_KEY = 'new_year_card_backgrounds_pool';

// Helper to get the current pool (fallback to built-in if empty or invalid)
function getPool(): string[] {
  if (typeof window === 'undefined') return HORSE_BACKGROUNDS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const pool = JSON.parse(stored);
      // Ensure it's an array of 10 strings
      if (Array.isArray(pool) && pool.length === 10) {
        return pool;
      }
    }
  } catch (e) {
    console.warn('Failed to read background pool', e);
  }
  return HORSE_BACKGROUNDS;
}

export function getNextBuiltinBackground(currentUrl?: string | null): string {
  const pool = getPool();
  let available = pool;
  if (currentUrl) {
    available = pool.filter(url => url !== currentUrl);
  }
  if (available.length === 0) return pool[0];
  return available[Math.floor(Math.random() * available.length)];
}

export function getRandomBuiltinBackground(): string {
  const pool = getPool();
  return pool[Math.floor(Math.random() * pool.length)];
}

// Replaces the oldest background (last index) with the new one (inserted at 0)
// Maintains a fixed size of 10
export function saveBackgroundToLocal(url: string) {
  if (typeof window === 'undefined') return;
  
  // Don't add if already exists (prevent duplicates)
  const currentPool = getPool();
  if (currentPool.includes(url)) return;

  try {
    // Create new pool: [newUrl, ...oldPool]
    // Then slice to first 10
    const newPool = [url, ...currentPool].slice(0, 10);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPool));
  } catch (e) {
    console.warn('Failed to update background pool', e);
  }
}

export function getCombinedBackgrounds(): string[] {
  // Now simply returns the current pool as the "combined" source of truth
  return getPool();
}
