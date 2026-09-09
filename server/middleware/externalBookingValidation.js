const cleanPhone = (value) => String(value ?? "").trim().slice(0, 40);

export const validateExternalBookingContact = (req, res, next) => {
  const body = req.body || {};
  const incoming = body.customer || body.contact || body.customerInfo || {};
  const phone = cleanPhone(incoming.phone || incoming.phoneNumber || incoming.mobile);

  if (!phone) {
    return res.status(400).json({
      success: false,
      message: "Customer phone number is required.",
    });
  }

  return next();
};
