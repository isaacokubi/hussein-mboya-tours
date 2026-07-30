import QRCode from "qrcode";


export const generateTicketQR =
async(booking)=>{


const data = {

bookingNumber:
booking.bookingNumber,


tour:
booking.tour.title,


date:
booking.travelDate,


customer:
booking.contactName

};


return await QRCode.toDataURL(
JSON.stringify(data)
);


};