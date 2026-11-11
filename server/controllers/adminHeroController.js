/**
 * Purpose: admin Hero Controller HTTP controller. Main declarations: tenant, clean, payload, listHeroSlides, createHeroSlide.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../models/HeroSlide.js so this module can use its exported dependencies.
import HeroSlide from "../models/HeroSlide.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { getTenantContext, requireTenantId } from "../tenancy/context.js";

// Declare tenant for use by the surrounding module or function.
const tenant = () => { requireTenantId(); return getTenantContext().tenantId; };
// Declare clean for use by the surrounding module or function.
const clean = (value) => String(value ?? "").trim();
// Declare payload for use by the surrounding module or function.
const payload = (body = {}) => ({
  title: clean(body.title), subtitle: clean(body.subtitle), badge: clean(body.badge) || "Discover Africa",
  image: { url: clean(body.imageUrl), publicId: clean(body.imagePublicId) }, video: { url: clean(body.videoUrl), publicId: clean(body.videoPublicId) },
  buttonOne: { text: clean(body.buttonOneText) || "Explore Tours", link: clean(body.buttonOneLink) || "/tours" },
  buttonTwo: { text: clean(body.buttonTwoText) || "Book Now", link: clean(body.buttonTwoLink) || "/contact" },
  active: body.active !== false, order: Number(body.order || 0),
});

// Declare listHeroSlides for use by the surrounding module or function.
export const listHeroSlides = async (req, res) => res.json({ success: true, slides: await HeroSlide.find({ tenantId: tenant() }).sort({ order: 1, createdAt: 1 }).lean() });
// Declare createHeroSlide for use by the surrounding module or function.
export const createHeroSlide = async (req, res) => { const slide = await HeroSlide.create({ tenantId: tenant(), ...payload(req.body) }); return res.status(201).json({ success: true, slide }); };
// Declare updateHeroSlide for use by the surrounding module or function.
export const updateHeroSlide = async (req, res) => { const tenantId = tenant(); if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid hero slide id" }); const slide = await HeroSlide.findOneAndUpdate({ _id: req.params.id, tenantId }, payload(req.body), { new: true, runValidators: true }).lean(); if (!slide) return res.status(404).json({ success: false, message: "Hero slide not found" }); return res.json({ success: true, slide }); };
// Declare deleteHeroSlide for use by the surrounding module or function.
export const deleteHeroSlide = async (req, res) => { const deleted = await HeroSlide.findOneAndDelete({ _id: req.params.id, tenantId: tenant() }); if (!deleted) return res.status(404).json({ success: false, message: "Hero slide not found" }); return res.json({ success: true, message: "Hero slide deleted" }); };
