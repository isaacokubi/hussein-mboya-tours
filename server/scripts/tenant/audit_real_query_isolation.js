import fs from "fs";
import path from "path";

console.log(`
=========================================
 REAL QUERY TENANT SECURITY AUDIT
=========================================
`);

const dir="./controllers";

const files=fs.readdirSync(dir)
.filter(f=>f.endsWith(".js"));

let risky=[];

for(const file of files){

const code=fs.readFileSync(
path.join(dir,file),
"utf8"
);

const dangerous =
(code.includes(".find({") ||
code.includes(".find()") ||
code.includes(".findOne({") ||
code.includes(".findById("))
&&
!code.includes("tenantId");

if(dangerous){

console.log("⚠️",file);

risky.push(file);

}else{

console.log("✅",file);

}

}


console.log(`
=========================================
SUMMARY
=========================================
`);

console.log(
"Controllers needing query hardening:",
risky.length
);

risky.forEach(x=>console.log("-",x));
