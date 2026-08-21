import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const ROUTE_DIR="./routes";
const BACKUP="./backups/tenant_routes";

fs.mkdirSync(BACKUP,{recursive:true});


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
let skipped=[];
let rollback=[];


for(const file of fs.readdirSync(ROUTE_DIR)){


if(!file.endsWith(".js"))
continue;


const full=path.join(ROUTE_DIR,file);


let code=
fs.readFileSync(full,"utf8");


const original=code;


fs.copyFileSync(
full,
path.join(BACKUP,file)
);



/*
 Add tenant middleware import
*/

if(
!code.includes("tenantMiddleware") &&
!code.includes("resolveTenant") &&
!code.includes("requireTenant")
){

code =
`import { resolveTenant } from "../tenancy/context.js";\n`
+
code;

}



/*
 Add middleware to router creation
*/

if(
code.includes("Router()") &&
!code.includes("router.use(resolveTenant)")
){

code =
code.replace(
/const router\s*=\s*express\.Router\(\);/,

`const router = express.Router();

router.use(resolveTenant);`
);

}



/*
 If no change restore list
*/

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
else{

skipped.push(file);

}


}


console.log(`
====================================
ROUTE TENANT HARDENING COMPLETE
====================================

UPDATED:
${updated.length}

${updated.join("\n")}


ROLLED BACK:
${rollback.length}

${rollback.join("\n")}


UNCHANGED:
${skipped.length}

====================================
`);
