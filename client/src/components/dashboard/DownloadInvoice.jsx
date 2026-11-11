/**
 * Purpose: Download Invoice reusable UI component. Main declarations: DownloadInvoice, download.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useState } from "react";


// Load ../../api/axios so this module can use its exported dependencies.
import api from "../../api/axios";






// Define DownloadInvoice; its parameters and body implement this operation.
export default function DownloadInvoice({

    bookingId

}){





// Declare [loading,setLoading] for use by the surrounding module or function.
const [loading,setLoading] = useState(false);

// Declare [error,setError] for use by the surrounding module or function.
const [error,setError] = useState("");









// Declare download for use by the surrounding module or function.
const download = async()=>{





// Run this operation with a dedicated error-handling path for failures.
try{


// Perform the side effect or state update expressed on the following line.
setLoading(true);

// Perform the side effect or state update expressed on the following line.
setError("");






// Declare response for use by the surrounding module or function.
const response = await api.get(

`/invoices/${bookingId}`,

{

responseType:"blob"

}

);









// Declare blob for use by the surrounding module or function.
const blob = new Blob(

[response.data],

{

type:"application/pdf"

}

);







// Declare url for use by the surrounding module or function.
const url =

window.URL.createObjectURL(blob);







// Declare link for use by the surrounding module or function.
const link =

document.createElement("a");






// Perform the side effect or state update expressed on the following line.
link.href=url;







// Perform the side effect or state update expressed on the following line.
link.download =

`Global-Tours-Invoice-${bookingId}.pdf`;








// Perform the side effect or state update expressed on the following line.
document.body.appendChild(link);



// Perform the side effect or state update expressed on the following line.
link.click();






// Perform the side effect or state update expressed on the following line.
document.body.removeChild(link);






// Perform the side effect or state update expressed on the following line.
window.URL.revokeObjectURL(url);






}

// Handle the error raised by the preceding protected operation.
catch(error){



// Perform the side effect or state update expressed on the following line.
console.error(
"Invoice download failed",
error
);



// Perform the side effect or state update expressed on the following line.
setError(

"Unable to download invoice"

);



}

finally{


// Perform the side effect or state update expressed on the following line.
setLoading(false);


}



};








// Return the expression shown below to the caller.
return (

<div>





<button


onClick={download}



disabled={loading}



className="
bg-green-700
text-white
px-4
py-2
rounded
disabled:opacity-50
"

>





{

loading

?

"Downloading..."

:

"Download Invoice"

}



</button>







{

error &&

<p

className="
text-red-600
text-sm
mt-2
"

>

{error}

</p>


}







</div>


);


}
