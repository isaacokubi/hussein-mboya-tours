import fs from "fs";
import path from "path";


const DIR="./scripts";


let issues=[];


function scan(file){

const code=
fs.readFileSync(file,"utf8");


const operations=[

".find(",
".findOne(",
".aggregate(",
".updateMany(",
".deleteMany(",
".countDocuments("

];


for(const op of operations){

if(code.includes(op)){

if(
!code.includes("tenantId") &&
!code.includes("tenant")
){

issues.push({
file,
operation:op
});

}

}

}

}



for(const file of fs.readdirSync(DIR)){


const full=
path.join(DIR,file);


if(
file.endsWith(".js")
){

scan(full);

}

}



console.log(`
=====================================
BACKGROUND TENANT AUDIT
=====================================

Unsafe scripts:

${issues.length}

`);


for(const item of issues){

console.log(
`${item.file}
 -> ${item.operation}`
);

}


console.log(`
=====================================
AUDIT COMPLETE
=====================================
`);
