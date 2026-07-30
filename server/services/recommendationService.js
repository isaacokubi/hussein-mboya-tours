import Tour from "../models/Tour.js";



export const recommendTours =
async(preferences)=>{


const query={};



if(
preferences.preferredCountries?.length
){

query.country={

$in:

preferences.preferredCountries

};

}



if(
preferences.travelStyle?.length
){

query.category={

$in:

preferences.travelStyle

};

}



const tours =
await Tour.find(query)

.sort({

rating:-1

})

.limit(10);



return tours;


};