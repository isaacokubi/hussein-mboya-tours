import PDFDocument from "pdfkit";


export const generateReceipt=(booking,res)=>{


const doc =
new PDFDocument();


res.setHeader(

"Content-Type",

"application/pdf"

);


res.setHeader(

"Content-Disposition",

"attachment; filename=receipt.pdf"

);



doc.pipe(res);



doc.fontSize(25)

.text(
"Hussein Mboya Tours"
);



doc.moveDown();


doc.fontSize(14)

.text(

`
Customer:
${booking.fullName}

Tour:
${booking.tour.title}

Amount:
$${booking.amount}

Payment:
${booking.paymentStatus}

`

);



doc.end();

};