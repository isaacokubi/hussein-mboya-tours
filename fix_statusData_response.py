from pathlib import Path

file = Path("server/controllers/adminDashboardController.js")

text = file.read_text()

old = """                  bookingStatus,"""

new = """                  statusData: bookingStatus,"""

if old in text:
    text = text.replace(old, new)
    file.write_text(text)
    print("✅ statusData response mapping fixed")
else:
    print("⚠️ bookingStatus response line not found")
