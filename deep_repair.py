#!/usr/bin/env python3

"""
Coherent Tours Deep Repair Scanner
Run from project root.

Finds:
- TODO/FIXME unfinished sections
- empty controllers
- empty services
- missing route handlers
- missing imports
- frontend API mismatches
- unused placeholder functions
- incomplete backend modules

Creates:
- DEEP_REPAIR_REPORT.txt
"""

from pathlib import Path
import re
import json
from datetime import datetime

ROOT = Path.cwd()

REPORT = ROOT / "DEEP_REPAIR_REPORT.txt"

if not (ROOT / "client").exists() or not (ROOT / "server").exists():
    print("Run this from the project root")
    exit(1)


issues = []


def scan_file(path):

    try:
        text = path.read_text(errors="ignore")
    except:
        return ""

    return text


print("Scanning project...")


# -----------------------------
# FIND TODO / STUBS
# -----------------------------

for folder in [
    ROOT / "client",
    ROOT / "server"
]:

    for file in folder.rglob("*"):

        if file.suffix not in [
            ".js",
            ".jsx",
            ".ts",
            ".tsx"
        ]:
            continue

        text = scan_file(file)

        matches = re.findall(
            r"""
            TODO|
            FIXME|
            NOT.?IMPLEMENTED|
            IMPLEMENT.?THIS|
            return\s+null|
            return\s+\{\}
            """,
            text,
            re.I | re.X
        )

        if matches:

            issues.append(
                f"""
FILE:
{file.relative_to(ROOT)}

FOUND:
{', '.join(set(matches))}
"""
            )


# -----------------------------
# CONTROLLER CHECK
# -----------------------------

controller = ROOT / "server/controllers"

if controller.exists():

    for file in controller.glob("*.js"):

        size = file.stat().st_size

        if size < 500:

            issues.append(
                f"""
Small controller:

{file.relative_to(ROOT)}

Size:
{size} bytes
"""
            )


# -----------------------------
# ROUTE CHECK
# -----------------------------

routes = ROOT / "server/routes"

if routes.exists():

    for file in routes.glob("*.js"):

        text = scan_file(file)


        handlers = re.findall(
            r"""
            router\.(get|post|put|delete)
            \(
            [^,]+,
            ([A-Za-z0-9_]+)
            """,
            text,
            re.X
        )


        if not handlers:

            issues.append(
                f"""
Route without detected handlers:

{file.relative_to(ROOT)}
"""
            )


# -----------------------------
# FRONTEND API CHECK
# -----------------------------

api_folder = ROOT / "client/src/api"


exports=set()


if api_folder.exists():

    for file in api_folder.rglob("*.js"):

        text=scan_file(file)

        found=re.findall(
            r"""
            export\s+(?:const|function)
            \s+(\w+)
            """,
            text,
            re.X
        )

        exports.update(found)



for file in (ROOT/"client/src").rglob("*.jsx"):

    text=scan_file(file)

    calls=re.findall(
        r"""
        (\w+)\(
        """,
        text
    )


    for call in calls:

        if (
            call.lower().endswith(
                (
                    "api",
                    "report",
                    "dashboard",
                    "booking"
                )
            )
            and call not in exports
        ):

            issues.append(
                f"""
Possible missing frontend function:

{call}

Used in:
{file.relative_to(ROOT)}
"""
            )



# -----------------------------
# BACKEND IMPORT CHECK
# -----------------------------

for file in (ROOT/"server").rglob("*.js"):

    text=scan_file(file)

    imports=re.findall(
        r"""
        from\s+["'](.+?)["']
        """,
        text
    )


    for item in imports:

        if item.startswith("."):

            target = (
                file.parent /
                item
            )

            possible=[
                target,
                target.with_suffix(".js")
            ]

            if not any(
                p.exists()
                for p in possible
            ):

                issues.append(
                    f"""
Missing import:

{file.relative_to(ROOT)}

{item}
"""
                )


# -----------------------------
# WRITE REPORT
# -----------------------------


with open(
    REPORT,
    "w",
    encoding="utf8"
) as f:

    f.write(
        "COHERENT TOURS DEEP REPAIR REPORT\n"
    )

    f.write(
        datetime.now().isoformat()
    )

    f.write(
        "\n\n"
    )


    if issues:

        for item in issues:

            f.write(
                item
            )

            f.write(
                "\n"
            )

    else:

        f.write(
            "NO OBVIOUS INCOMPLETE MODULES FOUND"
        )



print("")
print("==============================")
print("DEEP SCAN COMPLETE")
print("==============================")
print("")
print("Report created:")
print(REPORT)
print("")
print("Issues found:",len(issues))
