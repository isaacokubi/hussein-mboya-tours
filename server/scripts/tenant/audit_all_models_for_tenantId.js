import fs from "fs";
import path from "path";

console.log(`
=========================================
 MODEL TENANT FIELD AUDIT
=========================================
`);

const modelsDir="./models";

const files=fs.readdirSync(modelsDir)
.filter(f=>f.endsWith(".js"));

let failures=[];

for(const file of files){

const content=
fs.readFileSync(
path.join(modelsDir,file),
"utf8"
);


const hasTenant =
content.includes("tenantId");


console.log(
`${hasTenant ? "✅":"❌"} ${file}`
);


if(!hasTenant){
 failures.push(file);
}

}


console.log(`
=========================================
RESULT
=========================================
`);


if(failures.length){

console.log(
"Models missing tenantId:"
);

failures.forEach(f=>console.log("-",f));

process.exitCode=1;

}else{

console.log(
"✅ All models contain tenantId"
);

}
