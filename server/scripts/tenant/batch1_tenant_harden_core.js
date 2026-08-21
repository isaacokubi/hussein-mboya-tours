import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const targets = [
"bookingController.js",
"bookingAdminController.js",
"bookingTravelDateController.js",
"tourController.js",
"tourManagerController.js",
"tourAssignmentController.js",
"tourAvailabilityController.js",
"vehicleController.js",
"driverController.js",
"guideController.js",
"customerController.js",
"userController.js"
];


const backup="./backups/tenant_batch1";

fs.mkdirSync(
backup,
{
recursive:true
}
);


function check(file){
try{
execSync(
`node --check "${file}"`,
{
stdio:"ignore"
}
);
return true;
}
catch{
return false;
}
}



for(const file of targets){

const full="./controllers/"+file;


if(!fs.existsSync(full)){
console.log("Missing:",file);
continue;
}


const backupFile =
path.join(
backup,
file
);


fs.copyFileSync(
full,
backupFile
);



let code =
fs.readFileSync(
full,
"utf8"
);



if(!code.includes("mergeTenantFilter")){


if(code.includes("import ")){

code =
`import { mergeTenantFilter } from "../tenancy/context.js";\n`
+
code;

}


}



let original=code;



/*
 SAFE ID PATCHES
*/


code =
code.replace(
/(\w+)\.findById\(req\.params\.id\)/g,
`$1.findOne(
mergeTenantFilter(req,{
_id:req.params.id
})
)`
);



code =
code.replace(
/(\w+)\.findByIdAndDelete\(req\.params\.id\)/g,
`$1.findOneAndDelete(
mergeTenantFilter(req,{
_id:req.params.id
})
)`
);



if(code!==original){

fs.writeFileSync(
full,
code
);


if(!check(full)){

console.log(
"ROLLBACK:",
file
);


fs.copyFileSync(
backupFile,
full
);


}
else{

console.log(
"UPDATED:",
file
);

}


}
else{

console.log(
"NO CHANGE:",
file
);

}


}


console.log(
"Batch 1 tenant hardening complete"
);

