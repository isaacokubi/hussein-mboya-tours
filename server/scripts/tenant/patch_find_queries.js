import fs from "fs";
import path from "path";


const dir="./controllers";


for(
const file of fs.readdirSync(dir)
){

if(!file.endsWith(".js"))
continue;


const full =
path.join(dir,file);


let code =
fs.readFileSync(full,"utf8");



if(
!code.includes("mergeTenantFilter")
)
continue;



code =
code.replace(
/\.find\((\{)/g,
".find(mergeTenantFilter(req,$1"
);


code =
code.replace(
/\.findOne\((\{)/g,
".findOne(mergeTenantFilter(req,$1"
);



fs.writeFileSync(
full,
code
);


console.log(
"Patched:",
file
);


}


console.log(
"Find query patch completed"
);
