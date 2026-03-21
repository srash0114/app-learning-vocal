/**
 * Gemini API Key Rotation Manager with Rate Limiting
 * Distributes requests across multiple API keys + implements per-key rate limiting
 * Each key: ~15 requests/minute, min interval: ~4 seconds between requests
 */

let currentKeyIndex = 0;
const MIN_INTERVAL_MS = 4000; // 4 seconds between requests per key
const keyLastUsedTime: Record<number, number> = {};

export function getGeminiApiKeys(): string[] {
  const keys = [
    process.env.GEMINI_API_KEY_1 || '',
    process.env.GEMINI_API_KEY_2 || '',
    process.env.GEMINI_API_KEY_3 || '',
    process.env.GEMINI_API_KEY_4 || '',
  ].filter(key => key.length > 0);

  if (keys.length === 0) {
    throw new Error('No Gemini API keys configured');
  }

  return keys;
}

export async function getNextApiKey(): Promise<string> {
  const keys = getGeminiApiKeys();
  const keyIndex = currentKeyIndex % keys.length;
  const lastUsed = keyLastUsedTime[keyIndex] || 0;
  const now = Date.now();
  const timeSinceLastUse = now - lastUsed;

  // Wait if necessary to respect rate limit
  if (timeSinceLastUse < MIN_INTERVAL_MS) {
    const delayMs = MIN_INTERVAL_MS - timeSinceLastUse;
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }

  // Update last used time and return key
  keyLastUsedTime[keyIndex] = Date.now();
  currentKeyIndex++;
  
  return keys[keyIndex];
}

export function getCurrentKeyIndex(): number {
  return currentKeyIndex % getGeminiApiKeys().length;
}

export function resetKeyIndex(): void {
  currentKeyIndex = 0;
  Object.keys(keyLastUsedTime).forEach(key => delete keyLastUsedTime[parseInt(key)]);
}
