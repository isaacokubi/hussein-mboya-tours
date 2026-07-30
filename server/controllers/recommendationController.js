import {
recommendTours
}
from "../services/recommendationService.js";



export const getRecommendations =
async(req,res,next)=>{


try{


const tours =
await recommendTours(
req.body
);



res.json(tours);


}
catch(error){

next(error);

}

};