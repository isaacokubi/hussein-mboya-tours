from pathlib import Path

file = Path("client/src/pages/admin/AdminDashboard.jsx")

text = file.read_text()

old = """const {
    data: stats,
    isLoading
} = useQuery"""

new = """const {
    data: response,
    isLoading
} = useQuery"""

if old in text:
    text = text.replace(old,new)

    marker = "const paymentStats ="

    if marker in text and "const stats =" not in text:
        text = text.replace(
            marker,
            """const stats = response?.data || response || {};

const paymentStats ="""
        )

    file.write_text(text)
    print("✅ Dashboard response normalization fixed")

else:
    print("⚠️ Pattern not found, inspect file manually")
