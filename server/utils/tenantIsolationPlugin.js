import mongoose from "mongoose";
import { getTenantContext } from "../tenancy/context.js";


function applyTenantFilter(query){


const context = getTenantContext();



if(
context &&
context.tenantId &&
!context.bypass
){


query.setQuery({

...query.getQuery(),

tenantId:
new mongoose.Types.ObjectId(
context.tenantId
)

});


}


}



function applyAggregateFilter(pipeline){


const context=getTenantContext();


if(
context &&
context.tenantId &&
!context.bypass
){


pipeline.unshift({

$match:{

tenantId:
new mongoose.Types.ObjectId(
context.tenantId
)

}

});


}


}



export default function tenantIsolationPlugin(schema){



schema.pre(
[
"find",
"findOne",
"findOneAndUpdate",
"findOneAndDelete",
"countDocuments",
"updateMany",
"deleteMany"
],

function(next){

applyTenantFilter(this);

next();

});



schema.pre(
"aggregate",

function(next){

applyAggregateFilter(
this.pipeline()
);

next();

});


}
