import Invoice from "../models/Invoice.js";
import Booking from "../models/Booking.js";





/*
|--------------------------------------------------------------------------
| CREATE INVOICE
|--------------------------------------------------------------------------
*/

export const createInvoice =
async(
req,
res,
next
)=>{


try{


const {

booking,

amount

} = req.body;




const bookingData =
await Booking.findById(
booking
);



if(!bookingData){

return res.status(404)
.json({

message:"Booking not found"

});

}





const invoice =
await Invoice.create({

booking,

invoiceNumber:
"INV-"+Date.now(),

amount

});





res.status(201)
.json(invoice);



}

catch(error){

next(error);

}


};









/*
|--------------------------------------------------------------------------
| GET ALL INVOICES
|--------------------------------------------------------------------------
*/

export const getInvoices =
async(
req,
res,
next
)=>{


try{


const invoices =
await Invoice.find()

.populate({

path:"booking",

populate:{

path:"tour"

}

})

.sort({

createdAt:-1

});





res.json(invoices);



}

catch(error){

next(error);

}


};









/*
|--------------------------------------------------------------------------
| GET SINGLE INVOICE
|--------------------------------------------------------------------------
*/

export const getInvoice =
async(
req,
res,
next
)=>{


try{


const invoice =
await Invoice.findById(
req.params.id
)

.populate({

path:"booking",

populate:{

path:"tour"

}

});





if(!invoice){

return res.status(404)
.json({

message:"Invoice not found"

});

}





res.json(invoice);



}

catch(error){

next(error);

}


};









/*
|--------------------------------------------------------------------------
| DOWNLOAD INVOICE PDF
|--------------------------------------------------------------------------
*/

export const downloadInvoice =
async(
req,
res,
next
)=>{


try{


const booking =
await Booking.findById(
req.params.id
)

.populate("tour");





if(!booking){


return res.status(404)
.json({

message:
"Booking not found"

});

}





const filePath =
`uploads/${booking.bookingNumber}.pdf`;





res.download(
filePath
);



}

catch(error){

next(error);

}


};