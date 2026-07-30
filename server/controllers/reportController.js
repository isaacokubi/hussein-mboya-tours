import Booking from "../models/Booking.js";

import {
generateCSV
}
from "../services/reportService.js";



export const exportBookings =
async(req,res)=>{


const bookings =
await Booking.find();



const csv =
generateCSV(
bookings
);



res.header(

"Content-Type",

"text/csv"

);


res.attachment(

"bookings-report.csv"

);



res.send(csv);


};