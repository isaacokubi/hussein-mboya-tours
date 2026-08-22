import fs from "fs";
import path from "path";

const modelsDir = "./models";

const globalModels = new Set([
  "Organization.js",
  "Permission.js",
  "Role.js",
  "Currency.js",
  "SystemSetting.js",
  "SystemSettings.js"
]);

for (const file of fs.readdirSync(modelsDir)) {

  if (!file.endsWith(".js")) continue;

  if (globalModels.has(file)) {
    console.log("SKIP GLOBAL:", file);
    continue;
  }

  const full = path.join(modelsDir,file);

  let text = fs.readFileSync(full,"utf8");

  if (!text.includes("mongoose.model")) continue;

  if (text.includes("tenantPlugin")) {
    console.log("ALREADY:",file);
    continue;
  }

  console.log("PATCH:",file);


  // add import
  if (text.includes('import mongoose from "mongoose";')) {

    text = text.replace(
      'import mongoose from "mongoose";',
      'import mongoose from "mongoose";\nimport { tenantPlugin } from "../tenancy/tenantPlugin.js";'
    );

  } else {

    console.log("NO MONGOOSE IMPORT:",file);
    continue;
  }


  // inject before model creation
  const modelPatterns = [
    /mongoose\.model\(\s*["'`][^"'`]+["'`],\s*([A-Za-z0-9_]+Schema)/,
    /mongoose\.model\(\s*["'`][^"'`]+["'`],\s*\n?\s*([A-Za-z0-9_]+Schema)/
  ];


  let injected=false;


  for (const regex of modelPatterns){

    const match=text.match(regex);

    if(match){

      const schemaName=match[1];

      text=text.replace(
        match[0],
        `${schemaName}.plugin(tenantPlugin);\n\n${match[0]}`
      );

      injected=true;
      break;
    }
  }


  if(!injected){

    console.log("FAILED INJECT:",file);
    continue;
  }


  fs.writeFileSync(full,text);

}

console.log("Tenant plugin sweep complete");
