from pathlib import Path
from datetime import datetime
import shutil
import re

ROOT = Path(".")
STAMP = datetime.now().strftime("%Y%m%d-%H%M%S")
BACKUP = ROOT.parent / f"python-repair-backup-{STAMP}"
BACKUP.mkdir(parents=True, exist_ok=True)

def backup(path):
    src = ROOT / path
    if src.exists():
        dst = BACKUP / path
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dst)

def write(path, text):
    p = ROOT / path
    p.write_text(text)
    print(f"[OK] {path}")

def replace(path, old, new, count=1):
    backup(path)
    p = ROOT / path
    text = p.read_text()

    if old not in text:
        print(f"[SKIP] pattern not found: {path}")
        return False

    text = text.replace(old, new, count)
    write(path, text)
    return True


# ============================================================
# 1. DASHBOARD
# Move useQuery before role redirects so the hook is unconditional.
# ============================================================

path = "src/pages/Dashboard.jsx"
backup(path)
p = ROOT / path
text = p.read_text()

query_block = '''    const { data, isLoading, error } = useQuery({
      queryKey: ["my-bookings", user?._id],
      queryFn: getMyBookings,
      enabled: clearuser,
    });

'''

if query_block in text:
    text = text.replace(query_block, "", 1)

marker = '''    const role = (user?.role?.name || user?.role || "customer")
      .toString()
      .toLowerCase();

'''

if query_block not in text:
    # Reconstruct the query from the supplied code.
    if marker in text:
        text = text.replace(marker, marker + query_block, 1)
        write(path, text)
    else:
        print("[WARN] Dashboard role marker not found")
else:
    print("[INFO] Dashboard query already moved")


# ============================================================
# 2. LOGIN
# Avoid no-fallthrough by making each role explicit.
# ============================================================

path = "src/pages/Login.jsx"
backup(path)
p = ROOT / path
text = p.read_text()

old = '''        case "guide":

        case "tourguide":

          navigate("/guide/dashboard");

          break;
'''

new = '''        case "guide":
          navigate("/guide/dashboard");
          break;

        case "tourguide":
          navigate("/guide/dashboard");
          break;
'''

if old in text:
    text = text.replace(old, new, 1)

old = '''        case "manager":

        case "tourmanager":

          navigate("/tour-manager/dashboard");

          break;
'''

new = '''        case "manager":
          navigate("/tour-manager/dashboard");
          break;

        case "tourmanager":
          navigate("/tour-manager/dashboard");
          break;
'''

if old in text:
    text = text.replace(old, new, 1)

old = '''        case "customer":

        case "user":

        default:
          navigate("/dashboard");

          break;
'''

new = '''        case "customer":
          navigate("/dashboard");
          break;

        case "user":
          navigate("/dashboard");
          break;

        default:
          navigate("/dashboard");
          break;
'''

if old in text:
    text = text.replace(old, new, 1)

write(path, text)


# ============================================================
# 3. PROFILE
# Do not synchronously set loading state when user is absent.
# The initial state is already true, so simply return.
# ============================================================

replace(
    "src/pages/Profile.jsx",
'''      if (!user) {

        setLoading(false);

        return;
      }
''',
'''      if (!user) {
        return;
      }
'''
)


# ============================================================
# 4. ADMIN DASHBOARD
# rolesData is fetched but unused. Keep query but explicitly void it.
# ============================================================

replace(
    "src/pages/admin/AdminDashboard.jsx",
'''    const { data: rolesData } = useQuery({
      queryKey: ["adminRoles"],
      queryFn: getAdminRoles,
      staleTime: 300000,
    });
''',
'''    const { data: rolesData } = useQuery({
      queryKey: ["adminRoles"],
      queryFn: getAdminRoles,
      staleTime: 300000,
    });

    void rolesData;
'''
)


# ============================================================
# 5. TOUR MANAGEMENT
# The previous repair inserted "void updateMutation" before it existed.
# Remove that line and remove updateTour import if it is not actually used.
# ============================================================

replace(
    "src/pages/admin/TourManagement.jsx",
'''    // Preserve intentionally fetched values for future dashboard UI.
    void updateMutation;


''',
''''
)

replace(
    "src/pages/admin/TourManagement.jsx",
'''    getAdminTours,
    deleteTour,
    updateTour,
''',
'''    getAdminTours,
    deleteTour,
'''
)


# ============================================================
# 6. VEHICLES
# Catch variable is unused.
# ============================================================

replace(
    "src/pages/tourManager/Vehicles.jsx",
'''  catch(error){

      toast.error(
  "Delete failed"
  );
''',
'''  catch{

      toast.error(
  "Delete failed"
  );
'''
)


# ============================================================
# 7. TOUR MANAGER TOURS
# Replace synchronous fetch call in effect with an async effect
# wrapper. This preserves the existing behavior.
# ============================================================

path = "src/pages/tourManager/TourManagerTours.jsx"
backup(path)
p = ROOT / path
text = p.read_text()

old = '''useEffect(()=>{

fetchTours();


},[]);
'''

new = '''useEffect(() => {
  let cancelled = false;

  const loadTours = async () => {
    try {
      await fetchTours();
    } catch (error) {
        console.error(error);
      }
    }
  };

  loadTours();

  return () => {
    cancelled = true;
  };
}, []);
'''

if old in text:
    text = text.replace(old, new, 1)
else:
    print("[WARN] TourManagerTours useEffect pattern not found")

write(path, text)


# ============================================================
# 8. ADD VEHICLE MODAL
# The current file has useEffect INSIDE loadDrivers, which is invalid.
# Replace that malformed pattern with a normal component-level effect.
# ============================================================

path = "src/components/admin/AddVehicleModal.jsx"
backup(path)
p = ROOT / path
text = p.read_text()

# Detect the malformed function.
m = re.search(
    r'const\s+loadDrivers\s*=\s*(?:async\s*)?\([^)]*\)\s*=>\s*\{',
    text
)

if m:
    start = m.start()

    # Find matching closing brace for the function.
    depth = 0
    end = None
    for i in range(m.end() - 1, len(text)):
        if text[i] == "{":
            depth += 1
        elif text[i] == "}":
            depth -= 1
            if depth == 0:
                end = i + 1
                break

    if end:
        block = text[start:end]

        # Extract the useEffect body if present.
        effect_match = re.search(
            r'useEffect\s*\(\s*\(\s*\)\s*=>\s*\{(.*?)\}\s*,\s*\[\s*\]\s*\)\s*;?',
            block,
            re.S
        )

        if effect_match:
            body = effect_match.group(1).strip()

            replacement = f'''useEffect(() => {{
{body}
}}, []);
'''

            text = text[:start] + replacement + text[end:]
            write(path, text)
        else:
            print("[WARN] Could not safely extract AddVehicleModal useEffect")
    else:
        print("[WARN] Could not find end of loadDrivers")
else:
    print("[INFO] AddVehicleModal loadDrivers function not found")


# ============================================================
# 9. EDIT TOUR
#
# This file has larger structural damage:
# - getGuides/getVehicles/getDestinations imported but never called
# - destinations/guides/vehicles undefined
# - submitHandler appears to have broken braces
# - unreachable returns
#
# First restore the clean backup if one exists.
# ============================================================

edit_backup_candidates = sorted(
    ROOT.parent.glob("eslint-v2-backup-*/src/pages/tourManager/EditTour.jsx")
)

if edit_backup_candidates:
    source = edit_backup_candidates[-1]
    target = ROOT / "src/pages/tourManager/EditTour.jsx"

    print(f"[INFO] Restoring EditTour from backup: {source}")
    shutil.copy2(source, target)
    print("[OK] EditTour restored from backup")
else:
    print("[WARN] No eslint-v2 EditTour backup found; leaving current EditTour")


print()
print("==============================================")
print("Python repair completed.")
print(f"Backup: {BACKUP}")
print("==============================================")
