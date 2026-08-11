

export const exportBookingsCSV=(bookings)=>{


const rows=[

[
"Booking",
"Customer",
"Tour",
"Amount",
"Payment",
"Status"
]

];


bookings.forEach(b=>{

rows.push([

b.bookingNumber || b._id,

b.customer?.name || "",

b.tour?.title || "",

b.totalAmount || 0,

b.paymentStatus,

b.status

]);

});


const csv =
rows.map(r=>r.join(","))
.join("\n");


const blob =
new Blob(
[csv],
{
type:"text/csv"
}
);


const url =
URL.createObjectURL(blob);


const a=document.createElement("a");

a.href=url;

a.download="bookings-report.csv";

a.click();


};

