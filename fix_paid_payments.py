from pathlib import Path
import re

root = Path(".")

# Files to update
controller = root / "server/controllers/adminDashboardController.js"
dashboard = root / "client/src/pages/admin/AdminDashboard.jsx"

# -----------------------------
# Fix backend aggregation
# -----------------------------

if controller.exists():
    text = controller.read_text()

    # Replace wrong field names
    text = text.replace(
        '$paymentStatus',
        '$status'
    )

    text = text.replace(
        'paymentStatus:"completed"',
        'status:"completed"'
    )

    text = text.replace(
        "paymentStatus: 'completed'",
        "status: 'completed'"
    )

    # Fix paid reference names
    text = text.replace(
        "payments.paid",
        "payments.completed"
    )

    controller.write_text(text)

    print("✅ Updated adminDashboardController.js")

else:
    print("❌ adminDashboardController.js not found")


# -----------------------------
# Fix frontend dashboard
# -----------------------------

if dashboard.exists():

    text = dashboard.read_text()

    # Replace old payment key
    text = text.replace(
        "paymentStats.paid",
        "paymentStats.completed"
    )

    text = text.replace(
        "paymentStats?.paid",
        "paymentStats?.completed"
    )

    dashboard.write_text(text)

    print("✅ Updated AdminDashboard.jsx")

else:
    print("❌ AdminDashboard.jsx not found")


print("\n🎉 Paid Payments fix completed")
print("Restart backend and refresh dashboard.")
