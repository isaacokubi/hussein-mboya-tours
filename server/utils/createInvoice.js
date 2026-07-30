import PDFDocument from "pdfkit";

import fs from "fs";


export const createInvoice =
({
booking,
filePath
})=>{


return new Promise(
(resolve)=>{


const doc =
new PDFDocument();



const stream =
fs.createWriteStream(
filePath
);



doc.pipe(stream);



doc.fontSize(20)
.text(
"Hussein Mboya Tours",
{
align:"center"
}
);



doc.moveDown();



doc.fontSize(14)
.text(
"Booking Invoice"
);



doc.moveDown();



doc.text(
`
Booking Number:
${booking.bookingNumber}


Tour:
${booking.tour.title}


Customer:
${booking.contactName}


Travel Date:
${booking.travelDate}


Amount Paid:
KES ${booking.totalAmount}

`
);



doc.end();



stream.on(
"finish",
()=>resolve()
);


});


};