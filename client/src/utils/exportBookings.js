/**
 * Purpose: export Bookings client application module. Main declarations: csvCell, exportBookingsCSV.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
const csvCell = (value) => {
  // Declare text for use by the surrounding module or function.
  const text = String(value ?? "");
  // Return the expression shown below to the caller.
  return `"${text.replace(/"/g, '""')}"`;
};

// Declare exportBookingsCSV for use by the surrounding module or function.
export const exportBookingsCSV = (bookings = []) => {
  // Declare rows for use by the surrounding module or function.
  const rows = [
    ["Booking", "Customer", "Customer Email", "Customer Phone", "Tour", "Amount", "Payment", "Status"],
    ...bookings.map((b) => [
      b.bookingNumber || b._id,
      b.customer?.name || b.user?.name || b.customerSnapshot?.name || b.contact?.name || "Guest",
      b.customer?.email || b.user?.email || b.customerSnapshot?.email || b.contact?.email || "",
      b.customer?.phone || b.user?.phone || b.customerSnapshot?.phone || b.contact?.phone || "",
      b.tour?.title || "",
      b.totalAmount || 0,
      b.paymentStatus || "",
      b.status || "",
    ]),
  ];

  // Declare csv for use by the surrounding module or function.
  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
  // Declare blob for use by the surrounding module or function.
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  // Declare url for use by the surrounding module or function.
  const url = URL.createObjectURL(blob);
  // Declare anchor for use by the surrounding module or function.
  const anchor = document.createElement("a");
  // Perform the side effect or state update expressed on the following line.
  anchor.href = url;
  // Perform the side effect or state update expressed on the following line.
  anchor.download = "bookings-report.csv";
  // Perform the side effect or state update expressed on the following line.
  anchor.click();
  // Perform the side effect or state update expressed on the following line.
  URL.revokeObjectURL(url);
};
