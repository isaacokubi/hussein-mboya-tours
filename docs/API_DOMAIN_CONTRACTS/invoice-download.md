# Booking invoice PDF download

## `GET /api/invoices/:id` (inventory entry 315)

**Status: SOURCE-TRACED.** `server/routes/invoiceRoutes.js` applies `resolveTenant`, `protect`, then `invoiceOwnerOrPrivileged`. That middleware treats `:id` as a Booking ID, reads the tenant booking and populated customer link, then calls `canAccessBooking` from `server/controllers/phase3InvoiceAccess.js`; missing booking returns 404, access denied 403. Handler `downloadInvoice` in `server/controllers/invoiceController.js` again loads the tenant Booking, then checks `process.cwd()/uploads/<bookingNumber>.pdf` and sends it as `<bookingNumber>.pdf`.

There are no query/body fields. Success is a binary file download (Express `res.download`), not a JSON invoice record. Missing booking or PDF returns 404 JSON `{success:false,message}`. Filesystem errors are forwarded to central middleware. This endpoint does not create or render a PDF; the PDF must already exist at the expected local path. No model write/external integration or focused endpoint test was identified. A deployment using ephemeral/container-local storage may not retain such files unless volume/persistence is configured; runtime storage was not verified.
