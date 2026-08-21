import fs from "fs";
import path from "path";


const dir="./controllers";


console.log(`
=========================================
 TENANT SECURITY PATCH TARGETS
=========================================
`);


const files =
fs.readdirSync(dir)
.filter(x=>x.endsWith(".js"));


let output=[];


for(const file of files){

const content =
fs.readFileSync(
path.join(dir,file),
"utf8"
);


const lines =
content.split("\n");


lines.forEach((line,index)=>{


if(
(
line.includes(".find(") ||
line.includes(".findOne(") ||
line.includes(".findById(") ||
line.includes("findByIdAndUpdate")
)
&&
!content.includes("mergeTenantFilter")
){

output.push({

file,
line:index+1,
code:line.trim()

});

}


});


}



fs.writeFileSync(
"tenant_controller_patch_report.json",
JSON.stringify(
output,
null,
2
)
);


console.log(
"Created tenant_controller_patch_report.json"
);


console.log(
"Queries found:",
output.length
);
