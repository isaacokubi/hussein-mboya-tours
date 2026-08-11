import Gallery from "../models/Gallery.js";

export const getAdminGallery = async (req, res, next) => {
  try {
    const gallery = await Gallery.find().sort({ createdAt: -1 });
    res.json({ success: true, count: gallery.length, gallery });
  } catch (error) { next(error); }
};

export const createAdminGallery = async (req, res, next) => {
  try {
    const { title, category, featured, active, imageUrl, publicId } = req.body;
    if (!title) return res.status(400).json({ success: false, message: "Title is required" });
    const item = await Gallery.create({
      title,
      category,
      featured: Boolean(featured),
      active: active !== false,
      image: { url: imageUrl || "", publicId: publicId || "" },
    });
    res.status(201).json({ success: true, gallery: item });
  } catch (error) { next(error); }
};

export const updateAdminGallery = async (req, res, next) => {
  try {
    const item = await Gallery.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ success: false, message: "Gallery item not found" });
    res.json({ success: true, gallery: item });
  } catch (error) { next(error); }
};

export const deleteAdminGallery = async (req, res, next) => {
  try {
    const item = await Gallery.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Gallery item not found" });
    res.json({ success: true, message: "Gallery item deleted" });
  } catch (error) { next(error); }
};
