#!/bin/bash

set -e

cd server

echo "================================"
echo "INSTALL TENANT AGGREGATION PLUGIN"
echo "================================"


python3 <<'PY'

from pathlib import Path

files=list(Path("models").glob("*.js"))

plugin='import tenantAggregationPlugin from "../utils/tenantAggregationPlugin.js";'


for file in files:

    data=file.read_text()


    if "tenantAggregationPlugin" in data:
        continue


    if "mongoose.Schema" in data:

        lines=data.splitlines()


        # add import after mongoose import
        inserted=False

        for i,line in enumerate(lines):

            if "import mongoose" in line:

                lines.insert(
                    i+1,
                    plugin
                )

                inserted=True
                break


        if not inserted:
            continue


        data="\n".join(lines)


        # attach after schema creation
        markers=[
            ");",
        ]


        pos=data.find("const schema")

        if pos!=-1:

            end=data.find(");",pos)

            if end!=-1:

                data=data[:end+2]+"\n\nschema.plugin(tenantAggregationPlugin);"+data[end+2:]


        file.write_text(data)

        print("UPDATED",file)


PY


echo ""
echo "Checking syntax"


for f in models/*.js
do
node --check "$f" 2>/dev/null || echo "FAILED $f"
done


echo ""
echo "PLUGIN INSTALL COMPLETE"

