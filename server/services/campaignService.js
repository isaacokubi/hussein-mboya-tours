import User
from "../models/User.js";


import {
sendEmail
}
from "./emailService.js";



export const sendCampaign =
async(campaign)=>{


let users;



if(
campaign.audience==="vip"
){

users =
await User.find({

role:"customer",

"customerType":"vip"

});

}

else{

users =
await User.find({

role:"customer"

});

}



for(
const user of users
){


await sendEmail({

to:user.email,


subject:
campaign.subject,


html:

campaign.message


});


}



campaign.sentCount =
users.length;


campaign.status =
"sent";


await campaign.save();


};