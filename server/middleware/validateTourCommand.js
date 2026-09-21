const parseDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export default function validateTourCommand({ allowPast = false } = {}) {
  return (req, res, next) => {
    const body = req.body || {};
    if (req.method !== "DELETE") {
      if (body.title !== undefined && !String(body.title).trim()) return res.status(400).json({ success:false, message:"Tour title is required." });
      if (body.description !== undefined && !String(body.description).trim()) return res.status(400).json({ success:false, message:"Tour description is required." });
      if (body.price !== undefined && (!Number.isFinite(Number(body.price)) || Number(body.price) < 0)) return res.status(400).json({ success:false, message:"Tour price must be a non-negative number." });
      if (body.capacity !== undefined && (!Number.isInteger(Number(body.capacity)) || Number(body.capacity) < 1)) return res.status(400).json({ success:false, message:"Tour capacity must be a positive whole number." });
      if (body.discount !== undefined && (!Number.isFinite(Number(body.discount)) || Number(body.discount) < 0 || Number(body.discount) > 100)) return res.status(400).json({ success:false, message:"Discount must be between 0 and 100 percent." });
      if (body.depositRequired !== undefined && (!Number.isFinite(Number(body.depositRequired)) || Number(body.depositRequired) < 0)) return res.status(400).json({ success:false, message:"Deposit must be non-negative." });
      if (body.depositType !== undefined && !["fixed","percentage"].includes(String(body.depositType).toLowerCase())) return res.status(400).json({ success:false, message:"depositType must be fixed or percentage." });
      if (body.duration !== undefined) { const match = String(body.duration).match(/\\d+(?:\\.\\d+)?/); const duration = Number(match?.[0]); if (!Number.isFinite(duration) || duration < 1 || duration > 365) return res.status(400).json({ success:false, message:"Duration must be between 1 and 365 days." }); }
      if (body.durationDays !== undefined && (!Number.isInteger(Number(body.durationDays)) || Number(body.durationDays) < 1 || Number(body.durationDays) > 365)) return res.status(400).json({ success:false, message:"durationDays must be a whole number between 1 and 365." });
      for (const field of ["date", "startDate"]) {
        if (body[field] === undefined) continue;
        const date = parseDate(body[field]);
        if (!date) return res.status(400).json({ success:false, message:`Tour ${field} must be valid.` });
        if (!allowPast) { const today = new Date(); today.setHours(0,0,0,0); date.setHours(0,0,0,0); if (date < today) return res.status(400).json({ success:false, message:`Tour ${field} cannot be in the past.` }); }
      }
    }
    return next();
  };
}
