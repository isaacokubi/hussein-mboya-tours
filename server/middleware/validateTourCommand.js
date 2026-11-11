/**
 * Purpose: validate Tour Command request middleware. Main declarations: parseDate, validateTourCommand.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
const parseDate = (value) => {
  // Declare date for use by the surrounding module or function.
  const date = new Date(value);
  // Return the expression shown below to the caller.
  return Number.isNaN(date.getTime()) ? null : date;
};

// Define validateTourCommand; its parameters and body implement this operation.
export default function validateTourCommand({ allowPast = false } = {}) {
  // Return the expression shown below to the caller.
  return (req, res, next) => {
    // Declare body for use by the surrounding module or function.
    const body = req.body || {};
    // Check the condition (req.method !== "DELETE") and run the matching branch.
    if (req.method !== "DELETE") {
      // Check the condition (body.title !== undefined && !String(body.title).trim()) and run the matching branch.
      if (body.title !== undefined && !String(body.title).trim()) return res.status(400).json({ success:false, message:"Tour title is required." });
      // Check the condition (body.description !== undefined && !String(body.description).trim()) and run the matching branch.
      if (body.description !== undefined && !String(body.description).trim()) return res.status(400).json({ success:false, message:"Tour description is required." });
      // Check the condition (body.price !== undefined && (!Number.isFinite(Number(body.price)) || N) and run the matching branch.
      if (body.price !== undefined && (!Number.isFinite(Number(body.price)) || Number(body.price) < 0)) return res.status(400).json({ success:false, message:"Tour price must be a non-negative number." });
      // Check the condition (body.capacity !== undefined && (!Number.isInteger(Number(body.capacity) and run the matching branch.
      if (body.capacity !== undefined && (!Number.isInteger(Number(body.capacity)) || Number(body.capacity) < 1)) return res.status(400).json({ success:false, message:"Tour capacity must be a positive whole number." });
      // Check the condition (body.discount !== undefined && (!Number.isFinite(Number(body.discount)) and run the matching branch.
      if (body.discount !== undefined && (!Number.isFinite(Number(body.discount)) || Number(body.discount) < 0 || Number(body.discount) > 100)) return res.status(400).json({ success:false, message:"Discount must be between 0 and 100 percent." });
      // Check the condition (body.depositRequired !== undefined && (!Number.isFinite(Number(body.de) and run the matching branch.
      if (body.depositRequired !== undefined && (!Number.isFinite(Number(body.depositRequired)) || Number(body.depositRequired) < 0)) return res.status(400).json({ success:false, message:"Deposit must be non-negative." });
      // Check the condition (body.depositType !== undefined && !["fixed","percentage"].includes(Str) and run the matching branch.
      if (body.depositType !== undefined && !["fixed","percentage"].includes(String(body.depositType).toLowerCase())) return res.status(400).json({ success:false, message:"depositType must be fixed or percentage." });
      // Check the condition (body.duration !== undefined) and run the matching branch.
      if (body.duration !== undefined) { const match = String(body.duration).match(/\d+(?:\.\d+)?/); const duration = Number(match?.[0]); if (!Number.isFinite(duration) || duration < 1 || duration > 365) return res.status(400).json({ success:false, message:"Duration must be between 1 and 365 days." }); }
      // Check the condition (body.durationDays !== undefined && (!Number.isInteger(Number(body.dura) and run the matching branch.
      if (body.durationDays !== undefined && (!Number.isInteger(Number(body.durationDays)) || Number(body.durationDays) < 1 || Number(body.durationDays) > 365)) return res.status(400).json({ success:false, message:"durationDays must be a whole number between 1 and 365." });
      // Repeat the enclosed work for each required iteration.
      for (const field of ["date", "startDate"]) {
        // Check the condition (body[field] === undefined) and run the matching branch.
        if (body[field] === undefined) continue;
        // Declare date for use by the surrounding module or function.
        const date = parseDate(body[field]);
        // Check the condition (!date) and run the matching branch.
        if (!date) return res.status(400).json({ success:false, message:`Tour ${field} must be valid.` });
        // Check the condition (!allowPast) and run the matching branch.
        if (!allowPast) { const today = new Date(); today.setHours(0,0,0,0); date.setHours(0,0,0,0); if (date < today) return res.status(400).json({ success:false, message:`Tour ${field} cannot be in the past.` }); }
      }
    }
    // Return the result of next() to the caller.
    return next();
  };
}
