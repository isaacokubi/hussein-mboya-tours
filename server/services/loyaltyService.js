import User from "../models/User.js";



/*
|--------------------------------------------------------------------------
| ADD LOYALTY POINTS
|--------------------------------------------------------------------------
*/


export const addPoints = async(
  userId,
  points
)=>{


  const user = await User.findById(
    userId
  );


  if(!user){

    throw new Error(
      "User not found"
    );

  }



  user.loyaltyPoints =
    (user.loyaltyPoints || 0)
    +
    points;



  await user.save();



  return user.loyaltyPoints;

};




/*
|--------------------------------------------------------------------------
| GET USER POINTS
|--------------------------------------------------------------------------
*/


export const getPoints = async(
  userId
)=>{


  const user = await User.findById(
    userId
  )
  .select(
    "loyaltyPoints"
  );



  if(!user){

    throw new Error(
      "User not found"
    );

  }



  return user.loyaltyPoints;

};