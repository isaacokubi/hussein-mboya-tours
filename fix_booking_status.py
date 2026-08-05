from pathlib import Path

file = Path("server/controllers/adminDashboardController.js")

lines = file.read_text().splitlines()

new_lines = []
inside = False
changed = False

for line in lines:

    # Start replacing the _id object inside bookingStatus aggregation
    if line.strip() == '_id:{':
        # Look ahead to see if this is the bookingStatus grouping
        inside = True
        buffer = []
        continue

    if inside:
        if line.strip() == '},':
            new_lines.append('                          _id:"$status",')
            inside = False
            changed = True
        continue

    new_lines.append(line)


if changed:
    file.write_text("\n".join(new_lines) + "\n")
    print("✅ Booking status aggregation replaced")
else:
    print("❌ Booking status block not found")
