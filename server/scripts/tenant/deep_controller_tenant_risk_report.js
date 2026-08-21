import fs from "fs";
import path from "path";

console.log(`
=========================================
 DEEP TENANT CONTROLLER RISK REPORT
=========================================
`);

const dir="./controllers";

const files=fs.readdirSync(dir)
.filter(f=>f.endsWith(".js"));

let findings=[];


for(const file of files){

const full=path.join(dir,file);

const lines=fs.readFileSync(full,"utf8")
.split("\n");


lines.forEach((line,index)=>{

const risky =
line.includes(".find(") ||
line.includes(".findOne(") ||
line.includes(".findById(") ||
line.includes(".updateMany(") ||
line.includes(".deleteMany(") ||
line.includes(".findByIdAndUpdate(") ||
line.includes(".findByIdAndDelete(");


if(risky){

const context =
lines.slice(
Math.max(0,index-2),
index+3
).join("\n");


const protectedQuery =
context.includes("tenantId") ||
context.includes("req.user") ||
context.includes("tenant");


if(!protectedQuery){

findings.push({
file,
line:index+1,
code:line.trim()
});

}

}

});

}


console.log(`
=========================================
UNPROTECTED DATABASE QUERIES
=========================================
`);


console.log(
"Risky queries:",
findings.length
);


findings.forEach(x=>{

console.log(`
FILE:
${x.file}

LINE:
${x.line}

QUERY:
${x.code}

------------------------------
`);

});


console.log(`
=========================================
END REPORT
=========================================
`);
