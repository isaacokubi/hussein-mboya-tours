import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";



export const adminLogin = async(req,res)=>{

try{


const {
email,
password
}=req.body;



const user =
await User.findOne({
email
});



if(!user){

return res.status(404).json({

message:"Admin not found"

});

}



if(user.role !== "admin"){

return res.status(403).json({

message:"Access denied"

});

}



const valid =
await bcrypt.compare(
password,
user.password
);



if(!valid){

return res.status(401).json({

message:"Invalid password"

});

}



const token =
jwt.sign(

{
id:user._id,
role:user.role
},

process.env.JWT_SECRET,

{
expiresIn:"7d"
}

);



res.json({

token,

user:{
id:user._id,
name:user.name,
role:user.role
}

});



}catch(error){

res.status(500).json({

message:error.message

});

}

};