/**
 * Purpose: ai Api client application module. Main declarations: getSessionId, askAI.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import axios from "./axios";


// Declare getSessionId for use by the surrounding module or function.
const getSessionId = () => {

  // Declare id for use by the surrounding module or function.
  let id =
    localStorage.getItem(
      "ai_session_id"
    );


  // Check the condition (!id) and run the matching branch.
  if(!id){

    // Perform the side effect or state update expressed on the following line.
    id =
      crypto.randomUUID();

    // Perform the side effect or state update expressed on the following line.
    localStorage.setItem(
      "ai_session_id",
      id
    );

  }


  // Return the value of id to the caller.
  return id;

};



// Declare askAI for use by the surrounding module or function.
export const askAI = async (
  message
)=>{

  // Declare response for use by the surrounding module or function.
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


  // Return the data value to the caller.
  return response.data;

};


// Declare askTravelAI for use by the surrounding module or function.
export const askTravelAI = askAI;
