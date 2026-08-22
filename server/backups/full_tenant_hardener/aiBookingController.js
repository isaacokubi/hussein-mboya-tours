import { completeAIBooking } from "../services/aiBookingCompleteService.js";


export const completeBooking = async (
  req,
  res,
  next
) => {

  try {

    const booking =
      await completeAIBooking({

        ...req.body,

        user:
          req.user || null

      });


    res.status(201).json({

      success:true,

      message:
        "AI booking created successfully",

      data:
        booking

    });


  } catch(error){

    next(error);

  }

};
