from pathlib import Path

file = Path("server/controllers/adminDashboardController.js")

lines = file.read_text().splitlines()

output = []
inside = False
changed = False

for line in lines:

    if "const paymentRevenue =" in line:
        inside = True
        changed = True

        output.extend([
            "const paymentRevenue = {",
            "    total: completedPayments.amount,",
            "    completed: completedPayments.amount,",
            "    count: completedPayments.count,",
            "    pending: pendingPayments.count,",
            "    failed: failedPayments.count",
            "};"
        ])

        continue

    if inside:
        if line.strip() == "};":
            inside = False
        continue

    output.append(line)


if changed:
    file.write_text("\n".join(output) + "\n")
    print("✅ paymentRevenue updated successfully")
else:
    print("❌ paymentRevenue declaration not found")
