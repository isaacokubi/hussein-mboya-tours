import fs from "fs";
import path from "path";
import {execSync} from "child_process";


const TARGETS=[

"autoCancelExpiredPendingBookings.js",
"checkBookingPaymentIntegrity.js",
"cleanOrganizationDomains.js",
"createMissingCommissions.js",
"findUnsafeTenantQueries.js",
"migrateAuthSecurity.js",
"repairLegacyFailedBookingStatuses.js",
"repairOrphanPendingBookings.js",
"repairRoleReferences.js",
"resetTenantForFreshRegistration.js",
"seedStaffVehicles.js"

];


const BACKUP="./backups/background_scripts";


fs.mkdirSync(
BACKUP,
{recursive:true}
);



function syntaxOK(file){

try{

execSync(
`node --check "${file}"`,
{stdio:"ignore"}
);

return true;

}
catch{

return false;

}

}



let updated=[];
let rollback=[];



for(const file of TARGETS){


const full=
path.join(
"./scripts",
file
);



if(!fs.existsSync(full))
continue;



let code=
fs.readFileSync(
full,
"utf8"
);



fs.copyFileSync(
full,
path.join(BACKUP,file)
);



const original=code;



if(
!code.includes("backgroundTenantFilter")
){

code=
`import { backgroundTenantFilter } from "../tenancy/backgroundTenantFilter.js";\n`
+
code;

}



code =
code.replace(
/(\w+)\.find\(\{\s*\}\)/g,
`$1.find(
backgroundTenantFilter({})
)`
);



code =
code.replace(
/(\w+)\.findOne\(\{\s*\}\)/g,
`$1.findOne(
backgroundTenantFilter({})
)`
);



code =
code.replace(
/(\w+)\.countDocuments\(\{\s*\}\)/g,
`$1.countDocuments(
backgroundTenantFilter({})
)`
);



code =
code.replace(
/(\w+)\.deleteMany\(\{\s*\}\)/g,
`$1.deleteMany(
backgroundTenantFilter({})
)`
);



code =
code.replace(
/(\w+)\.updateMany\(\{\s*\}/g,
`$1.updateMany(
backgroundTenantFilter({`
);



if(code!==original){


fs.writeFileSync(
full,
code
);



if(!syntaxOK(full)){


fs.copyFileSync(
path.join(BACKUP,file),
full
);


rollback.push(file);


}
else{


updated.push(file);


}


}



}



console.log(`
=====================================
BACKGROUND HARDENING COMPLETE
=====================================

UPDATED:
${updated.length}

${updated.join("\n")}


ROLLBACK:
${rollback.length}

${rollback.join("\n")}

=====================================
`);
