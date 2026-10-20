// Keep only public, read-only catalogue responses available during short network outages.
 // Private user records, bookings, financial data and payment responses must never enter this cache.
const CACHE_PREFIX = "global-tours:public-cache:v1:";
const MAX_CACHE_AGE_MS = 30 * 24 * 60 * 60 * 1000;

const getTenantNamespace = () => {
  if (typeof window === "undefined") return "server";
  // Custom tenant domains and subdomains get separate cache namespaces.
  // This prevents one tenant's public catalogue from being reused on another host.
  const host = window.location?.hostname || "unknown-host";
  const explicitTenant = new URLSearchParams(window.location?.search || "").get("tenant") || "";
  return `${host}:${explicitTenant}`;
};

const buildCacheKey = (resource, params = {}) => {
  const normalizedParams = Object.keys(params || {})
    .sort()
    .reduce((result, key) => {
      const value = params[key];
      if (value !== undefined && value !== null && value !== "") result[key] = value;
      return result;
    }, {});
  return `${CACHE_PREFIX}${encodeURIComponent(getTenantNamespace())}:${encodeURIComponent(resource)}:${encodeURIComponent(JSON.stringify(normalizedParams))}`;
};

const readCache = (key) => {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const record = JSON.parse(raw);
    if (!record || !Number.isFinite(record.savedAt) || !("data" in record)) return null;
    // Expired catalogue is not shown as current data; a fresh online response replaces it.
    if (Date.now() - record.savedAt > MAX_CACHE_AGE_MS) {
      window.localStorage.removeItem(key);
      return null;
    }
    return record.data;
  } catch {
    // Private browsing, quota restrictions, or malformed old entries must not break the page.
    return null;
  }
};

const writeCache = (key, data) => {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    window.localStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), data }));
  } catch {
    // Caching is best-effort: a storage failure must not turn a successful API request into failure.
  }
};

const announceOfflineFallback = (resource) => {
  if (typeof window === "undefined" || typeof window.dispatchEvent !== "function") return;
  try {
    window.dispatchEvent(new CustomEvent("app:offline-cache-used", { detail: { resource } }));
  } catch {
    // The cached result remains usable even in browsers without CustomEvent support.
  }
};

/**
 * Fetch public catalogue data online and remember it for offline read-only viewing.
 * Only fall back on network errors; server authorization and validation errors stay visible.
 */
export async function getPublicDataWithOfflineFallback(resource, params, fetcher) {
  const key = buildCacheKey(resource, params);
  try {
    const data = await fetcher();
    writeCache(key, data);
    return data;
  } catch (error) {
    if (error?.response) throw error;
    const cached = readCache(key);
    if (cached === null) throw error;
    announceOfflineFallback(resource);
    return cached;
  }
}

/** Clear only this browser's public catalogue cache; never affects server records. */
export function clearPublicOfflineCache() {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    const keys = [];
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);
      if (key?.startsWith(CACHE_PREFIX)) keys.push(key);
    }
    keys.forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // Cleanup is best-effort and must not prevent logout/navigation.
  }
}
