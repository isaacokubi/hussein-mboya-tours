from pathlib import Path

file = Path("client/src/pages/admin/AdminDashboard.jsx")

lines = file.read_text().splitlines()

new_lines = []
skip = False
changed = False

for line in lines:

    if "const paymentStats =" in line:
        changed = True
        skip = True

        new_lines.extend([
            "  const paymentStats =",
            "    stats.paymentStats ||",
            "    {",
            "      completed: 0,",
            "      pending: 0,",
            "      failed: 0",
            "    };"
        ])

        continue

    if skip:
        if "};" in line:
            skip = False
        continue

    new_lines.append(line)

if changed:
    file.write_text("\n".join(new_lines) + "\n")
    print("✅ paymentStats block cleaned successfully")
else:
    print("❌ paymentStats block not found")

