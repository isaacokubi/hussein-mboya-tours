import axios from "axios";


export const sendWhatsApp =
async(message)=>{


await axios.post(

process.env.WHATSAPP_API_URL,

{

message

}

);

};