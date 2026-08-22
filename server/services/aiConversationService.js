import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
import AIConversation from "../models/AIConversation.js";


export const getConversation = async (
  sessionId,
  user=null
)=>{
  requireTenantId();


  let conversation =
    await AIConversation.findOne({
      sessionId
    });


  if(!conversation){

    conversation =
      await AIConversation.create({

        sessionId,

        user:
          user?._id || null,

        messages:[]

      });

  }


  return conversation;

};



export const addMessage = async (
  sessionId,
  role,
  content,
  user=null
)=>{


  const conversation =
    await getConversation(
      sessionId,
      user
    );


  conversation.messages.push({

    role,

    content

  });


  await conversation.save();


  return conversation;

};
