import fs from "fs";
import path from "path";


const DIR="./scripts";


const tenantJobs=[];
const platformJobs=[];


const platformKeywords=[
"admin",
"superadmin",
"security",
"migration",
"reset",
"repair",
"seed",
"bootstrap"
];


for(const file of fs.readdirSync(DIR)){


if(!file.endsWith(".js"))
continue;


const code=
fs.readFileSync(
path.join(DIR,file),
"utf8"
);


let isPlatform=false;


for(const word of platformKeywords){

if(
file.toLowerCase().includes(word)
){

isPlatform=true;

}

}



if(isPlatform){

platformJobs.push(file);

}
else{

tenantJobs.push(file);

}

}



console.log(`
=====================================
BACKGROUND JOB CLASSIFICATION
=====================================


TENANT SCOPED JOBS:
${tenantJobs.length}

${tenantJobs.join("\n")}



PLATFORM JOBS:
${platformJobs.length}

${platformJobs.join("\n")}


=====================================
`);
