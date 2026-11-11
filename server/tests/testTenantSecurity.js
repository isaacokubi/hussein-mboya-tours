/**
 * Purpose: test Tenant Security automated test. Main declarations: canAccessTenant.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import assert from "assert";


// Perform the side effect or state update expressed on the following line.
console.log("Running Tenant Security Tests");


// Define canAccessTenant; its parameters and body implement this operation.
function canAccessTenant(userTenant,targetTenant){

    // Check the condition (userTenant !== targetTenant) and run the matching branch.
    if(userTenant !== targetTenant){
        // Return the expression shown below to the caller.
        return false;
    }

    // Return the expression shown below to the caller.
    return true;

}


// Declare companyA for use by the surrounding module or function.
const companyA="tenantA";
// Declare companyB for use by the surrounding module or function.
const companyB="tenantB";


// Perform the side effect or state update expressed on the following line.
assert.equal(
 canAccessTenant(companyA,companyA),
 true
);


// Perform the side effect or state update expressed on the following line.
assert.equal(
 canAccessTenant(companyA,companyB),
 false
);



// Perform the side effect or state update expressed on the following line.
console.log("Cross tenant attack prevention PASS");
