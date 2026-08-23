import fs from "fs";
import path from "path";
import {execSync} from "child_process";


const DIR="./controllers";
const BACKUP="./backups/full_tenant_hardener";


fs.mkdirSync(
BACKUP,
{recursive:true}
);



function syntaxOK(file){

try{

execSync(
`node --check "${file}"`,
{stdio:"ignore"}
);

return true;

}catch{

return false;

}

}



function addImport(code){

if(
code.includes("mergeTenantFilter")
)
return code;


return `import { mergeTenantFilter } from "../tenancy/context.js";\n` + code;

}




let updated=[];
let rollback=[];



for(const file of fs.readdirSync(DIR)){


if(!file.endsWith(".js"))
continue;



const full =
path.join(
DIR,
file
);



let code =
fs.readFileSync(
full,
"utf8"
);



const original=code;



fs.copyFileSync(
full,
path.join(BACKUP,file)
);



code=addImport(code);



/*
 FIND BY ID
*/

code =
code.replace(
/(\w+)\.findById\((req\.params\.id)\)/g,

`$1.findOne(
mergeTenantFilter(req,{
_id:$2
})
)`

);




/*
 FIND BY ID UPDATE
*/

code =
code.replace(

/(\w+)\.findByIdAndUpdate\(\s*req\.params\.id\s*,/g,

`$1.findOneAndUpdate(
mergeTenantFilter(req,{
_id:req.params.id
}),`

);





/*
 FIND BY ID DELETE
*/

code =
code.replace(

/(\w+)\.findByIdAndDelete\(\s*req\.params\.id\s*\)/g,

`$1.findOneAndDelete(
mergeTenantFilter(req,{
_id:req.params.id
})
)`

);





/*
 SIMPLE FIND
*/

code =
code.replace(

/(\w+)\.find\(\{\s*\}\)/g,

`$1.find(
mergeTenantFilter(req,{})
)`

);





/*
 EMPTY FIND ONE
*/

code =
code.replace(

/(\w+)\.findOne\(\{\s*\}\)/g,

`$1.findOne(
mergeTenantFilter(req,{})
)`

);





if(code!==original){


fs.writeFileSync(
full,
code
);



if(!syntaxOK(full)){


fs.copyFileSync(
path.join(BACKUP,file),
full
);


rollback.push(file);


}
else{


updated.push(file);


}


}

}



console.log(`
=====================================
FULL TENANT HARDENER COMPLETE
=====================================

UPDATED:
${updated.length}

${updated.join("\n")}


ROLLED BACK:
${rollback.length}

${rollback.join("\n")}

`);
