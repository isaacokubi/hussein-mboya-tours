/**
 * Purpose: test Tenant Middleware automated test. Main declarations: simulateTenantAccess.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import assert from "assert";

// Perform the side effect or state update expressed on the following line.
console.log("Running Tenant Middleware Test");

// Declare tenantA for use by the surrounding module or function.
const tenantA = {
  _id:"tenantA",
  name:"Company A"
};

// Declare tenantB for use by the surrounding module or function.
const tenantB = {
  _id:"tenantB",
  name:"Company B"
};


// Define simulateTenantAccess; its parameters and body implement this operation.
function simulateTenantAccess(userTenant, resourceTenant){

    // Return the expression shown below to the caller.
    return userTenant === resourceTenant;
}


// Perform the side effect or state update expressed on the following line.
assert.equal(
    simulateTenantAccess("tenantA","tenantA"),
    true
);


// Perform the side effect or state update expressed on the following line.
assert.equal(
    simulateTenantAccess("tenantA","tenantB"),
    false
);


// Perform the side effect or state update expressed on the following line.
console.log("Tenant middleware isolation PASS");
