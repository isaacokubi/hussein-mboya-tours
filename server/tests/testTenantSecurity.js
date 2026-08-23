import assert from "assert";


console.log("Running Tenant Security Tests");


function canAccessTenant(userTenant,targetTenant){

    if(userTenant !== targetTenant){
        return false;
    }

    return true;

}


const companyA="tenantA";
const companyB="tenantB";


assert.equal(
 canAccessTenant(companyA,companyA),
 true
);


assert.equal(
 canAccessTenant(companyA,companyB),
 false
);



console.log("Cross tenant attack prevention PASS");
