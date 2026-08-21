#!/bin/bash

set -e

echo "======================================"
echo "FIX ALL TENANT CONTEXT COMPATIBILITY"
echo "======================================"


cp tenancy/context.js tenancy/context.js.before_compat


cat > tenancy/context.js <<'EOF'
import { AsyncLocalStorage } from "async_hooks";


const tenantStorage = new AsyncLocalStorage();



/*
 Main tenant wrapper
*/
export function runWithTenant(context, callback){

return tenantStorage.run(

{
 tenantId: context?.tenantId || null,

 role:
 context?.role || null,

 tenant:
 context?.tenant || null,

 bypass:
 context?.bypass === true ||
 context?.role === "super_admin"

},

callback

);

}



/*
 Existing middleware compatibility
*/
export function setTenantContext(context){

const store =
tenantStorage.getStore();


if(store){

store.tenantId =
context?.tenantId || null;


store.role =
context?.role || null;


store.tenant =
context?.tenant || null;


store.bypass =
context?.bypass === true ||
context?.role === "super_admin";

}

}



/*
 Current context
*/
export function getTenantContext(){

return tenantStorage.getStore() || {

tenantId:null,

role:null,

tenant:null,

bypass:false

};

}



/*
 Legacy function
 Used by tenantPlugin.js
*/
export function getTenantId(){

const context =
getTenantContext();


return context.tenantId || null;

}



/*
 Legacy bypass checker
 Used by tenantPlugin.js
*/
export function isTenantBypassed(){

const context =
getTenantContext();


return context.bypass === true;

}

EOF



echo ""
echo "Checking syntax"

node --check tenancy/context.js


echo ""
echo "Searching remaining missing exports"

grep -R "from.*tenancy/context" -n . | head -50


echo ""
echo "======================================"
echo "TENANT CONTEXT COMPATIBILITY FIXED"
echo "======================================"

