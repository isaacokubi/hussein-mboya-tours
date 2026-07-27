import Commission from "../models/Commission.js";
import Agent from "../models/Agent.js";


export const createCommission =
async(booking)=>{


const agent =
await Agent.findById(
booking.agent
);



const rate =
agent.commissionRate;



const amount =
(
booking.totalAmount *
rate
)
/100;



return await Commission.create({

agent:booking.agent,

booking:booking._id,

amount,

rate

});


};