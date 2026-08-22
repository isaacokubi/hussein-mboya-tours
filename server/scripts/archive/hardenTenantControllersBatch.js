import fs from "fs";
import path from "path";

const targets = [
  "controllers",
  "services"
];

const skip = new Set([
  "tenantController.js",
  "tenantBrandingController.js",
  "superAdminOperationsController.js",
  "superAdminUserController.js",
  "superAdminDashboardController.js",
  "superAdminToolsController.js",
  "bootstrapController.js",
  "authController.js",
  "adminAuthController.js",
  "mfaController.js",
  "settingsController.js"
]);

const report = {
  patched: [],
  skipped: [],
  failed: []
};

function backup(file,text){
  const backup = `${file}.before_tenant_guard_batch`;

  if(!fs.existsSync(backup)){
    fs.writeFileSync(backup,text);
  }
}


function needsTenant(text){

  return (
    text.includes(".find(") ||
    text.includes(".findOne(") ||
    text.includes(".findById(") ||
    text.includes(".create(") ||
    text.includes(".updateOne(") ||
    text.includes(".updateMany(") ||
    text.includes(".deleteOne(") ||
    text.includes(".deleteMany(") ||
    text.includes(".aggregate(")
  );

}


function alreadyProtected(text){

  return (
    text.includes("requireTenantId") ||
    text.includes("getTenantId") ||
    text.includes("runWithTenant") ||
    text.includes("resolveTenant")
  );

}


for(const folder of targets){

  const dir = path.resolve(folder);

  if(!fs.existsSync(dir)) continue;


  for(const file of fs.readdirSync(dir,{recursive:true})){

    if(!file.endsWith(".js")) continue;


    const full = path.join(folder,file);


    if(skip.has(path.basename(file))){
      report.skipped.push(full);
      continue;
    }


    let text = fs.readFileSync(full,"utf8");


    if(!needsTenant(text)) continue;


    if(alreadyProtected(text)){
      report.skipped.push(full);
      continue;
    }


    backup(full,text);


    try{


      if(text.includes('import { requireTenantId } from "../tenancy/context.js";')){

      } 
      else if(text.includes('from "../tenancy/context.js"')){

        text=text.replace(
          /import\s+\{([^}]*)\}\s+from\s+"..\/tenancy\/context\.js";/,
          (m,imports)=>{
            if(imports.includes("requireTenantId")) return m;

            return `import {${imports}, requireTenantId} from "../tenancy/context.js";`;
          }
        );

      }
      else {

        const mongooseImport =
          text.match(/^import .*?;\n/m);

        if(mongooseImport){

          text=text.replace(
            mongooseImport[0],
            mongooseImport[0]+
            'import { requireTenantId } from "../tenancy/context.js";\n'
          );

        } else {

          text=
          'import { requireTenantId } from "../tenancy/context.js";\n'
          + text;

        }

      }


      const functionPattern =
      /(export\s+(?:const|async\s+function|function)\s+\w+\s*=\s*(?:async\s*)?\([^)]*\)\s*=>\s*\{)/;


      if(functionPattern.test(text)){

        text=text.replace(
          functionPattern,
          "$1\n  requireTenantId();"
        );

      }
      else {

        const asyncFunction =
        /(async\s+function\s+\w+\s*\([^)]*\)\s*\{)/;

        if(asyncFunction.test(text)){

          text=text.replace(
            asyncFunction,
            "$1\n  requireTenantId();"
          );

        }
        else {

          report.failed.push(full);
          continue;

        }

      }


      fs.writeFileSync(full,text);

      report.patched.push(full);


    }catch(error){

      report.failed.push({
        file:full,
        error:error.message
      });

    }

  }

}


console.log("\nTENANT CONTROLLER HARDENING REPORT");
console.log("==================================");

console.log("\nPATCHED:");
for(const f of report.patched)
 console.log(" +",f);


console.log("\nSKIPPED:");
for(const f of report.skipped)
 console.log(" -",f);


console.log("\nFAILED:");
for(const f of report.failed)
 console.log(" !",f);


fs.writeFileSync(
 "tenant-hardening-report.json",
 JSON.stringify(report,null,2)
);


console.log("\nReport saved: tenant-hardening-report.json");

