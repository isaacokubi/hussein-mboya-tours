/**
 * Purpose: finance Export Controller HTTP controller. Main declarations: exportPaymentsCSV, exportPaymentsPDF.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
// Load ../tenancy/tenantQuery.js so this module can use its exported dependencies.
import { tenantFilter } from "../tenancy/tenantQuery.js";
// Load ../services/settingsService.js so this module can use its exported dependencies.
import { getSystemSettings } from "../services/settingsService.js";

// Load ../models/Payment.js so this module can use its exported dependencies.
import Payment from "../models/Payment.js";
// Load json2csv so this module can use its exported dependencies.
import { Parser } from "json2csv";
// Load pdfkit so this module can use its exported dependencies.
import PDFDocument from "pdfkit";


// Declare exportPaymentsCSV for use by the surrounding module or function.
export const exportPaymentsCSV = async(req,res,next)=>{
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();

// Run this operation with a dedicated error-handling path for failures.
try{


// Declare payments for use by the surrounding module or function.
const payments =
await Payment.find(tenantFilter(req))
.populate(
"booking",
"bookingNumber"
)
.populate(
"customer",
"name email phone"
)
.lean();



// Declare rows for use by the surrounding module or function.
const rows =
payments.map(p=>({

transaction:
p.mpesaReceiptNumber ||
p.checkoutRequestID ||
p._id,

booking:
p.booking?.bookingNumber || "-",

customer:
p.customer?.name || "-",

phone:
p.phoneNumber ||
p.customer?.phone ||
"-",

amount:
p.amount || 0,

status:
p.status,

date:
p.createdAt

}));



// Declare parser for use by the surrounding module or function.
const parser =
new Parser();


// Declare csv for use by the surrounding module or function.
const csv =
parser.parse(rows);



// Perform the side effect or state update expressed on the following line.
res.header(
"Content-Type",
"text/csv"
);


// Perform the side effect or state update expressed on the following line.
res.attachment(
"payments-report.csv"
);


// Perform the side effect or state update expressed on the following line.
res.send(csv);



}catch(error){

// Perform the side effect or state update expressed on the following line.
next(error);

}

};





// Declare exportPaymentsPDF for use by the surrounding module or function.
export const exportPaymentsPDF = async(req,res,next)=>{

// Declare settings for use by the surrounding module or function.
const settings = await getSystemSettings();
// Declare companyName for use by the surrounding module or function.
const companyName = settings.companyName || "Company";

// Run this operation with a dedicated error-handling path for failures.
try{


// Declare payments for use by the surrounding module or function.
const payments =
await Payment.find(tenantFilter(req))
.populate(
"booking",
"bookingNumber"
)
.lean();



// Perform the side effect or state update expressed on the following line.
res.setHeader(
"Content-Type",
"application/pdf"
);


// Perform the side effect or state update expressed on the following line.
res.setHeader(
"Content-Disposition",
"attachment; filename=payments-report.pdf"
);



// Declare doc for use by the surrounding module or function.
const doc =
new PDFDocument();


// Perform the side effect or state update expressed on the following line.
doc.pipe(res);



// Perform the side effect or state update expressed on the following line.
doc.fontSize(18)
.text(
`${companyName} Finance Report`
);



// Perform the side effect or state update expressed on the following line.
doc.moveDown();



// Perform the side effect or state update expressed on the following line.
payments.forEach((p)=>{


// Perform the side effect or state update expressed on the following line.
doc.fontSize(10)
.text(
`
Transaction: ${p.mpesaReceiptNumber || p._id}

Amount: KES ${p.amount}

Status: ${p.status}

Booking: ${p.booking?.bookingNumber || "-"}

Date: ${p.createdAt}

------------------------
`
);


});



// Perform the side effect or state update expressed on the following line.
doc.end();



}catch(error){

// Perform the side effect or state update expressed on the following line.
next(error);

}

};
