import axios from "./axios";


const getSessionId = () => {

  let id =
    localStorage.getItem(
      "ai_session_id"
    );


  if(!id){

    id =
      crypto.randomUUID();

    localStorage.setItem(
      "ai_session_id",
      id
    );

  }


  return id;

};



export const askAI = async (
  message
)=>{

  const response =
    await axios.post(
      "/ai/chat",
      {
        message
      },
      {
        headers:{
          "x-ai-session":
            getSessionId()
        }
      }
    );


  return response.data;

};


export const askTravelAI = askAI;
