#!/bin/bash

set -e

cd server

echo "================================="
echo "REPAIR TENANT PLUGIN INSTALLATION"
echo "================================="


python3 <<'PY'

from pathlib import Path
import re


for file in Path("models").glob("*.js"):

    data=file.read_text()


    if "tenantIsolationPlugin" not in data:
        continue


    lines=data.splitlines()


    # remove broken plugin placements
    lines=[
        l for l in lines
        if "schema.plugin(tenantIsolationPlugin)" not in l
    ]


    data="\n".join(lines)



    # Find schema declaration
    matches=list(
        re.finditer(
            r'(const|let|var)\s+(\w+)\s*=\s*new\s+mongoose\.Schema',
            data
        )
    )


    if not matches:

        print("NO SCHEMA FOUND",file)

        file.write_text(data)

        continue



    schema_name=matches[0].group(2)



    # Insert before export default/model.exports
    plugin_line=f"{schema_name}.plugin(tenantIsolationPlugin);"


    if plugin_line not in data:


        export_match=re.search(
            r'\nexport default',
            data
        )


        if export_match:

            pos=export_match.start()

            data=(
                data[:pos]
                +
                "\n\n"
                +
                plugin_line
                +
                "\n"
                +
                data[pos:]
            )


    file.write_text(data)

    print("FIXED",file,schema_name)



PY


echo ""
echo "Checking syntax"


for f in models/*.js
do
node --check "$f" 2>/dev/null || echo "FAILED $f"
done


echo ""
echo "REPAIR COMPLETE"

