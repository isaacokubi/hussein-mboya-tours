import test from "node:test";
import assert from "node:assert/strict";
import { resolveSiteOrigin } from "../services/sitemapService.js";

const request = (headers = {}) => ({ get: (name) => headers[name.toLowerCase()] || "" });

test("sitemap origin prefers the tenant's verified custom domain", () => {
  assert.equal(
    resolveSiteOrigin(request({ origin: "https://other-tenant.vercel.app" }), {
      slug: "safari-co",
      domain: "safari.example.ke",
      websiteUrl: "",
    }),
    "https://safari.example.ke"
  );
});

test("sitemap origin accepts the tenant-configured website URL", () => {
  assert.equal(
    resolveSiteOrigin(request({ origin: "https://other-tenant.vercel.app" }), {
      slug: "safari-co",
      domain: "",
      websiteUrl: "https://safari.example.ke/about",
    }),
    "https://safari.example.ke"
  );
});

test("sitemap origin accepts only the matching tenant Vercel host", () => {
  assert.equal(
    resolveSiteOrigin(request({ origin: "https://safari-co.vercel.app" }), {
      slug: "safari-co",
      domain: "",
      websiteUrl: "",
    }),
    "https://safari-co.vercel.app"
  );
  assert.throws(
    () => resolveSiteOrigin(request({ origin: "https://another-tenant.vercel.app", "x-forwarded-host": "another-tenant.vercel.app" }), {
      slug: "safari-co",
      domain: "",
      websiteUrl: "",
    }),
    /Tenant website origin is not configured/
  );
});
