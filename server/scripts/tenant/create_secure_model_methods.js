import fs from "fs";


const file="./tenancy/secureModels.js";


const content=`

export function secureIdQuery(id,tenantId){

return {

_id:id,

tenantId

};

}


export function secureUpdate(id,tenantId){

return {

_id:id,

tenantId

};

}

`;


fs.writeFileSync(
file,
content
);


console.log(
"Secure model helpers created"
);
