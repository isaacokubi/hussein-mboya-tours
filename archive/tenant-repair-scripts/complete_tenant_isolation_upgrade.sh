#!/bin/bash

set -e

ROOT="$HOME/Desktop/isaac projects/mern stack/hussein-mboya"

cd "$ROOT/server"

echo "======================================"
echo "MULTI TENANT HARDENING INSTALL"
echo "======================================"

mkdir -p utils scripts


############################################
# CREATE TENANT QUERY PLUGIN
############################################

cat > utils/tenantIsolationPlugin.js <<'EOF'
import mongoose from "mongoose";
import { getTenantContext } from "../tenancy/context.js";


function getContext(){

    try{
        return getTenantContext();
    }
    catch(e){
        return null;
    }

}


export default function tenantIsolationPlugin(schema){


    function applyTenantFilter(){

        const ctx=getContext();


        if(
            ctx &&
            ctx.tenantId &&
            !ctx.bypass
        ){

            const query=this.getQuery();


            if(!query.tenantId){

                this.where({
                    tenantId:
                    new mongoose.Types.ObjectId(ctx.tenantId)
                });

            }

        }

    }



    schema.pre(/^find/,applyTenantFilter);

    schema.pre(
        "countDocuments",
        applyTenantFilter
    );



    schema.pre(
        "findOneAndUpdate",
        function(next){

            const ctx=getContext();

            if(
                ctx &&
                ctx.tenantId &&
                !ctx.bypass
            ){

                this.setQuery({
                    ...this.getQuery(),
                    tenantId:
                    new mongoose.Types.ObjectId(ctx.tenantId)
                });

            }

            next();

        }
    );



    schema.pre(
        "save",
        function(next){

            const ctx=getContext();


            if(
                ctx &&
                ctx.tenantId &&
                !ctx.bypass &&
                !this.tenantId
            ){

                this.tenantId =
                new mongoose.Types.ObjectId(
                    ctx.tenantId
                );

            }


            next();

        }
    );


}
EOF


echo "Created tenantIsolationPlugin"



############################################
# INSTALL PLUGIN INTO MODELS
############################################


python3 <<'PY'

from pathlib import Path


plugin_import='import tenantIsolationPlugin from "../utils/tenantIsolationPlugin.js";'


for file in Path("models").glob("*.js"):


    data=file.read_text()


    if "tenantIsolationPlugin" in data:
        continue


    if "mongoose.Schema" not in data:
        continue



    lines=data.splitlines()


    inserted=False


    for i,line in enumerate(lines):

        if "import mongoose" in line:

            lines.insert(
                i+1,
                plugin_import
            )

            inserted=True
            break



    if not inserted:
        continue



    data="\n".join(lines)


    # attach before export
    if "schema.plugin" not in data:

        marker="export default"

        index=data.find(marker)

        if index!=-1:

            data=(
                data[:index]
                +
                "\nschema.plugin(tenantIsolationPlugin);\n\n"
                +
                data[index:]
            )



    file.write_text(data)

    print("UPDATED",file)



PY



############################################
# GLOBAL TENANT MIDDLEWARE CHECK
############################################


echo ""
echo "Checking app middleware"


if ! grep -q "app.use(resolveTenant)" app.js
then


python3 <<'PY'

from pathlib import Path

p=Path("app.js")

d=p.read_text()


if "resolveTenant" in d:

    lines=d.splitlines()

    for i,l in enumerate(lines):

        if "import { resolveTenant" in l:

            insert=i+1
            break
    else:
        insert=0


    lines.insert(
        insert,
        "\napp.use(resolveTenant);\n"
    )


    p.write_text("\n".join(lines))


    print("Global tenant middleware added")

PY


else

echo "Tenant middleware already global"

fi




############################################
# CREATE TENANT MIGRATION TOOL
############################################


cat > scripts/migrateTenantData.js <<'EOF'
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();


await mongoose.connect(process.env.MONGO_URI);


const tenant =
process.argv[2];


if(!tenant){

console.log(
"Usage: node scripts/migrateTenantData.js TENANT_ID"
);

process.exit();

}


const collections =
await mongoose.connection.db
.listCollections()
.toArray();



for(const c of collections){


const col =
mongoose.connection.db.collection(c.name);


const result =
await col.updateMany(
{
tenantId:
{
$exists:false
}
},
{
$set:{
tenantId:
new mongoose.Types.ObjectId(tenant)
}
}
);


console.log(
c.name,
result.modifiedCount
);


}



await mongoose.disconnect();
EOF



############################################
# SYNTAX CHECK
############################################


echo ""
echo "Running syntax validation"


for f in models/*.js utils/*.js
do

node --check "$f" 2>/dev/null || echo "FAILED $f"

done



echo ""
echo "======================================"
echo "TENANT HARDENING COMPLETE"
echo "======================================"

echo ""
echo "NEXT:"
echo "1. Restart server"
echo "2. Test two tenants"
echo "3. Run migration:"
echo "node scripts/migrateTenantData.js TENANT_ID"

