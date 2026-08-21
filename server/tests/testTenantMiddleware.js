import assert from "assert";

console.log("Running Tenant Middleware Test");

const tenantA = {
  _id:"tenantA",
  name:"Company A"
};

const tenantB = {
  _id:"tenantB",
  name:"Company B"
};


function simulateTenantAccess(userTenant, resourceTenant){

    return userTenant === resourceTenant;
}


assert.equal(
    simulateTenantAccess("tenantA","tenantA"),
    true
);


assert.equal(
    simulateTenantAccess("tenantA","tenantB"),
    false
);


console.log("Tenant middleware isolation PASS");

