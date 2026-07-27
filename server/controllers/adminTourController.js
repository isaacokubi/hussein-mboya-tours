import Tour from "../models/Tour.js";



export const createTour =
async(req,res,next)=>{

try{


const images =
req.files.map(
file=>file.path
);



const tour =
await Tour.create({

...req.body,

images

});


res.status(201)
.json(tour);


}
catch(error){

next(error);

}

};





export const getAdminTours =
async(req,res,next)=>{


try{


const tours =
await Tour.find()
.sort({
createdAt:-1
});


res.json(tours);


}
catch(error){

next(error);

}

};





export const updateTour =
async(req,res,next)=>{

try{


const tour =
await Tour.findById(
req.params.id
);



Object.assign(
tour,
req.body
);



if(req.files?.length){


tour.images =
req.files.map(
file=>file.path
);


}



await tour.save();



res.json(tour);


}
catch(error){

next(error);

}

};





export const deleteTour =
async(req,res,next)=>{

try{


await Tour.findByIdAndDelete(
req.params.id
);



res.json({

message:
"Tour deleted"

});


}
catch(error){

next(error);

}

};