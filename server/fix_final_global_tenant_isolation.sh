#!/bin/bash

set -e

echo "=========================================="
echo "FINAL GLOBAL TENANT ISOLATION REPAIR"
echo "=========================================="


echo ""
echo "1. Updating tenant plugin loader"
echo "--------------------------------"


cat > config/tenantPluginLoader.js <<'EOF'
import mongoose from "mongoose";
import tenantIsolationPlugin from "../utils/tenantIsolationPlugin.js";


let loaded = false;


export default function loadTenantPlugin(){


if(loaded){
    return;
}


mongoose.plugin(
    tenantIsolationPlugin
);


loaded = true;


console.log(
"✅ Global tenant isolation plugin loaded"
);


}
EOF



echo ""
echo "2. Updating tenant isolation plugin"
echo "--------------------------------"


cat > utils/tenantIsolationPlugin.js <<'EOF'
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
EOF



echo ""
echo "3. Add loader to mongoose startup"
echo "--------------------------------"


python3 <<'PY'

from pathlib import Path
import re


targets=[
"config/database.js",
"config/db.js",
"database.js",
"server.js"
]


for target in targets:

    file=Path(target)

    if file.exists():

        data=file.read_text()


        if "loadTenantPlugin" not in data:


            imports='import loadTenantPlugin from "./config/tenantPluginLoader.js";\n\nloadTenantPlugin();\n\n'


            data=imports+data


            file.write_text(data)


            print("Updated",target)

        else:
            print("Already updated",target)


PY



echo ""
echo "4. Verify app.js"
echo "--------------------------------"

grep -n "loadTenantPlugin" app.js || true



echo ""
echo "5. Syntax checks"
echo "--------------------------------"


node --check utils/tenantIsolationPlugin.js

node --check config/tenantPluginLoader.js


echo ""
echo "=========================================="
echo "TENANT ISOLATION REPAIR COMPLETE"
echo "=========================================="

echo ""
echo "Restart:"
echo "npm run dev"

