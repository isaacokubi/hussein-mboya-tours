import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const controllerDir = "./controllers";
const backupDir = "./backups/tenant_safe_patch";

fs.mkdirSync(backupDir,{recursive:true});

const files = fs.readdirSync(controllerDir)
.filter(f=>f.endsWith(".js"));

let changed=[];
let failed=[];


function syntaxOK(file){
    try{
        execSync(`node --check "${file}"`,{
            stdio:"ignore"
        });
        return true;
    }catch{
        return false;
    }
}


for(const file of files){

    const full = path.join(controllerDir,file);

    let code = fs.readFileSync(full,"utf8");


    if(!code.includes("mergeTenantFilter"))
        continue;


    const backup =
    path.join(
        backupDir,
        file
    );


    fs.copyFileSync(
        full,
        backup
    );


    let original=code;



    /*
       SAFE PATCH 1
       findById(req.params.id)
    */

    code = code.replace(
    /(\w+)\.findById\(req\.params\.id\)/g,
    `$1.findOne(
        mergeTenantFilter(req,{
            _id:req.params.id
        })
    )`
    );



    /*
       SAFE PATCH 2
       findByIdAndDelete
    */

    code = code.replace(
    /(\w+)\.findByIdAndDelete\(req\.params\.id\)/g,
    `$1.findOneAndDelete(
        mergeTenantFilter(req,{
            _id:req.params.id
        })
    )`
    );



    /*
       SAFE PATCH 3
       findByIdAndUpdate
    */

    code = code.replace(
    /(\w+)\.findByIdAndUpdate\(\s*req\.params\.id,/g,
    `$1.findOneAndUpdate(
        mergeTenantFilter(req,{
            _id:req.params.id
        }),`
    );



    if(code!==original){

        fs.writeFileSync(full,code);


        if(!syntaxOK(full)){

            console.log(
            "ROLLBACK SYNTAX:",
            file
            );


            fs.copyFileSync(
                backup,
                full
            );

            failed.push(file);

        }
        else{

            console.log(
            "PATCHED:",
            file
            );

            changed.push(file);
        }

    }

}


console.log("\n==============================");
console.log("SAFE TENANT PATCH COMPLETE");
console.log("==============================");

console.log(
"Changed:",
changed.length
);

console.log(
"Failed rollback:",
failed.length
);


if(failed.length){
console.log(
failed.join("\n")
);
}
