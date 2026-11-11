/**
 * Purpose: admin AICustomer Support Controller HTTP controller. Main declarations: generateCustomerReply.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter } from "../tenancy/context.js";
// Load ../services/aiService.js so this module can use its exported dependencies.
import { generateTravelAdvice } from "../services/aiService.js";


// Declare generateCustomerReply for use by the surrounding module or function.
export const generateCustomerReply = async (
  req,
  res,
  next
) => {

  // Run this operation with a dedicated error-handling path for failures.
  try {

    // Declare { customerMessage, tone = "professional" } for use by the surrounding module or function.
    const {
      customerMessage,
      tone = "professional"
    } = req.body;


    // Check the condition (!customerMessage) and run the matching branch.
    if(!customerMessage){

      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({

        success:false,

        message:"Customer message required."

      });

    }



    // Declare prompt for use by the surrounding module or function.
    const prompt = `

You are a customer support AI assistant for a tour company.

Create a ${tone} customer response.

Customer message:

${customerMessage}


Rules:

- Be polite
- Be helpful
- Do not promise unavailable services
- Keep the response suitable for WhatsApp or email
- Include next steps

`;



    // Declare reply for use by the surrounding module or function.
    const reply =
      await generateTravelAdvice(
        prompt,
        req.user
      );


    // Perform the side effect or state update expressed on the following line.
    res.json({

      success:true,

      data:{
        reply
      }

    });


  } catch(error){

    // Perform the side effect or state update expressed on the following line.
    next(error);

  }

};
