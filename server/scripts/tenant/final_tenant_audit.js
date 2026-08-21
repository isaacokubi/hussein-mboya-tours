import fs from "fs";
import path from "path";


const dir="./controllers";

let unsafe=[];


for(const file of fs.readdirSync(dir)){


if(!file.endsWith(".js"))
continue;


const code =
fs.readFileSync(
path.join(dir,file),
"utf8"
);


let problems=[];


if(
code.includes(".findById(") &&
!code.includes("mergeTenantFilter")
)
problems.push("findById");


if(
code.includes(".findByIdAndUpdate(") &&
!code.includes("mergeTenantFilter")
)
problems.push("findByIdAndUpdate");


if(
code.includes(".findByIdAndDelete(") &&
!code.includes("mergeTenantFilter")
)
problems.push("findByIdAndDelete");


if(
code.match(/\.find\(/g) &&
!code.includes("mergeTenantFilter")
)
problems.push("find");


if(problems.length){

console.log(
`\n⚠️ ${file}\n${problems.join(",")}`
);

unsafe.push(file);

}

}


console.log(
"\n============================"
);

console.log(
"Remaining controllers:",
unsafe.length
);

console.log(
"============================"
);

