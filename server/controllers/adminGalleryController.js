import { mergeTenantFilter } from "../tenancy/context.js";
import { tenantFilter } from "../tenancy/tenantQuery.js";

import Gallery from "../models/Gallery.js";
import cloudinary from "../config/cloudinary.js";


export const getAdminGallery = async (req,res,next)=>{

try{

const gallery =
await Gallery.find(tenantFilter(req))
.sort({createdAt:-1});

res.json({
success:true,
count:gallery.length,
gallery
});


}catch(error){
next(error);
}

};





export const uploadGalleryImage = async (req,res,next)=>{

try{

if(!req.file){

return res.status(400).json({
success:false,
message:"Please upload an image"
});

}


res.json({

success:true,

image:{
url:req.file.path,
publicId:req.file.filename
}

});


}catch(error){

next(error);

}

};

export const createAdminGallery = async(req,res,next)=>{

try{


const {
title,
category,
featured,
active,
imageUrl,
publicId
}=req.body;


if(!title){

return res.status(400).json({
success:false,
message:"Title is required"
});

}


const item =
await Gallery.create({

title,

category,

featured:Boolean(featured),

active:active !== false,

image:{
url:imageUrl || "",
publicId:publicId || ""
}

});


res.status(201).json({
success:true,
gallery:item
});


}catch(error){

next(error);

}

};




export const updateAdminGallery = async(req,res,next)=>{

try{


const {
title,
category,
featured,
active,
imageUrl,
publicId
}=req.body;



const update = {

title,
category,
featured:Boolean(featured),
active:active !== false

};



if(imageUrl){

update.image={
url:imageUrl,
publicId:publicId || ""
};

}



const item =
await Gallery.findOneAndUpdate(
mergeTenantFilter(req,{
_id:req.params.id
}),
update,
{
new:true,
runValidators:true
}
);



if(!item){

return res.status(404).json({
success:false,
message:"Gallery item not found"
});

}



res.json({
success:true,
gallery:item
});


}catch(error){

next(error);

}

};





export const deleteAdminGallery = async(req,res,next)=>{

try{


const item =
await Gallery.findOne(
mergeTenantFilter(req,{
_id:req.params.id
})
);



if(!item){

return res.status(404).json({
success:false,
message:"Gallery item not found"
});

}



await Gallery.findOneAndDelete(
mergeTenantFilter(req,{
_id:req.params.id
})
);



res.json({

success:true,

message:"Gallery item deleted"

});


}catch(error){

next(error);

}

};
