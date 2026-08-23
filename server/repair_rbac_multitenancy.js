import fs from "fs";
import path from "path";
import mongoose from "mongoose";

const root = process.cwd();

function backup(file){
  if(fs.existsSync(file)){
    fs.copyFileSync(file, file+".before_rbac_fix");
    console.log("Backup:", file);
  }
}

function replace(file, oldText, newText){
  if(!fs.existsSync(file)) return;
  let data=fs.readFileSync(file,"utf8");

  if(data.includes(oldText)){
    data=data.replace(oldText,newText);
    fs.writeFileSync(file,data);
    console.log("Patched:",file);
  }
}


// ===============================
// BACKUPS
// ===============================

[
"server/models/Role.js",
"server/models/Permission.js",
"server/controllers/bootstrapController.js",
"server/controllers/authController.js"
].forEach(f=>backup(f));


// ===============================
// ROLE MODEL
// ===============================

replace(
"server/models/Role.js",

`unique: true,
        trim: true,
        lowercase: true,
        index: true,`,

`trim: true,
        lowercase: true,
        index: true,`
);


replace(
"server/models/Role.js",

`roleSchema.index({
    status: 1,
  });`,

`roleSchema.index({
    tenantId:1,
    name:1,
    unique:true
  });

roleSchema.index({
    status: 1,
  });`
);


// ===============================
// PERMISSION MODEL
// ===============================

replace(
"server/models/Permission.js",

`unique: true,
        trim: true,
        lowercase: true,
        maxlength: 100,`,

`trim: true,
        lowercase: true,
        maxlength: 100,`
);


replace(
"server/models/Permission.js",

`permissionSchema.index({
    module: 1,
    name: 1,
  });`,

`permissionSchema.index({
    tenantId:1,
    module:1,
    name:1,
    unique:true
  });

permissionSchema.index({
    module: 1,
    name: 1,
  });`
);


// ===============================
// BOOTSTRAP SUPERADMIN FIX
// ===============================

replace(
"server/controllers/bootstrapController.js",

`tenantId: organization._id,`,

`tenantId: null,`
);


replace(
"server/controllers/bootstrapController.js",

`tenantId: organization._id,
          email: superAdmin.email`,

`tenantId: null,
          email: superAdmin.email`
);


// ===============================
// AUTH LOGIN ROLE FIX
// ===============================

replace(
"server/controllers/authController.js",

`const customerRole = await Role.findOne({ name: "customer" });`,

`const customerRole = await Role.findOne({
        name:"customer",
        tenantId: tenantId
      });`
);


// ===============================
// DATABASE REPAIR
// ===============================


const envFile=path.join(root,".env");

if(!fs.existsSync(envFile)){
 console.log("Missing server/.env");
 process.exit(1);
}

const env=fs.readFileSync(envFile,"utf8");

const uri=(env.match(/MONGODB_URI=(.*)/)||[])[1];

if(!uri){
 console.log("Mongo URI missing");
 process.exit(1);
}


await mongoose.connect(uri);

console.log("Mongo connected");


const db=mongoose.connection.db;


// remove tenantId from platform owners

const users=db.collection("users");

const result=await users.updateMany(
{
 role:{
   $in:[
    "super_admin",
    "super_admin"
   ]
 }
},
{
 $set:{
   tenantId:null
 }
});

console.log(
"SuperAdmin repaired:",
result.modifiedCount
);


// remove old conflicting indexes

for(const collection of ["roles","permissions"]){

 try{

 const indexes=await db.collection(collection).indexes();

 for(const idx of indexes){

   if(
    idx.unique &&
    idx.name.includes("name")
   ){

    await db.collection(collection)
    .dropIndex(idx.name);

    console.log(
     "Dropped",
     collection,
     idx.name
    );
   }

 }

 }catch(e){
 console.log(e.message);
 }

}


// create new indexes

await db.collection("roles")
.createIndex(
{
 tenantId:1,
 name:1
},
{
 unique:true,
 partialFilterExpression:{
  tenantId:{
   $exists:true
  }
 }
}
);


await db.collection("permissions")
.createIndex(
{
 tenantId:1,
 name:1
},
{
 unique:true,
 partialFilterExpression:{
  tenantId:{
   $exists:true
  }
 }
}
);


console.log("Indexes rebuilt");


await mongoose.disconnect();


console.log(`
=========================================
RBAC MULTITENANCY REPAIR COMPLETE

Next:
1. npm run build
2. restart server
3. login as SuperAdmin
4. test:
   - Roles
   - Permissions
   - Tenant admin users
=========================================
`);
