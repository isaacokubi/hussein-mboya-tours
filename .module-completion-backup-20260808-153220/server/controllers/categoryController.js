import TourCategory from "../models/TourCategory.js";



/*
|--------------------------------------------------------------------------
| GET ACTIVE TOUR CATEGORIES
|--------------------------------------------------------------------------
*/

export const getCategories = async(req,res,next)=>{


try{


const categories = await TourCategory.find({

active:true

})

.sort({

createdAt:-1

});




res.json({

success:true,

categories

});



}

catch(error){

next(error);

}



};