import api from "../../api/axios";


export default function DownloadInvoice({
bookingId
}){


const download =
async()=>{


const response =
await api.get(

`/invoices/${bookingId}`,

{
responseType:
"blob"
}

);



const url =
window.URL.createObjectURL(
response.data
);



const link =
document.createElement(
"a"
);


link.href=url;


link.download=
"invoice.pdf";


link.click();


};



return (

<button

onClick={download}

className="
bg-green-700
text-white
px-4
py-2
rounded
"

>

Download Invoice

</button>

);


}