/**
 * Purpose: tenant Aggregation Plugin server application module. Main declarations: tenantAggregationPlugin.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { getTenantContext } from "../tenancy/context.js";


// Define tenantAggregationPlugin; its parameters and body implement this operation.
export default function tenantAggregationPlugin(schema){


// Perform the side effect or state update expressed on the following line.
schema.pre("aggregate",function(next){


// Run this operation with a dedicated error-handling path for failures.
try{


// Declare context for use by the surrounding module or function.
const context=getTenantContext();



// Check the condition (context && context.tenantId && !context.bypass) and run the matching branch.
if(
context &&
context.tenantId &&
!context.bypass
){


// Declare pipeline for use by the surrounding module or function.
const pipeline=this.pipeline();



// Declare exists for use by the surrounding module or function.
const exists=pipeline.some(
stage =>
stage.$match &&
stage.$match.tenantId
);



// Check the condition (!exists) and run the matching branch.
if(!exists){


// Perform the side effect or state update expressed on the following line.
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


// Perform the side effect or state update expressed on the following line.
next();



}
// Handle the error raised by the preceding protected operation.
catch(error){

// Perform the side effect or state update expressed on the following line.
next(error);

}


});


}
