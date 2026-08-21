import mongoose from "mongoose";
import { getTenantContext } from "../tenancy/context.js";


export default function tenantAggregationPlugin(schema){


schema.pre("aggregate",function(next){


try{


const context=getTenantContext();



if(
context &&
context.tenantId &&
!context.bypass
){


const pipeline=this.pipeline();



const exists=pipeline.some(
stage =>
stage.$match &&
stage.$match.tenantId
);



if(!exists){


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


next();



}
catch(error){

next(error);

}


});


}

