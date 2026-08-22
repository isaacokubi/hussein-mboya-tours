import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
import Tour from "../models/Tour.js";


export const findTourForBooking = async (message = "") => {
  requireTenantId();

  const text =
    message.toLowerCase();


  const tour =
    await Tour.findOne({

      $or:[

        {
          title:{
            $regex:text
              .split(" ")
              .filter(word=>word.length > 3)
              .join("|"),
            $options:"i"
          }
        },

        {
          country:{
            $regex:text,
            $options:"i"
          }
        }

      ],

      status:{
        $ne:"inactive"
      }

    })
    .populate(
      "destination",
      "name country"
    )
    .lean();


  return tour;

};
