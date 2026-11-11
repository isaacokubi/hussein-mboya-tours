/**
 * Purpose: ai Tour Search Service business-logic service. Main declarations: searchRelevantTours.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
// Load ../models/Tour.js so this module can use its exported dependencies.
import Tour from "../models/Tour.js";
// Load ../models/Destination.js so this module can use its exported dependencies.
import "../models/Destination.js";


// Declare searchRelevantTours for use by the surrounding module or function.
export const searchRelevantTours = async (query = "") => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();

  // Declare text for use by the surrounding module or function.
  const text = query.toLowerCase();


  // Declare numbers for use by the surrounding module or function.
  const numbers =
    text.match(/\d+/g)?.map(Number) || [];


  // Declare budget for use by the surrounding module or function.
  const budget =
    numbers.find(n => n >= 100 && n <= 100000);


  // Declare days for use by the surrounding module or function.
  const days =
    numbers.find(n => n >= 1 && n <= 60);



  // Declare keywords for use by the surrounding module or function.
  const keywords =
    text
      .split(" ")
      .filter(word => word.length > 3);



  // Declare regex for use by the surrounding module or function.
  const regex =
    keywords.length
      ? keywords.join("|")
      : "safari|tour";



  // Declare filters for use by the surrounding module or function.
  const filters = {

    status: {
      $ne: "inactive"
    },

    $or: [

      {
        title:{
          $regex: regex,
          $options:"i"
        }
      },

      {
        description:{
          $regex: regex,
          $options:"i"
        }
      },

      {
        category:{
          $regex: regex,
          $options:"i"
        }
      },

      {
        country:{
          $regex: regex,
          $options:"i"
        }
      }

    ]

  };



  // Check the condition (budget) and run the matching branch.
  if(budget){

    // Perform the side effect or state update expressed on the following line.
    filters.price = {
      $lte: budget
    };

  }



  // Declare tours for use by the surrounding module or function.
  const tours =
    await Tour.find(filters)

    .populate(
      "destination",
      "name country"
    )

    .select(
`
title
description
category
duration
durationDetails
price
featured
destination
country
`
    )

    .lean();



  // Declare ranked for use by the surrounding module or function.
  let ranked =
    tours.map(tour => {


      // Declare score for use by the surrounding module or function.
      let score = 0;


      // Check the condition (text.includes( tour.category?.toLowerCase() )) and run the matching branch.
      if(
        text.includes(
          tour.category?.toLowerCase()
        )
      ){
        // Perform the side effect or state update expressed on the following line.
        score += 5;
      }


      // Check the condition (text.includes( tour.country?.toLowerCase() )) and run the matching branch.
      if(
        text.includes(
          tour.country?.toLowerCase()
        )
      ){
        // Perform the side effect or state update expressed on the following line.
        score += 5;
      }


      // Check the condition (days && ( tour.duration === days || tour.durationDetails?.days === day) and run the matching branch.
      if(days &&
        (
          tour.duration === days ||
          tour.durationDetails?.days === days
        )
      ){
        // Perform the side effect or state update expressed on the following line.
        score += 10;
      }


      // Check the condition (tour.featured) and run the matching branch.
      if(tour.featured){
        // Perform the side effect or state update expressed on the following line.
        score += 2;
      }


      // Return the object assembled below to the caller.
      return {
        ...tour,
        score
      };


    });



  // Return the result of ranked      .sort(       (a,b)=>b.score-a.score     )      .slice() to the caller.
  return ranked

    .sort(
      (a,b)=>b.score-a.score
    )

    .slice(0,5);


};
