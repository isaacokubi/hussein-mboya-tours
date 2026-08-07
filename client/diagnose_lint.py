#!/usr/bin/env python3

from pathlib import Path

ROOT = Path.cwd()

targets = [
    ("src/components/admin/AddVehicleModal.jsx", 1, 100),
    ("src/context/AuthContext.jsx", 265, 315),
    ("src/pages/Dashboard.jsx", 1, 115),
    ("src/pages/Login.jsx", 135, 200),
    ("src/pages/Profile.jsx", 25, 70),
    ("src/pages/admin/AdminDashboard.jsx", 1, 170),
    ("src/pages/admin/BookingManagement.jsx", 55, 100),
    ("src/pages/admin/BookingManagement.jsx", 235, 275),
    ("src/pages/admin/BookingManagement.jsx", 645, 705),
    ("src/pages/admin/BookingManagement.jsx", 850, 905),
    ("src/pages/admin/TourManagement.jsx", 45, 85),
    ("src/pages/tourManager/EditTour.jsx", 55, 155),
    ("src/pages/tourManager/EditTour.jsx", 180, 345),
    ("src/pages/tourManager/EditTour.jsx", 385, 420),
    ("src/pages/tourManager/TourManagerTours.jsx", 105, 140),
    ("src/pages/tourManager/Vehicles.jsx", 65, 90),
]

output = []

for relative, start, end in targets:
    path = ROOT / relative

    output.append("\n" + "=" * 90)
    output.append(f"FILE: {relative}")
    output.append(f"LINES: {start}-{end}")
    output.append("=" * 90)

    if not path.exists():
        output.append("FILE NOT FOUND")
        continue

    lines = path.read_text(encoding="utf-8").splitlines()

    actual_end = min(end, len(lines))

    for number in range(start, actual_end + 1):
        output.append(f"{number:4}: {lines[number - 1]}")

report = "\n".join(output)

Path("lint-context.txt").write_text(
    report,
    encoding="utf-8",
)

print(report)
print()
print("=" * 90)
print(f"Saved complete report to: {ROOT / 'lint-context.txt'}")
print("=" * 90)
