import mongoose from "mongoose";
import HeroSlide from "../models/HeroSlide.js";
import { getTenantContext, requireTenantId } from "../tenancy/context.js";

const tenant = () => { requireTenantId(); return getTenantContext().tenantId; };
const clean = (value) => String(value ?? "").trim();
const payload = (body = {}) => ({
  title: clean(body.title), subtitle: clean(body.subtitle), badge: clean(body.badge) || "Discover Africa",
  image: { url: clean(body.imageUrl), publicId: clean(body.imagePublicId) }, video: { url: clean(body.videoUrl), publicId: clean(body.videoPublicId) },
  buttonOne: { text: clean(body.buttonOneText) || "Explore Tours", link: clean(body.buttonOneLink) || "/tours" },
  buttonTwo: { text: clean(body.buttonTwoText) || "Book Now", link: clean(body.buttonTwoLink) || "/contact" },
  active: body.active !== false, order: Number(body.order || 0),
});

export const listHeroSlides = async (req, res) => res.json({ success: true, slides: await HeroSlide.find({ tenantId: tenant() }).sort({ order: 1, createdAt: 1 }).lean() });
export const createHeroSlide = async (req, res) => { const slide = await HeroSlide.create({ tenantId: tenant(), ...payload(req.body) }); return res.status(201).json({ success: true, slide }); };
export const updateHeroSlide = async (req, res) => { const tenantId = tenant(); if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid hero slide id" }); const slide = await HeroSlide.findOneAndUpdate({ _id: req.params.id, tenantId }, payload(req.body), { new: true, runValidators: true }).lean(); if (!slide) return res.status(404).json({ success: false, message: "Hero slide not found" }); return res.json({ success: true, slide }); };
export const deleteHeroSlide = async (req, res) => { const deleted = await HeroSlide.findOneAndDelete({ _id: req.params.id, tenantId: tenant() }); if (!deleted) return res.status(404).json({ success: false, message: "Hero slide not found" }); return res.json({ success: true, message: "Hero slide deleted" }); };
