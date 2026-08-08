from pathlib import Path
import re

ROOT = Path.cwd()

issues=[]

IGNORE=[
    "node_modules",
    ".git",
    "dist",
    "build"
]


def ignored(path):
    return any(x in path.parts for x in IGNORE)


# Scan only YOUR code
for base in [
    ROOT/"server/controllers",
    ROOT/"server/services",
    ROOT/"server/routes",
    ROOT/"client/src"
]:

    if not base.exists():
        continue


    for f in base.rglob("*"):

        if ignored(f):
            continue

        if f.suffix not in [
            ".js",".jsx",".ts",".tsx"
        ]:
            continue


        text=f.read_text(errors="ignore")


        # TODO
        if re.search(
            r"TODO|FIXME|not implemented|IMPLEMENT",
            text,
            re.I
        ):
            issues.append(
                f"TODO/STUB: {f.relative_to(ROOT)}"
            )


        # empty exports
        if re.search(
            r"export\s+(const|function).*?{\s*}",
            text,
            re.S
        ):
            issues.append(
                f"Empty export: {f.relative_to(ROOT)}"
            )


        # controllers with almost no code
        if "controllers" in f.parts:

            if len(text)<800:

                issues.append(
                    f"Small controller: {f.relative_to(ROOT)} ({len(text)} bytes)"
                )


        # services returning null
        if "services" in f.parts:

            if "return null" in text:

                issues.append(
                    f"Service returns null: {f.relative_to(ROOT)}"
                )


with open(
    "REAL_COMPLETION_REPORT.txt",
    "w"
) as out:

    out.write(
        "\n".join(issues)
    )


print(
    "DONE. Report:"
)

print(
    "REAL_COMPLETION_REPORT.txt"
)

print(
    "Issues:",
    len(issues)
)
