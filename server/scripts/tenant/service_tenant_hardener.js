import fs from "fs";
import path from "path";
import { execSync } from "child_process";


const DIR="./services";
const BACKUP="./backups/service_tenant_hardener";


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


for(const file of fs.readdirSync(DIR)){


if(!file.endsWith(".js"))
continue;


const full=
path.join(DIR,file);


let code=
fs.readFileSync(
full,
"utf8"
);


const original=code;


fs.copyFileSync(
full,
path.join(BACKUP,file)
);



if(
!code.includes("mergeTenantFilter") &&
!code.includes("tenantId")
){

code =
`import { mergeTenantFilter } from "../tenancy/context.js";\n`
+
code;

}



/*
 FIND EMPTY QUERIES
*/


code =
code.replace(
/(\w+)\.find\(\{\s*\}\)/g,
`$1.find(
mergeTenantFilter(req,{})
)`
);



/*
 FIND ONE EMPTY
*/


code =
code.replace(
/(\w+)\.findOne\(\{\s*\}\)/g,
`$1.findOne(
mergeTenantFilter(req,{})
)`
);



/*
 COUNT
*/


code =
code.replace(
/(\w+)\.countDocuments\(\{\s*\}\)/g,
`$1.countDocuments(
mergeTenantFilter(req,{})
)`
);



/*
 EXISTS
*/


code =
code.replace(
/(\w+)\.exists\(\{\s*\}\)/g,
`$1.exists(
mergeTenantFilter(req,{})
)`
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
========================================
SERVICE TENANT HARDENING COMPLETE
========================================

UPDATED:
${updated.length}

${updated.join("\n")}


ROLLED BACK:
${rollback.length}

${rollback.join("\n")}

========================================
`);
