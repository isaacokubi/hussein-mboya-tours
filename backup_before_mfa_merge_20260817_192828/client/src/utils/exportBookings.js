const csvCell = (value) => {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
};

export const exportBookingsCSV = (bookings = []) => {
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

  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "bookings-report.csv";
  anchor.click();
  URL.revokeObjectURL(url);
};
