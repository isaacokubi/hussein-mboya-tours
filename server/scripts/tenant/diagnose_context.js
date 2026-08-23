import * as context from "../../tenancy/context.js";

console.log("=========================================");
console.log(" TENANT CONTEXT DIAGNOSTIC");
console.log("=========================================");
console.log();

const exportsList = Object.keys(context).sort();

console.log("Exports:");
for (const item of exportsList) {
  console.log(` - ${item}`);
}

console.log();

const functions = exportsList.filter(
  (name) => typeof context[name] === "function"
);

console.log("Functions:");
for (const name of functions) {
  console.log(` - ${name}`);
}

console.log();

const tenantNames = exportsList.filter((name) =>
  /tenant/i.test(name)
);

console.log("Tenant-related exports:");
for (const name of tenantNames) {
  console.log(` - ${name}`);
}

console.log();
console.log("Context diagnostic complete.");
