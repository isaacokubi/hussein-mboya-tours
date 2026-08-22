import fs from "fs";
import path from "path";


const dirs=[
"./models",
"./controllers",
"./services",
"./jobs",
"./scripts"
];


let issues=[];


function scan(file){

const code=
fs.readFileSync(file,"utf8");


const dangerous=[

".aggregate(",
".populate(",
".findOne(",
".find(",
".countDocuments(",
".exists(",
".updateMany(",
".deleteMany("

];


for(const item of dangerous){

if(code.includes(item)){

if(
!code.includes("tenantId") &&
!code.includes("mergeTenantFilter") &&
!code.includes("tenant")
){

issues.push({
file,
issue:item
});

}

}

}

}



function walk(dir){

if(!fs.existsSync(dir))
return;


for(const f of fs.readdirSync(dir)){

const full=
path.join(dir,f);


if(
fs.statSync(full).isDirectory()
){

walk(full);

}
else if(
f.endsWith(".js")
){

scan(full);

}

}


}


for(const d of dirs){
walk(d);
}


console.log(`
=========================================
DATABASE TENANT AUDIT
=========================================

Potential unsafe database operations:

${issues.length}

`);


for(const x of issues){

console.log(
`${x.file}
 -> ${x.issue}`
);

}


console.log(`
=========================================
AUDIT COMPLETE
=========================================
`);
