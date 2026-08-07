#!/usr/bin/env python3

from pathlib import Path
import re
import subprocess

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"


def run(cmd):
    print("\n$", " ".join(cmd))
    result = subprocess.run(
        cmd,
        cwd=ROOT,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
    )
    print(result.stdout)
    return result


def inspect_file(relative):
    path = SRC / relative

    print("\n" + "=" * 80)
    print(relative)
    print("=" * 80)

    if not path.exists():
        print("MISSING")
        return

    content = path.read_text(encoding="utf-8")
    lines = content.count("\n") + 1

    print("Lines:", lines)
    print("Bytes:", path.stat().st_size)

    if relative.endswith(".jsx"):
        print(
            "useEffect:",
            len(re.findall(r"useEffect\s*\(", content))
        )

        print(
            "useState:",
            len(re.findall(r"useState\s*\(", content))
        )

        print(
            "setState-like calls:",
            len(re.findall(r"\bset[A-Z]\w*\s*\(", content))
        )

    if "AdminFinance" in relative:
        print(
            "Standalone / lines:",
            len(re.findall(r"(?m)^\s*/\s*$", content))
        )

        print(
            "Standalone c lines:",
            len(re.findall(r"(?m)^\s*c\s*$", content))
        )


def main():
    print("FRONTEND POST-REPAIR DIAGNOSTIC")

    important = [
        "components/admin/AddVehicleModal.jsx",
        "components/PermissionGuard.jsx",
        "pages/Dashboard.jsx",
        "pages/Login.jsx",
        "pages/admin/AdminDashboard.jsx",
        "pages/admin/BookingManagement.jsx",
        "pages/admin/finance/AdminFinance.jsx",
        "pages/admin/TourManagement.jsx",
        "pages/tourManager/EditTour.jsx",
        "pages/tourManager/TourManagerTours.jsx",
    ]

    for file in important:
        inspect_file(file)

    print("\n" + "=" * 80)
    print("REQUEST REFUND SEARCH")
    print("=" * 80)

    matches = list(SRC.rglob("*.js")) + list(SRC.rglob("*.jsx"))

    for path in matches:
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue

        if "requestRefund" in text:
            print(path.relative_to(ROOT))

            for i, line in enumerate(text.splitlines(), 1):
                if "requestRefund" in line:
                    print(f"  {i}: {line.strip()}")

    print("\n" + "=" * 80)
    print("ESLINT")
    print("=" * 80)

    run(["npm", "run", "lint"])

    print("\n" + "=" * 80)
    print("BUILD")
    print("=" * 80)

    run(["npm", "run", "build"])


if __name__ == "__main__":
    main()
