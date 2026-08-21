import fs from "fs";
import path from "path";


const DIR="./models";

let missingIndexes=[];


for(const file of fs.readdirSync(DIR)){


if(!file.endsWith(".js"))
continue;


const full=
path.join(DIR,file);


const code=
fs.readFileSync(
full,
"utf8"
);



if(
code.includes("tenantId")
){

if(
!code.includes("index")
&&
!code.includes("indexes")
){

missingIndexes.push(file);

}

}


}



console.log(`
=====================================
TENANT INDEX AUDIT
=====================================

Models with tenantId but no index definition:

${missingIndexes.length}

${missingIndexes.join("\n")}


=====================================
`);
