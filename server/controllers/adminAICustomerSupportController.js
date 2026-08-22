import { generateTravelAdvice } from "../services/aiService.js";


export const generateCustomerReply = async (
  req,
  res,
  next
) => {

  try {

    const {
      customerMessage,
      tone = "professional"
    } = req.body;


    if(!customerMessage){

      return res.status(400).json({

        success:false,

        message:"Customer message required."

      });

    }



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



    const reply =
      await generateTravelAdvice(
        prompt,
        req.user
      );


    res.json({

      success:true,

      data:{
        reply
      }

    });


  } catch(error){

    next(error);

  }

};
