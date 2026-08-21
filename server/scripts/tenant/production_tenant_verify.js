import fs from "fs";
import { execSync } from "child_process";

console.log(`
=========================================
PRODUCTION TENANT VERIFICATION
=========================================
`);

let failures=[];

console.log("Checking controller syntax...");

for(const file of fs.readdirSync("./controllers")){
    
    if(!file.endsWith(".js")) continue;

    try{
        execSync(
            `node --check "./controllers/${file}"`,
            {stdio:"ignore"}
        );
    }
    catch{
        failures.push(file);
    }
}


if(failures.length){

console.log("BROKEN CONTROLLERS:");
console.log(failures.join("\n"));

process.exit(1);

}


console.log("✓ Controller syntax OK");


console.log("Checking tenant imports...");


let missing=[];


for(const file of fs.readdirSync("./controllers")){

if(!file.endsWith(".js")) continue;


let code=
fs.readFileSync(
`./controllers/${file}`,
"utf8"
);


if(!code.includes("mergeTenantFilter")){
missing.push(file);
}

}



if(missing.length){

console.log("Controllers without tenant filter:");

console.log(
missing.join("\n")
);

}
else{

console.log(
"✓ All controllers contain tenant protection"
);

}


console.log(`
=========================================
TENANT VERIFICATION COMPLETE
=========================================
`);

