#!/bin/bash

set -e

echo "======================================"
echo "FIX TENANT AGGREGATION SECURITY"
echo "======================================"

cd server


mkdir -p ../tenant_backup_hooks


cp models/*.js ../tenant_backup_hooks/


echo ""
echo "Creating tenant aggregation plugin"
echo "----------------------------------"


cat > utils/tenantAggregationPlugin.js <<'EOF'

import mongoose from "mongoose";


export default function tenantAggregationPlugin(schema){


schema.pre("aggregate", function(next){


try{


const context =
global.__tenantContext;


if(
context &&
context.tenantId &&
!context.bypass
){


const pipeline=this.pipeline();


const hasTenantMatch=
pipeline.some(stage =>
stage.$match &&
stage.$match.tenantId
);



if(!hasTenantMatch){


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


}catch(err){

next(err);

}


});


}

EOF



echo ""
echo "Installing plugin into mongoose connection"
echo "------------------------------------------"


grep -R "mongoose.connect" -n .


echo ""
echo "DONE"
echo ""
echo "Next: attach plugin globally"

