import PDFDocument from "pdfkit";
import Booking from "../models/Booking.js";


export const generateVoucher =
async(req,res)=>{


try{


const booking =
await Booking.findById(
req.params.id
)
.populate("tour")
.populate("customer");



const doc =
new PDFDocument();



res.setHeader(
"Content-Type",
"application/pdf"
);


res.setHeader(
"Content-Disposition",
`attachment; filename=voucher-${booking._id}.pdf`
);



doc.pipe(res);



doc
.fontSize(24)
.text(
"Hussein Mboya Tours",
{
align:"center"
}
);



doc.moveDown();


doc
.fontSize(18)
.text(
"BOOKING VOUCHER"
);



doc.moveDown();



doc.text(
`
Booking ID:
${booking._id}

Customer:
${booking.customer.name}

Tour:
${booking.tour.title}

Travel Date:
${booking.travelDate}

Travelers:
${booking.travelers}

Payment:
${booking.paymentStatus}

`
);



doc.end();



}

catch(error){

res.status(500)
.json({

message:error.message

});

}


};