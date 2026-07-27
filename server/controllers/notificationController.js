import Notification from "../models/Notification.js";



export const getNotifications =
async(req,res,next)=>{


try{


const notifications =
await Notification.find({

user:req.user._id

})
.sort({

createdAt:-1

});


res.json(notifications);


}
catch(error){

next(error);

}

};





export const markRead =
async(req,res,next)=>{


try{


const notification =
await Notification.findById(
req.params.id
);



notification.read=true;


await notification.save();



res.json(notification);


}
catch(error){

next(error);

}

};