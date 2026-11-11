/**
 * Purpose: ai Conversation Service business-logic service. Main declarations: getConversation, addMessage.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
// Load ../models/AIConversation.js so this module can use its exported dependencies.
import AIConversation from "../models/AIConversation.js";


// Declare getConversation for use by the surrounding module or function.
export const getConversation = async (
  sessionId,
  user=null
)=>{
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();


  // Declare conversation for use by the surrounding module or function.
  let conversation =
    await AIConversation.findOne({
      sessionId
    });


  // Check the condition (!conversation) and run the matching branch.
  if(!conversation){

    // Perform the side effect or state update expressed on the following line.
    conversation =
      await AIConversation.create({

        sessionId,

        user:
          user?._id || null,

        messages:[]

      });

  }


  // Return the value of conversation to the caller.
  return conversation;

};



// Declare addMessage for use by the surrounding module or function.
export const addMessage = async (
  sessionId,
  role,
  content,
  user=null
)=>{


  // Declare conversation for use by the surrounding module or function.
  const conversation =
    await getConversation(
      sessionId,
      user
    );


  // Perform the side effect or state update expressed on the following line.
  conversation.messages.push({

    role,

    content

  });


  // Perform the side effect or state update expressed on the following line.
  await conversation.save();


  // Return the value of conversation to the caller.
  return conversation;

};
