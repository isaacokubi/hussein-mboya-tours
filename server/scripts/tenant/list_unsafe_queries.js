import fs from "fs";
import path from "path";

const dir="./controllers";

for(const file of fs.readdirSync(dir)){

 if(!file.endsWith(".js")) continue;

 const code=fs.readFileSync(
   path.join(dir,file),
   "utf8"
 );

 const unsafe=[];

 if(code.includes(".findById("))
   unsafe.push("findById");

 if(code.includes(".findByIdAndUpdate("))
   unsafe.push("findByIdAndUpdate");

 if(code.includes(".findByIdAndDelete("))
   unsafe.push("findByIdAndDelete");

 if(code.includes(".find(") && !code.includes("tenantFilter"))
   unsafe.push("find");

 if(unsafe.length){

 console.log(
 `
${file}
 ----------------
 ${unsafe.join(", ")}
 `
 );

 }

}
