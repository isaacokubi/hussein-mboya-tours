from pathlib import Path

file = Path("client/src/pages/admin/AdminDashboard.jsx")

lines = file.read_text().splitlines()

new_lines = []
inside = False
changed = False

for line in lines:

    if "item?._id?.status ||" in line:
        inside = True
        changed = True

        new_lines.extend([
            "                  {",
            "                    typeof item?._id === \"string\"",
            "                      ? item._id",
            "                      : item?._id?.status || \"Unknown\"",
            "                  }"
        ])

        continue

    if inside:
        # skip old expression until closing JSX expression
        if '"Unknown"' in line:
            inside = False
        continue

    new_lines.append(line)


if changed:
    file.write_text("\n".join(new_lines) + "\n")
    print("✅ Booking status UI expression replaced")
else:
    print("❌ Target expression not found")
