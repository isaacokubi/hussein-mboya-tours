from pathlib import Path

file = Path("client/src/pages/admin/AdminDashboard.jsx")

if not file.exists():
    print("❌ AdminDashboard.jsx not found")
    exit()

text = file.read_text()

replacements = {
    "paymentStats.paid": "paymentStats.completed",
    "paymentStats?.paid": "paymentStats?.completed",
    "stats.paymentStats.paid": "stats.paymentStats.completed",
    "stats?.paymentStats?.paid": "stats?.paymentStats?.completed",
    ".paidPayments": ".completed",
}

changed = False

for old, new in replacements.items():
    if old in text:
        text = text.replace(old, new)
        print(f"✅ Changed {old} → {new}")
        changed = True

file.write_text(text)

if changed:
    print("\n🎉 Frontend payment card fixed")
else:
    print("\n⚠️ No matching payment field found")
