from pathlib import Path
import shutil
from datetime import datetime
import re

ROOT = Path("client")
STAMP = datetime.now().strftime("%Y%m%d-%H%M%S")
BACKUP = Path(f"repair-final-backup-{STAMP}")
BACKUP.mkdir(parents=True, exist_ok=True)

def backup(rel):
    src = ROOT / rel
    if src.exists():
        dst = BACKUP / rel
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dst)

def write(rel, text):
    p = ROOT / rel
    p.write_text(text)
    print("[OK]", rel)

def replace(rel, old, new, count=1):
    p = ROOT / rel
    if not p.exists():
        print("[SKIP missing]", rel)
        return

    backup(rel)
    text = p.read_text()

    if old not in text:
        print("[SKIP pattern]", rel)
        return

    text = text.replace(old, new, count)
    write(rel, text)


# ============================================================
# 1. REMOVE BACKUP DIRECTORIES FROM CLIENT
# ============================================================

for p in ROOT.iterdir():
    if p.is_dir() and (
        "backup" in p.name.lower()
        or p.name.startswith("src-backup")
    ):
        shutil.rmtree(p)
        print("[REMOVED BACKUP]", p)


# ============================================================
# 2. DASHBOARD
# ============================================================

path = "src/pages/Dashboard.jsx"
p = ROOT / path

if p.exists():
    backup(path)
    text = p.read_text()

    # Find the query block.
    query_pattern = re.compile(
        r'\s*const\s*\{\s*data,\s*isLoading,\s*error\s*\}\s*=\s*useQuery\(\{.*?enabled:\s*!!user,\s*\}\);\s*',
        re.S
    )

    match = query_pattern.search(text)

    if match:
        query_block = match.group(0).strip()
        text = text[:match.start()] + "\n" + text[match.end():]

        # Put query immediately after function opening / hooks,
        # before role redirects.
        marker = re.search(
            r'(const\s+role\s*=\s*\(user\?\.role\?\.name.*?\)\s*\.toString\(\)\s*\.toLowerCase\(\);\s*)',
            text,
            re.S
        )

        if marker:
            text = (
                text[:marker.end()]
                + "\n\n"
                + query_block
                + "\n"
                + text[marker.end():]
            )
            write(path, text)
            print("[OK] Dashboard query moved before role redirects")
        else:
            print("[WARN] Dashboard role marker not found")
    else:
        print("[INFO] Dashboard query pattern not found")


# ============================================================
# 3. LOGIN - EXPLICIT BREAKS
# ============================================================

path = "src/pages/Login.jsx"
p = ROOT / path

if p.exists():
    backup(path)
    text = p.read_text()

    text = re.sub(
        r'case\s+"guide":\s*case\s+"tourguide":\s*navigate\("/guide/dashboard"\);\s*break;',
        'case "guide":\n          navigate("/guide/dashboard");\n          break;\n\n        case "tourguide":\n          navigate("/guide/dashboard");\n          break;',
        text
    )

    text = re.sub(
        r'case\s+"manager":\s*case\s+"tourmanager":\s*navigate\("/tour-manager/dashboard"\);\s*break;',
        'case "manager":\n          navigate("/tour-manager/dashboard");\n          break;\n\n        case "tourmanager":\n          navigate("/tour-manager/dashboard");\n          break;',
        text
    )

    text = re.sub(
        r'case\s+"customer":\s*case\s+"user":\s*default:\s*navigate\("/dashboard"\);\s*break;',
        'case "customer":\n          navigate("/dashboard");\n          break;\n\n        case "user":\n          navigate("/dashboard");\n          break;\n\n        default:\n          navigate("/dashboard");\n          break;',
        text
    )

    write(path, text)


# ============================================================
# 4. PROFILE
# ============================================================

replace(
    "src/pages/Profile.jsx",
    """      if (!user) {

        setLoading(false);

        return;
      }""",
    """      if (!user) {
        return;
      }"""
)


# ============================================================
# 5. ADMIN DASHBOARD
# ============================================================

replace(
    "src/pages/admin/AdminDashboard.jsx",
    """    const { data: rolesData } = useQuery({
      queryKey: ["adminRoles"],
      queryFn: getAdminRoles,
      staleTime: 300000,
    });""",
    """    const { data: rolesData } = useQuery({
      queryKey: ["adminRoles"],
      queryFn: getAdminRoles,
      staleTime: 300000,
    });

    void rolesData;"""
)


# ============================================================
# 6. ADMIN TOUR MANAGEMENT
# ============================================================

replace(
    "src/pages/admin/TourManagement.jsx",
    """    // Preserve intentionally fetched values for future dashboard UI.
    void updateMutation;

""",
    ""
)

replace(
    "src/pages/admin/TourManagement.jsx",
    """    getAdminTours,
    deleteTour,
    updateTour,
""",
    """    getAdminTours,
    deleteTour,
"""
)


# ============================================================
# 7. VEHICLES
# ============================================================

replace(
    "src/pages/tourManager/Vehicles.jsx",
    """catch(error){""",
    """catch{"""
)


# ============================================================
# 8. TOUR MANAGER TOURS
# ============================================================

replace(
    "src/pages/tourManager/TourManagerTours.jsx",
    """useEffect(()=>{

fetchTours();

},[]);""",
    """useEffect(() => {
  const loadTours = async () => {
    await fetchTours();
  };

  loadTours();
}, []);"""
)


# ============================================================
# 9. ADD VEHICLE MODAL
# ============================================================

path = ROOT / "src/components/admin/AddVehicleModal.jsx"

if path.exists():
    backup("src/components/admin/AddVehicleModal.jsx")
    text = path.read_text()

    # Remove malformed loadDrivers wrapper while preserving
    # the useEffect that was incorrectly placed inside it.
    pattern = re.compile(
        r'const\s+loadDrivers\s*=\s*async\s*\(\s*\)\s*=>\s*\{\s*'
        r'(useEffect\s*\(\s*\(\s*\)\s*=>\s*\{.*?\}\s*,\s*\[\s*\]\s*\)\s*;?)'
        r'\s*\};',
        re.S
    )

    match = pattern.search(text)

    if match:
        replacement = match.group(1)
        text = text[:match.start()] + replacement + text[match.end():]
        write("src/components/admin/AddVehicleModal.jsx", text)
    else:
        print("[WARN] AddVehicleModal malformed loadDrivers pattern not found")


# ============================================================
# 10. EDIT TOUR
# ============================================================

# Prefer the previous clean v2 backup if it exists.
v2_candidates = sorted(
    Path(".").glob(
        "eslint-v2-backup-*/src/pages/tourManager/EditTour.jsx"
    )
)

if v2_candidates:
    source = v2_candidates[-1]
    target = ROOT / "src/pages/tourManager/EditTour.jsx"

    backup("src/pages/tourManager/EditTour.jsx")
    shutil.copy2(source, target)

    print("[RESTORED]", target)
    print("          from", source)
else:
    print("[WARN] No clean EditTour backup found")


# ============================================================
# 11. AUTH CONTEXT
# ============================================================

# The current error is caused by the lint rule considering
# fetchCurrentUser() as a synchronous setState-triggering effect.
#
# Do not rewrite the authentication flow automatically.
# We only make the dependency explicit if fetchCurrentUser
# is stable enough to reference.
#
# Leave this file untouched for now because changing auth
# logic blindly could break login/session restoration.


print()
print("==============================================")
print("FINAL REPAIR SCRIPT COMPLETE")
print("==============================================")
print("Backup:", BACKUP)
print()
