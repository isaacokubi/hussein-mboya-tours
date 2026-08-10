/*
|--------------------------------------------------------------------------
| BOOKING CONFIRMATION EMAIL
|--------------------------------------------------------------------------
*/

export const bookingConfirmationEmail = ({
  customerName,
  bookingNumber,
  tourName,
  amount,
  travelDate,
  paymentMethod,
  companyName = "Coherent Tours",
}) => {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Booking Confirmation</title>
</head>

<body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:30px 0;">
<tr>
<td align="center">

<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">

<tr>
<td style="background:#0d6efd;padding:25px;text-align:center;color:#ffffff;">
<h1 style="margin:0;">${companyName}</h1>
<p style="margin-top:8px;font-size:16px;">
Your Adventure Starts Here 🌍
</p>
</td>
</tr>

<tr>
<td style="padding:35px;">

<h2 style="margin-top:0;color:#333;">
Booking Confirmed 🎉
</h2>

<p style="color:#555;font-size:15px;">
Hello <strong>${customerName}</strong>,
</p>

<p style="color:#555;font-size:15px;line-height:1.7;">
Thank you for choosing <strong>${companyName}</strong>.
Your booking has been successfully confirmed.
</p>

<table width="100%" cellpadding="10" cellspacing="0" style="margin-top:25px;border-collapse:collapse;">

<tr style="background:#f8f9fa;">
<td><strong>Booking Number</strong></td>
<td>${bookingNumber}</td>
</tr>

<tr>
<td><strong>Tour</strong></td>
<td>${tourName}</td>
</tr>

<tr style="background:#f8f9fa;">
<td><strong>Travel Date</strong></td>
<td>${travelDate || "To be confirmed"}</td>
</tr>

<tr>
<td><strong>Payment Method</strong></td>
<td>${paymentMethod || "N/A"}</td>
</tr>

<tr style="background:#f8f9fa;">
<td><strong>Amount Paid</strong></td>
<td><strong>KES ${Number(amount).toLocaleString()}</strong></td>
</tr>

</table>

<p style="margin-top:30px;color:#555;line-height:1.7;">
Please keep this email for your records.
You may be asked to present your booking confirmation during check-in.
</p>

<div style="text-align:center;margin-top:35px;">
<a href="${process.env.CLIENT_URL}/bookings/${bookingNumber}"
style="
background:#0d6efd;
color:#ffffff;
padding:14px 28px;
text-decoration:none;
border-radius:6px;
display:inline-block;
font-weight:bold;
">
View Booking
</a>
</div>

<hr style="margin:40px 0;border:none;border-top:1px solid #eeeeee;">

<p style="font-size:13px;color:#777;text-align:center;line-height:1.8;">
Thank you for trusting ${companyName}.<br>
We look forward to creating unforgettable memories with you.
</p>

</td>
</tr>

<tr>
<td style="background:#f8f9fa;padding:20px;text-align:center;font-size:12px;color:#888;">

<strong>${companyName}</strong><br>

Email: info@husseinmboyatours.com<br>

Phone: +254 XXX XXX XXX<br>

© ${new Date().getFullYear()} ${companyName}. All rights reserved.

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;
};