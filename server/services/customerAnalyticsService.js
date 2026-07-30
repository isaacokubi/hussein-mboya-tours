import User from "../models/User.js";



export const getCustomerGrowth =
async()=>{


return await User.aggregate([


{

$group:{

_id:{

$dateToString:{

format:"%Y-%m",

date:"$createdAt"

}

},


customers:{

$sum:1

}

}

}


]);


};