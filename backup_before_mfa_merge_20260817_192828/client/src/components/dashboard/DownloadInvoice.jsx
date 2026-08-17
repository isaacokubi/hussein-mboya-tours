import { useState } from "react";


import api from "../../api/axios";






export default function DownloadInvoice({

    bookingId

}){





const [loading,setLoading] = useState(false);

const [error,setError] = useState("");









const download = async()=>{





try{


setLoading(true);

setError("");






const response = await api.get(

`/invoices/${bookingId}`,

{

responseType:"blob"

}

);









const blob = new Blob(

[response.data],

{

type:"application/pdf"

}

);







const url =

window.URL.createObjectURL(blob);







const link =

document.createElement("a");






link.href=url;







link.download =

`Hussein-Mboya-Invoice-${bookingId}.pdf`;








document.body.appendChild(link);



link.click();






document.body.removeChild(link);






window.URL.revokeObjectURL(url);






}

catch(error){



console.error(
"Invoice download failed",
error
);



setError(

"Unable to download invoice"

);



}

finally{


setLoading(false);


}



};








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