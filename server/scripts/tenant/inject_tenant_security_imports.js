import fs from "fs";
import path from "path";


const dir="./controllers";


const files =
fs.readdirSync(dir)
.filter(x=>x.endsWith(".js"));



for(const file of files){


const full =
path.join(dir,file);


let code =
fs.readFileSync(full,"utf8");



if(
!code.includes("mergeTenantFilter")
&&
(
code.includes(".find(")
||
code.includes(".findOne(")
||
code.includes(".findById(")
)
){

code =
`import {mergeTenantFilter} from "../tenancy/secureQuery.js";\n`
+
code;


fs.writeFileSync(
full,
code
);


console.log(
"Updated:",
file
);


}


}


console.log(
"Tenant imports injected"
);
