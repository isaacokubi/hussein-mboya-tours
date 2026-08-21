#!/bin/bash

set -e

echo "=========================================="
echo "GLOBAL MULTI TENANT FIX"
echo "=========================================="

cd server


echo ""
echo "1. Creating global tenant plugin loader"
echo "----------------------------------------"

mkdir -p config


cat > config/tenantPluginLoader.js <<'EOF'
import mongoose from "mongoose";
import tenantIsolationPlugin from "../utils/tenantIsolationPlugin.js";


export default function loadTenantPlugin(){

mongoose.plugin(
tenantIsolationPlugin
);


console.log(
"✅ Global tenant isolation plugin loaded"
);

}
EOF



echo ""
echo "2. Updating tenant isolation plugin"
echo "----------------------------------------"


cat > utils/tenantIsolationPlugin.js <<'EOF'
import mongoose from "mongoose";
import { getTenantContext } from "../tenancy/context.js";


function filter(query){

const context=getTenantContext();


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




export default function tenantIsolationPlugin(schema){



schema.pre(
[
"find",
"findOne",
"findOneAndUpdate",
"findOneAndDelete",
"countDocuments"
],

function(next){

filter(this);

next();

});





schema.pre(
"aggregate",
function(next){


const context=getTenantContext();


if(
context &&
context.tenantId &&
!context.bypass
){

this.pipeline().unshift({

$match:{

tenantId:
new mongoose.Types.ObjectId(
context.tenantId
)

}

});

}


next();

});


}
EOF



echo ""
echo "3. Removing model-level tenant plugins"
echo "----------------------------------------"


python3 <<'PY'

from pathlib import Path
import re


for file in Path("models").glob("*.js"):

    data=file.read_text()

    original=data


    data=re.sub(
        r'import\s+tenantIsolationPlugin.*?;\s*\n',
        '',
        data
    )


    data=re.sub(
        r'.*\.plugin\(tenantIsolationPlugin\);\s*\n?',
        '',
        data
    )


    if data != original:

        file.write_text(data)

        print("Cleaned:",file)

PY



echo ""
echo "4. Injecting global plugin loader into app.js"
echo "----------------------------------------"


python3 <<'PY'

from pathlib import Path
import re


file=Path("app.js")

data=file.read_text()



if "loadTenantPlugin" not in data:


    # add import before apiRoutes
    data=data.replace(
        'import apiRoutes from "./routes/index.js";',
        'import loadTenantPlugin from "./config/tenantPluginLoader.js";\n\nloadTenantPlugin();\n\nimport apiRoutes from "./routes/index.js";'
    )


else:

    print("Loader already exists")



file.write_text(data)

print("app.js updated")

PY



echo ""
echo "5. Syntax checking"
echo "----------------------------------------"


node --check app.js


for f in models/*.js
do
    node --check "$f" || exit 1
done


node --check utils/tenantIsolationPlugin.js

node --check config/tenantPluginLoader.js



echo ""
echo "=========================================="
echo "GLOBAL TENANT FIX COMPLETE"
echo "=========================================="

echo ""
echo "Next:"
echo "cd server"
echo "npm run dev"

