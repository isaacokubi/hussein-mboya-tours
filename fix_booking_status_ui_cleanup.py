from pathlib import Path

file = Path("client/src/pages/admin/AdminDashboard.jsx")

lines = file.read_text().splitlines()

new_lines = []

for i, line in enumerate(lines, start=1):

    if 410 <= i <= 417:
        if i == 410:
            new_lines.extend([
                "                  {",
                "                    typeof item?._id === \"string\"",
                "                      ? item._id",
                "                      : item?._id?.status || \"Unknown\"",
                "                  }"
            ])
        continue

    new_lines.append(line)

file.write_text("\n".join(new_lines) + "\n")

print("✅ Booking status JSX block repaired")
