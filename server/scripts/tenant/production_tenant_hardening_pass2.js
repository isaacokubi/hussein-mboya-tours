import fs from "fs";
import path from "path";
import { execSync } from "child_process";


const controllerDir="./controllers";
const backupDir="./backups/tenant_pass2";


fs.mkdirSync(
    backupDir,
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


let changed=[];
let skipped=[];
let rolledBack=[];


for(const file of fs.readdirSync(controllerDir)){


    if(!file.endsWith(".js"))
        continue;


    const full =
    path.join(
        controllerDir,
        file
    );


    let code =
    fs.readFileSync(
        full,
        "utf8"
    );


    const original=code;


    if(
        !code.includes("mergeTenantFilter")
    ){

        skipped.push(file);
        continue;

    }


    const backup =
    path.join(
        backupDir,
        file
    );


    fs.copyFileSync(
        full,
        backup
    );



    /*
       PATCH findById
    */

    code =
    code.replace(
        /(\w+)\.findById\((req\.params\.id)\)/g,
`
$1.findOne(
mergeTenantFilter(req,{
_id:$2
})
)
`
    );



    /*
       PATCH findByIdAndUpdate
    */

    code =
    code.replace(
/(\w+)\.findByIdAndUpdate\(\s*req\.params\.id\s*,/g,
`
$1.findOneAndUpdate(
mergeTenantFilter(req,{
_id:req.params.id
}),
`
    );



    /*
       PATCH findByIdAndDelete
    */

    code =
    code.replace(
/(\w+)\.findByIdAndDelete\(\s*req\.params\.id\s*\)/g,
`
$1.findOneAndDelete(
mergeTenantFilter(req,{
_id:req.params.id
})
)
`
    );



    if(code!==original){


        fs.writeFileSync(
            full,
            code
        );


        if(!syntaxOK(full)){


            fs.copyFileSync(
                backup,
                full
            );


            rolledBack.push(file);


        }
        else{


            changed.push(file);


        }


    }


}



console.log(`
====================================
TENANT HARDENING PASS 2 COMPLETE
====================================

UPDATED:
${changed.length}

${changed.join("\n")}


ROLLED BACK:
${rolledBack.length}

${rolledBack.join("\n")}


SKIPPED(no mergeTenantFilter):
${skipped.length}

`);

