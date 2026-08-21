import fs from "fs";
import path from "path";

const controllerDir = "controllers";
const backupDir = "controllers_backup_before_tenant";

if(!fs.existsSync(backupDir)){
    fs.mkdirSync(backupDir);
}

const files = fs.readdirSync(controllerDir)
.filter(f=>f.endsWith(".js"));


for(const file of files){

const filePath = path.join(controllerDir,file);
const backupPath = path.join(backupDir,file);

fs.copyFileSync(filePath,backupPath);


let data = fs.readFileSync(filePath,"utf8");


if(
data.includes(".find({})") ||
data.includes(".find()") ||
data.includes(".findOne({})")
){

console.log("Patching:",file);


/*
 Add tenant helper import
*/

if(!data.includes("tenantFilter")){

data =
`import { tenantFilter } from "../tenancy/tenantQuery.js";\n`
+ data;

}


/*
 Replace empty finds
*/

data=data.replace(
/\.find\(\{\}\)/g,
`.find(tenantFilter(req))`
);


data=data.replace(
/\.find\(\)/g,
`.find(tenantFilter(req))`
);


data=data.replace(
/\.findOne\(\{\}\)/g,
`.findOne(tenantFilter(req))`
);


fs.writeFileSync(
filePath,
data
);


}

}


console.log("Tenant controller patch complete");

