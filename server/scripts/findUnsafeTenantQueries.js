import { backgroundTenantFilter } from "../tenancy/backgroundTenantFilter.js";
import fs from "fs";
import path from "path";


for(const file of fs.readdirSync("controllers")){

if(!file.endsWith(".js"))
continue;


const data =
fs.readFileSync(
path.join("controllers",file),
"utf8"
);


if(
data.includes(".find({})") ||
data.includes(".find()") ||
data.includes(".findOne({})")
){

console.log(
"UNSAFE:",
file
);

}

}
