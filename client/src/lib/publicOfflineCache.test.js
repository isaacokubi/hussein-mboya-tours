import assert from "node:assert/strict";
import test from "node:test";
import {
  clearPublicOfflineCache,
  getPublicDataWithOfflineFallback,
} from "./publicOfflineCache.js";

// Provide a small browser-storage double so the cache tests run in Node without touching real user data.
const makeStorage = () => {
  const values = new Map();
  return {
    get length() { return values.size; },
    getItem: (key) => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
    key: (index) => [...values.keys()][index] ?? null,
  };
};

const originalWindow = globalThis.window;
const originalCustomEvent = globalThis.CustomEvent;

test("public catalogue cache returns the online response and reuses it after a network failure", async () => {
  const storage = makeStorage();
  const dispatched = [];
  globalThis.window = {
    location: { hostname: "demo.example.test", search: "" },
    localStorage: storage,
    dispatchEvent: (event) => dispatched.push(event),
  };
  globalThis.CustomEvent = class CustomEvent {
    constructor(type, init) { this.type = type; this.detail = init?.detail; }
  };

  try {
    const onlineData = [{ _id: "public-tour-1", name: "Demo Safari" }];
    const first = await getPublicDataWithOfflineFallback("tours", { page: 1 }, async () => onlineData);
    assert.deepEqual(first, onlineData);

    const second = await getPublicDataWithOfflineFallback("tours", { page: 1 }, async () => {
      throw new Error("Network unavailable");
    });
    assert.deepEqual(second, onlineData);
    assert.equal(dispatched[0]?.type, "app:offline-cache-used");
    assert.equal(dispatched[0]?.detail?.resource, "tours");
  } finally {
    globalThis.window = originalWindow;
    globalThis.CustomEvent = originalCustomEvent;
  }
});

test("public catalogue cache is isolated by tenant host", async () => {
  const storage = makeStorage();
  globalThis.window = {
    location: { hostname: "tenant-a.example.test", search: "" },
    localStorage: storage,
    dispatchEvent: () => {},
  };

  try {
    await getPublicDataWithOfflineFallback("tours", {}, async () => [{ name: "Tenant A tour" }]);
    window.location.hostname = "tenant-b.example.test";

    await assert.rejects(
      getPublicDataWithOfflineFallback("tours", {}, async () => {
        throw new Error("Network unavailable");
      }),
      /Network unavailable/
    );
  } finally {
    globalThis.window = originalWindow;
    globalThis.CustomEvent = originalCustomEvent;
  }
});

test("server HTTP errors are not hidden by stale public cache data", async () => {
  const storage = makeStorage();
  globalThis.window = {
    location: { hostname: "tenant-c.example.test", search: "" },
    localStorage: storage,
    dispatchEvent: () => {},
  };

  try {
    await getPublicDataWithOfflineFallback("tours", {}, async () => [{ name: "Saved tour" }]);
    const forbidden = Object.assign(new Error("Forbidden"), { response: { status: 403 } });
    await assert.rejects(
      getPublicDataWithOfflineFallback("tours", {}, async () => { throw forbidden; }),
      /Forbidden/
    );
  } finally {
    globalThis.window = originalWindow;
    globalThis.CustomEvent = originalCustomEvent;
  }
});

test("clearPublicOfflineCache removes only entries owned by this cache", () => {
  const storage = makeStorage();
  globalThis.window = {
    location: { hostname: "tenant-d.example.test", search: "" },
    localStorage: storage,
  };

  try {
    storage.setItem("global-tours:public-cache:v1:test", "{}");
    storage.setItem("another-app:session", "leave-alone");
    clearPublicOfflineCache();
    assert.equal(storage.getItem("global-tours:public-cache:v1:test"), null);
    assert.equal(storage.getItem("another-app:session"), "leave-alone");
  } finally {
    globalThis.window = originalWindow;
    globalThis.CustomEvent = originalCustomEvent;
  }
});
