import Staff from "../models/Staff.js";



export const getStaff =
async(req,res)=>{


const staff =
await Staff.find();


res.json(staff);


};




export const createStaff =
async(req,res)=>{


const staff =
await Staff.create(
req.body
);


res.status(201)
.json(staff);


};



export const updateStaff =
async(req,res)=>{


const staff =
await Staff.findByIdAndUpdate(

req.params.id,

req.body,

{
new:true
}

);


res.json(staff);


};