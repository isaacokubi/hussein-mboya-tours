export const roleMiddleware =
(requiredRole) =>
{

return (req,res,next)=>{


try{


if(!req.user){

return res.status(401).json({

message:"Authentication required"

});

}



if(
!req.user.role ||
req.user.role.name !== requiredRole
){

return res.status(403).json({

message:"Access denied"

});

}



next();


}catch(error){

return res.status(500).json({

message:error.message

});

}


};

};