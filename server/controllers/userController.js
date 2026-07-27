import User from "../models/User.js";
import Role from "../models/Role.js";





/*
|--------------------------------------------------------------------------
| GET LOGGED IN USER PROFILE
|--------------------------------------------------------------------------
*/

export const getUserProfile =
async(
req,
res,
next
)=>{


try{


const user =

await User.findById(
req.user._id
)

.select(
"-password"
);





if(!user){


return res.status(404).json({

message:
"User not found"

});


}





res.json({

success:true,

user,

});





}
catch(error){


next(error);


}


};









/*
|--------------------------------------------------------------------------
| GET GUIDES
|--------------------------------------------------------------------------
*/

export const getGuides = async(
req,
res
)=>{


try{



const guideRole =

await Role.findOne({

name:"guide"

});






if(!guideRole){


return res.status(200).json({

users:[]

});


}








const guides =

await User.find({

role:guideRole._id,

status:"active"

})

.select(

"name email phone"

);








res.status(200).json({

success:true,

users:guides

});





}
catch(error){


res.status(500).json({

success:false,

message:error.message

});


}


};