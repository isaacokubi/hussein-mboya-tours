import mongoose from "mongoose";
import HeroSlide from "../models/HeroSlide.js";
import { requireTenantId } from "../tenancy/context.js";

const clean = (value) => String(value ?? "").trim();

export const listHeroSlides = async (req, res) => {
  requireTenantId();
  const tenantId = req.tenantId || req.user?.tenantId;
  const slides = await HeroSlide.find({ tenantId }).sort({ order: 1, createdAt: 1 }).lean();
  return res.json({ success: true, slides });
};

export const createHeroSlide = async (req, res) => {
  requireTenantId();
  const tenantId = req.tenantId || req.user?.tenantId;
  const body = req.body || {};
  const slide = await HeroSlide.create({
    tenantId,
    title: clean(body.title), subtitle: clean(body.subtitle), badge: clean(body.badge) || "Discover Africa",
    image: { url: clean(body.imageUrl), publicId: clean(body.imagePublicId) },
    video: { url: clean(body.videoUrl), publicId: clean(body.videoPublicId) },
    buttonOne: { text: clean(body.buttonOneText) || "Explore Tours", link: clean(body.buttonOneLink) || "/tours" },
    buttonTwo: { text: clean(body.buttonTwoText) || "Book Now", link: clean(body.buttonTwoLink) || "/contact" },
    active: body.active !== false, order: Number(body.order || 0),
  });
  return res.status(201).json({ success: true, slide });
};

export const updateHeroSlide = async (req, res) => {
  requireTenantId();
  const tenantId = req.tenantId || req.user?.tenantId;
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid hero slide id" });
  const body = req.body || {};
  const updates = {
    title: clean(body.title), subtitle: clean(body.subtitle), badge: clean(body.badge),
    image: { url: clean(body.imageUrl), publicId: clean(body.imagePublicId) }, video: { url: clean(body.videoUrl), publicId: clean(body.videoPublicId) },
    buttonOne: { text: clean(body.buttonOneText) || "Explore Tours", link: clean(body.buttonOneLink) || "/tours" }, buttonTwo: { text: clean(body.buttonTwoText) || "Book Now", link: clean(body.buttonTwoLink) || "/contact" },
    active: body.active !== false, order: Number(body.order || 0),
  };
  const slide = await HeroSlide.findOneAndUpdate({ _id: req.params.id, tenantId }, updates, { new: true, runValidators: true }).lean();
  if (!slide) return res.status(404).json({ success: false, message: "Hero slide not found" });
  return res.json({ success: true, slide });
};

export const deleteHeroSlide = async (req, res) => {
  requireTenantId();
  const tenantId = req.tenantId || req.user?.tenantId;
  const deleted = await HeroSlide.findOneAndDelete({ _id: req.params.id, tenantId });
  if (!deleted) return res.status(404).json({ success: false, message: "Hero slide not found" });
  return res.json({ success: true, message: "Hero slide deleted" });
};
