export const bookingConfirmationEmail =
({
customerName,
bookingNumber,
tourName,
amount
})=>{


return `

<div style="
font-family:Arial;
padding:30px;
background:#f5f5f5;
">


<h1>
Hussein Mboya Tours
</h1>


<h2>
Booking Confirmed 🎉
</h2>


<p>
Hello ${customerName},
</p>


<p>
Your travel booking has been successfully confirmed.
</p>


<hr/>


<p>
<strong>
Booking Number:
</strong>

${bookingNumber}

</p>


<p>

<strong>
Tour:
</strong>

${tourName}

</p>



<p>

<strong>
Amount Paid:
</strong>

KES ${amount}

</p>



<p>
We look forward to creating unforgettable memories with you.
</p>


<br/>


<p>
Hussein Mboya Tours Team
</p>


</div>

`;

};