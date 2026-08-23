import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
import { tenantFilter } from "../tenancy/tenantQuery.js";
import { getSystemSettings } from "../services/settingsService.js";

import Payment from "../models/Payment.js";
import { Parser } from "json2csv";
import PDFDocument from "pdfkit";


export const exportPaymentsCSV = async(req,res,next)=>{
  requireTenantId();

try{


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



const parser =
new Parser();


const csv =
parser.parse(rows);



res.header(
"Content-Type",
"text/csv"
);


res.attachment(
"payments-report.csv"
);


res.send(csv);



}catch(error){

next(error);

}

};





export const exportPaymentsPDF = async(req,res,next)=>{

const settings = await getSystemSettings();
const companyName = settings.companyName || "Company";

try{


const payments =
await Payment.find(tenantFilter(req))
.populate(
"booking",
"bookingNumber"
)
.lean();



res.setHeader(
"Content-Type",
"application/pdf"
);


res.setHeader(
"Content-Disposition",
"attachment; filename=payments-report.pdf"
);



const doc =
new PDFDocument();


doc.pipe(res);



doc.fontSize(18)
.text(
`${companyName} Finance Report`
);



doc.moveDown();



payments.forEach((p)=>{


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



doc.end();



}catch(error){

next(error);

}

};
