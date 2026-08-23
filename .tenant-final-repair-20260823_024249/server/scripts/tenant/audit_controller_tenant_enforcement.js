import fs from "fs";
import path from "path";


console.log(`
=========================================
 CONTROLLER TENANT ENFORCEMENT AUDIT
=========================================
`);


const dir="./controllers";


const files =
fs.readdirSync(dir)
.filter(f=>f.endsWith(".js"));


let missing=[];


for(const file of files){

const code =
fs.readFileSync(
path.join(dir,file),
"utf8"
);


const hasTenantContext =
code.includes("tenantId") ||
code.includes("req.user.organization") ||
code.includes("req.user.tenant") ||
code.includes("getTenant");


console.log(
`${hasTenantContext?"✅":"❌"} ${file}`
);


if(!hasTenantContext){
missing.push(file);
}


}


console.log(`
=========================================
SUMMARY
=========================================
`);


if(missing.length){

console.log(
"Controllers needing tenant review:"
);


missing.forEach(
x=>console.log("-",x)
);


}else{

console.log(
"✅ All controllers reference tenant context"
);

}
