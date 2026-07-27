import api from "./axios";



export const askTravelAI =
async(message)=>{


const response =
await api.post(

"/ai/assistant",

{
message
}

);


return response.data;


};