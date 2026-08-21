#!/bin/bash

set -e

cd server

echo "======================================"
echo "FIX ROOT TENANT SCHEMA ATTACHMENTS"
echo "======================================"


python3 <<'PY'

from pathlib import Path
import re


for file in Path("models").glob("*.js"):


    data=file.read_text()


    if "tenantIsolationPlugin" not in data:
        continue



    # remove all existing plugin calls
    data=re.sub(
        r'.*\.plugin\(tenantIsolationPlugin\);',
        '',
        data
    )



    # Find mongoose.model export pattern

    model_match=re.search(
        r'mongoose\.model\(\s*[\'"`].*?[\'"`]\s*,\s*(\w+)',
        data
    )


    if not model_match:

        print("SKIPPED NO MODEL",file)
        file.write_text(data)
        continue



    root_schema=model_match.group(1)



    line=f"{root_schema}.plugin(tenantIsolationPlugin);"



    # insert before export

    pos=data.rfind("export default")


    if pos!=-1:

        data=(
            data[:pos]
            +
            "\n\n"
            +
            line
            +
            "\n"
            +
            data[pos:]
        )

    else:

        data += "\n\n"+line+"\n"



    file.write_text(data)

    print(
        "ROOT FIXED:",
        file,
        "=>",
        root_schema
    )



PY


echo ""
echo "Syntax check"


for f in models/*.js
do

node --check "$f" 2>/dev/null || echo "FAILED $f"

done


echo ""
echo "ROOT SCHEMA REPAIR COMPLETE"

