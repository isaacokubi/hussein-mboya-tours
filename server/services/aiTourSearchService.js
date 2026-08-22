import Tour from "../models/Tour.js";
import "../models/Destination.js";


export const searchRelevantTours = async (query = "") => {

  const text = query.toLowerCase();


  const numbers =
    text.match(/\d+/g)?.map(Number) || [];


  const budget =
    numbers.find(n => n >= 100 && n <= 100000);


  const days =
    numbers.find(n => n >= 1 && n <= 60);



  const keywords =
    text
      .split(" ")
      .filter(word => word.length > 3);



  const regex =
    keywords.length
      ? keywords.join("|")
      : "safari|tour";



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



  if(budget){

    filters.price = {
      $lte: budget
    };

  }



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



  let ranked =
    tours.map(tour => {


      let score = 0;


      if(
        text.includes(
          tour.category?.toLowerCase()
        )
      ){
        score += 5;
      }


      if(
        text.includes(
          tour.country?.toLowerCase()
        )
      ){
        score += 5;
      }


      if(days &&
        (
          tour.duration === days ||
          tour.durationDetails?.days === days
        )
      ){
        score += 10;
      }


      if(tour.featured){
        score += 2;
      }


      return {
        ...tour,
        score
      };


    });



  return ranked

    .sort(
      (a,b)=>b.score-a.score
    )

    .slice(0,5);


};
