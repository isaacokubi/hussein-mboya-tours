import TravelGuide from "../models/TravelGuide.js";
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import { tenantFilter } from "../tenancy/tenantQuery.js";

const slugify = (value) => String(value || "")
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "")
  .slice(0, 200);

const cleanTags = (value) => Array.isArray(value)
  ? [...new Set(value.map((item) => String(item || "").trim().slice(0, 40)).filter(Boolean))].slice(0, 12)
  : [];

const cleanContent = (value) => String(value || "").trim().slice(0, 50000);

const publicFields = "title slug excerpt content category tags coverImage publishedAt seoTitle seoDescription createdAt updatedAt";
const isSafeImageUrl = (value) => {
  const url = String(value || "").trim();
  if (!url) return true;
  if (url.startsWith("/") && !url.startsWith("//")) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
};

export async function listPublicTravelGuides(req, res, next) {
  try {
    const filter = mergeTenantFilter({ status: "published" });
    if (req.query.category) filter.category = String(req.query.category).trim().slice(0, 80);
    const guides = await TravelGuide.find(filter)
      .select("title slug excerpt category tags coverImage publishedAt seoTitle seoDescription")
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(50)
      .lean();
    res.json({ success: true, guides, count: guides.length });
  } catch (error) { next(error); }
}

export async function getPublicTravelGuide(req, res, next) {
  try {
    const guide = await TravelGuide.findOne(mergeTenantFilter({ status: "published", slug: slugify(req.params.slug) }))
      .select(publicFields)
      .lean();
    if (!guide) return res.status(404).json({ success: false, message: "Travel guide not found" });
    res.json({ success: true, guide });
  } catch (error) { next(error); }
}

export async function listAdminTravelGuides(req, res, next) {
  try {
    requireTenantId();
    const guides = await TravelGuide.find(tenantFilter(req)).sort({ updatedAt: -1 }).limit(200).lean();
    res.json({ success: true, guides, count: guides.length });
  } catch (error) { next(error); }
}

export async function createTravelGuide(req, res, next) {
  try {
    const tenantId = requireTenantId();
    const title = String(req.body.title || "").trim();
    const content = cleanContent(req.body.content);
    const slug = slugify(req.body.slug || title);
    if (!title) return res.status(400).json({ success: false, message: "Title is required" });
    if (!slug) return res.status(400).json({ success: false, message: "A valid slug is required" });
    if (!content) return res.status(400).json({ success: false, message: "Article content is required" });
    const status = req.body.status === "published" ? "published" : "draft";
    const coverImage = String(req.body.coverImage || "").trim().slice(0, 2048);
    if (!isSafeImageUrl(coverImage)) return res.status(400).json({ success: false, message: "Cover image must use HTTP(S) or a same-site path" });
    const guide = await TravelGuide.create({
      tenantId, title, slug, content,
      excerpt: String(req.body.excerpt || "").trim().slice(0, 600),
      category: String(req.body.category || "Travel tips").trim().slice(0, 80),
      tags: cleanTags(req.body.tags),
      coverImage,
      status,
      publishedAt: status === "published" ? new Date() : null,
      seoTitle: String(req.body.seoTitle || "").trim().slice(0, 180),
      seoDescription: String(req.body.seoDescription || "").trim().slice(0, 320),
    });
    res.status(201).json({ success: true, guide });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ success: false, message: "A guide with this slug already exists for this tenant" });
    next(error);
  }
}

export async function updateTravelGuide(req, res, next) {
  try {
    requireTenantId();
    const update = {};
    if (req.body.title !== undefined) update.title = String(req.body.title).trim().slice(0, 180);
    if (req.body.slug !== undefined) update.slug = slugify(req.body.slug);
    if (req.body.excerpt !== undefined) update.excerpt = String(req.body.excerpt).trim().slice(0, 600);
    if (req.body.content !== undefined) update.content = cleanContent(req.body.content);
    if (req.body.category !== undefined) update.category = String(req.body.category).trim().slice(0, 80);
    if (req.body.tags !== undefined) update.tags = cleanTags(req.body.tags);
    if (req.body.coverImage !== undefined) {
      update.coverImage = String(req.body.coverImage).trim().slice(0, 2048);
      if (!isSafeImageUrl(update.coverImage)) return res.status(400).json({ success: false, message: "Cover image must use HTTP(S) or a same-site path" });
    }
    if (req.body.seoTitle !== undefined) update.seoTitle = String(req.body.seoTitle).trim().slice(0, 180);
    if (req.body.seoDescription !== undefined) update.seoDescription = String(req.body.seoDescription).trim().slice(0, 320);
    if (req.body.status !== undefined) {
      if (!["draft", "published"].includes(req.body.status)) return res.status(400).json({ success: false, message: "Status must be draft or published" });
      update.status = req.body.status;
      if (req.body.status === "draft") update.publishedAt = null;
    }
    if (update.title === "") return res.status(400).json({ success: false, message: "Title cannot be empty" });
    if (update.slug === "") return res.status(400).json({ success: false, message: "Slug cannot be empty" });
    if (update.content === "") return res.status(400).json({ success: false, message: "Article content cannot be empty" });
    const current = await TravelGuide.findOne(mergeTenantFilter(req, { _id: req.params.id })).select("status publishedAt");
    if (!current) return res.status(404).json({ success: false, message: "Travel guide not found" });
    if (update.status === "published" && (current.status !== "published" || !current.publishedAt)) update.publishedAt = new Date();
    const guide = await TravelGuide.findOneAndUpdate(
      mergeTenantFilter(req, { _id: req.params.id }),
      update,
      { new: true, runValidators: true }
    );
    if (!guide) return res.status(404).json({ success: false, message: "Travel guide not found" });
    res.json({ success: true, guide });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ success: false, message: "A guide with this slug already exists for this tenant" });
    next(error);
  }
}

export async function deleteTravelGuide(req, res, next) {
  try {
    requireTenantId();
    const guide = await TravelGuide.findOneAndDelete(mergeTenantFilter(req, { _id: req.params.id }));
    if (!guide) return res.status(404).json({ success: false, message: "Travel guide not found" });
    res.json({ success: true, message: "Travel guide deleted" });
  } catch (error) { next(error); }
}
