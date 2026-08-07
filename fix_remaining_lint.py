from pathlib import Path
import re
import shutil
from datetime import datetime

ROOT = Path("client")
STAMP = datetime.now().strftime("%Y%m%d-%H%M%S")
BACKUP = Path(f"final-lint-backup-{STAMP}")
BACKUP.mkdir(parents=True, exist_ok=True)

def backup(rel):
    src = ROOT / rel
    if src.exists():
        dst = BACKUP / rel
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dst)

def save(rel, text):
    backup(rel)
    (ROOT / rel).write_text(text)
    print("[OK]", rel)

# ============================================================
# ADD VEHICLE MODAL
# ============================================================

rel = "src/components/admin/AddVehicleModal.jsx"
p = ROOT / rel
text = p.read_text()

# Remove the unnecessary loadDrivers wrapper around useEffect.
patterns = [
    re.compile(
        r'const\s+loadDrivers\s*=\s*(?:async\s*)?\(\s*\)\s*=>\s*\{\s*'
        r'(useEffect\s*\(\s*\(\s*\)\s*=>\s*\{.*?\}\s*,\s*\[\s*\]\s*\)\s*;?)'
        r'\s*\};',
        re.S
    ),
    re.compile(
        r'const\s+loadDrivers\s*=\s*async\s*\(\s*\)\s*=>\s*\{\s*'
        r'(useEffect\s*\(.*?\)\s*;?)'
        r'\s*\};',
        re.S
    )
]

changed = False

for pattern in patterns:
    match = pattern.search(text)
    if match:
        text = text[:match.start()] + match.group(1) + text[match.end():]
        changed = True
        break

if changed:
    save(rel, text)
else:
    print("[WARN] Could not automatically unwrap loadDrivers")

# ============================================================
# ADMIN DASHBOARD
# ============================================================

rel = "src/pages/admin/AdminDashboard.jsx"
p = ROOT / rel

if p.exists():
    text = p.read_text()

    if "const { data: rolesData } = useQuery" in text and "void rolesData;" not in text:
        text = text.replace(
            '    });\n',
            '    });\n\n    void rolesData;\n',
            1
        )
        save(rel, text)

# ============================================================
# ADMIN TOUR MANAGEMENT
# ============================================================

rel = "src/pages/admin/TourManagement.jsx"
p = ROOT / rel

if p.exists():
    text = p.read_text()

    # Remove unused updateTour import.
    text = re.sub(
        r',\s*updateTour\s*(?=,|\n|})',
        '',
        text
    )

    # Remove broken undefined updateMutation statement.
    text = re.sub(
        r'^\s*void\s+updateMutation\s*;\s*$',
        '',
        text,
        flags=re.M
    )

    text = re.sub(
        r'^\s*updateMutation\s*;\s*$',
        '',
        text,
        flags=re.M
    )

    save(rel, text)

# ============================================================
# VEHICLES
# ============================================================

rel = "src/pages/tourManager/Vehicles.jsx"
p = ROOT / rel

if p.exists():
    text = p.read_text()

    text = text.replace(
        'catch(error){',
        'catch {'
    )

    text = text.replace(
        'catch (error) {',
        'catch {'
    )

    save(rel, text)

# ============================================================
# TOUR MANAGER TOURS
# ============================================================

rel = "src/pages/tourManager/TourManagerTours.jsx"
p = ROOT / rel

if p.exists():
    text = p.read_text()

    # Replace the direct fetchTours() effect with an async wrapper.
    old = re.compile(
        r'useEffect\s*\(\s*\(\s*\)\s*=>\s*\{\s*'
        r'fetchTours\(\);\s*'
        r'\}\s*,\s*\[\s*\]\s*\)\s*;?',
        re.S
    )

    new = '''useEffect(() => {
    const loadTours = async () => {
      await fetchTours();
    };

    loadTours();
  }, []);'''

    if old.search(text):
        text = old.sub(new, text, count=1)
        save(rel, text)
    else:
        print("[INFO] TourManagerTours effect pattern not found")

print()
print("======================================")
print("FINAL LINT REPAIR FINISHED")
print("Backup:", BACKUP)
print("======================================")
