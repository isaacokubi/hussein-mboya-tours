import fs from "fs";
import path from "path";

const DIR="./routes";

let missing=[];
let protectedRoutes=[];


for(const file of fs.readdirSync(DIR)){

    if(!file.endsWith(".js"))
        continue;


    const full=path.join(DIR,file);

    const code=
    fs.readFileSync(full,"utf8");


    const hasTenant =
        code.includes("tenant") ||
        code.includes("tenantMiddleware") ||
        code.includes("resolveTenant") ||
        code.includes("requireTenant");


    if(hasTenant){
        protectedRoutes.push(file);
    }
    else{
        missing.push(file);
    }

}


console.log(`
=====================================
ROUTE TENANT AUDIT
=====================================

Protected routes:
${protectedRoutes.length}

${protectedRoutes.join("\n")}


Missing tenant middleware:
${missing.length}

${missing.join("\n")}

=====================================
`);
