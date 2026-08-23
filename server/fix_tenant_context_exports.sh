#!/bin/bash

set -e

echo "===================================="
echo "FIX TENANT CONTEXT EXPORTS"
echo "===================================="


PROJECT="$HOME/Desktop/isaac projects/mern stack/hussein-mboya"

cd "$PROJECT/server"


cp tenancy/context.js tenancy/context.js.backup


cat > tenancy/context.js <<'EOF'
import { AsyncLocalStorage } from "async_hooks";


const tenantStorage = new AsyncLocalStorage();



export function runWithTenant(context, callback){

return tenantStorage.run(

{
 tenantId: context?.tenantId || null,
 role: context?.role || null,

 bypass:
 context?.bypass === true ||
 context?.role === "super_admin"

},

callback

);

}



/*
 Backward compatibility
*/
export function setTenantContext(context){

const current =
tenantStorage.getStore();


if(current){

current.tenantId =
context?.tenantId || null;


current.role =
context?.role || null;


current.bypass =
context?.bypass === true ||
context?.role === "super_admin";

}

}



/*
 Current tenant getter
*/
export function getTenantContext(){

return tenantStorage.getStore() || {

tenantId:null,
role:null,
bypass:false

};

}

EOF



echo ""
echo "Checking syntax"

node --check tenancy/context.js


echo ""
echo "Checking imports"

grep "setTenantContext" middleware/authMiddleware.js || true


echo ""
echo "===================================="
echo "TENANT CONTEXT FIX COMPLETE"
echo "===================================="
