import {mergeTenantFilter} from "../tenancy/secureQuery.js";
// server/controllers/destinationController.js

import Destination from "../models/Destination.js";
import Tour from "../models/Tour.js";



/*
|--------------------------------------------------------------------------
| GET ALL ACTIVE DESTINATIONS
|--------------------------------------------------------------------------
|
| GET /api/destinations
|
| Query:
| page
| limit
| search
| country
| featured=true
|--------------------------------------------------------------------------
*/


export const getDestinations = async (req,res,next)=>{

try{


const {

page = 1,

limit = 12,

search,

country,

featured


}=req.query;



const currentPage = Math.max(Number(page),1);


const pageSize = Math.min(
Math.max(Number(limit),1),
100
);


const skip = (currentPage - 1) * pageSize;



/*
|--------------------------------------------------------------------------
| FILTER
|--------------------------------------------------------------------------
*/


const filter = {

status:"active",

active:true,

isDeleted:false

};



if(country){

filter.country = country;

}



if(featured === "true"){

filter.featured = true;

}





if(search){


const keyword = search.trim();



filter.$or=[


{
name:{
$regex:keyword,
$options:"i"
}
},


{
slug:{
$regex:keyword,
$options:"i"
}
},


{
country:{
$regex:keyword,
$options:"i"
}
},


{
description:{
$regex:keyword,
$options:"i"
}
}


];


}





/*
|--------------------------------------------------------------------------
| DATABASE QUERY
|--------------------------------------------------------------------------
*/


const [destinations,total]=await Promise.all([


Destination.find(filter)

.sort({

createdAt:-1

})

.skip(skip)

.limit(pageSize)

.lean(),



Destination.countDocuments(filter)


]);





return res.status(200).json({

success:true,


count:destinations.length,


pagination:{

total,

page:currentPage,

pages:Math.ceil(total/pageSize),

limit:pageSize

},


data:destinations


});



}

catch(error){

next(error);

}


};









/*
|--------------------------------------------------------------------------
| GET SINGLE DESTINATION
|--------------------------------------------------------------------------
|
| GET /api/destinations/:slug
|--------------------------------------------------------------------------
*/


export const getDestination = async(req,res,next)=>{


try{


const slug=req.params.slug
?.trim()
.toLowerCase();



if(!slug){


return res.status(400).json({

success:false,

message:"Destination slug is required."

});


}




const destination = await Destination.findOne(mergeTenantFilter(req,{

slug,

status:"active",

active:true,

isDeleted:false

})
.lean();







if(!destination){


return res.status(404).json({

success:false,

message:"Destination not found."

});


}


/*
|--------------------------------------------------------------------------
| RELATED TOURS
|--------------------------------------------------------------------------
*/


const tours = await Tour.find(mergeTenantFilter(req,{

destination: destination._id,

isDeleted:false,

status:{
$ne:"inactive"
}

})

.select(
"title slug images price duration category"
)

.lean();



destination.tours = tours;






/*
|--------------------------------------------------------------------------
| RELATED DESTINATIONS
|--------------------------------------------------------------------------
*/


const relatedDestinations = await Destination.find(mergeTenantFilter(req,{

_id:{
$ne:destination._id
},


country:destination.country,


status:"active",


active:true,


isDeleted:false


})

.select(
"name slug images country featured"
)

.limit(4)

.lean();






return res.status(200).json({

success:true,


data:{

destination,

relatedDestinations

}


});




}

catch(error){

next(error);

}


};









/*
|--------------------------------------------------------------------------
| FEATURED DESTINATIONS
|--------------------------------------------------------------------------
|
| GET /api/destinations/featured
|--------------------------------------------------------------------------
*/


export const getFeaturedDestinations = async(req,res,next)=>{


try{


const destinations = await Destination.find(mergeTenantFilter(req,{


status:"active",

active:true,

featured:true,

isDeleted:false


})


.sort({

createdAt:-1

})


.limit(6)



.lean();






return res.status(200).json({

success:true,


count:destinations.length,


data:destinations


});



}

catch(error){

next(error);

}


};