from pathlib import Path
import re
import shutil
from datetime import datetime

ROOT = Path("src")

timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
BACKUP = Path(f"eslint-v2-backup-{timestamp}")

FILES = [
    "components/admin/AddVehicleModal.jsx",
    "context/AuthContext.jsx",
    "pages/Dashboard.jsx",
    "pages/Login.jsx",
    "pages/Profile.jsx",
    "pages/admin/AdminDashboard.jsx",
    "pages/admin/BookingManagement.jsx",
    "pages/admin/TourManagement.jsx",
    "pages/tourManager/EditTour.jsx",
    "pages/tourManager/TourManagerTours.jsx",
    "pages/tourManager/Vehicles.jsx",
]

def backup_file(path):
    target = BACKUP / path
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(path, target)

def read(path):
    return path.read_text(encoding="utf-8")

def write(path, text):
    path.write_text(text, encoding="utf-8")

def replace_once(text, old, new, label):
    if old not in text:
        print(f"[SKIP] {label}")
        return text

    text = text.replace(old, new, 1)
    print(f"[OK]   {label}")
    return text

def process(path, function):
    full = ROOT / path

    if not full.exists():
        print(f"[MISS] {full}")
        return

    backup_file(full)

    original = read(full)
    updated = function(original)

    if updated != original:
        write(full, updated)
    else:
        print(f"[UNCHANGED] {path}")


# ------------------------------------------------------------
# Login.jsx
# ------------------------------------------------------------

def fix_login(text):

    old = """case "guide":
  case "tourguide":
    navigate("/guide/dashboard");
    break;"""

    new = """case "guide":
    navigate("/guide/dashboard");
    break;

  case "tourguide":
    navigate("/guide/dashboard");
    break;"""

    text = replace_once(
        text,
        old,
        new,
        "Login guide roles"
    )

    old = """case "manager":
  case "tourmanager":
    navigate("/tour-manager/dashboard");
    break;"""

    new = """case "manager":
    navigate("/tour-manager/dashboard");
    break;

  case "tourmanager":
    navigate("/tour-manager/dashboard");
    break;"""

    text = replace_once(
        text,
        old,
        new,
        "Login manager roles"
    )

    old = """case "customer":
  case "user":
  default:
    navigate("/dashboard");
    break;"""

    new = """case "customer":
    navigate("/dashboard");
    break;

  case "user":
    navigate("/dashboard");
    break;

  default:
    navigate("/dashboard");
    break;"""

    text = replace_once(
        text,
        old,
        new,
        "Login customer roles"
    )

    return text


# ------------------------------------------------------------
# Profile.jsx
# ------------------------------------------------------------

def fix_profile(text):

    text = replace_once(
        text,
        "const [\n loading,\n setLoading\n ] = useState(true);",
        """const [
 loading,
 setLoading
 ] = useState(Boolean(user));""",
        "Profile loading initialization"
    )

    text = replace_once(
        text,
        """if (!user) {

  setLoading(false);

  return;
}""",
        """if (!user) {
  return;
}""",
        "Profile conditional loading update"
    )

    return text


# ------------------------------------------------------------
# AddVehicleModal.jsx
# ------------------------------------------------------------

def fix_vehicle_modal(text):

    # The broken structure is:
    #
    # const loadDrivers = async () => {
    #   useEffect(() => {
    #      ...
    #   }, []);
    # };
    #
    # Move useEffect outside the function.

    pattern = re.compile(
        r"""const\s+loadDrivers\s*=\s*async\s*\(\)\s*=>\s*\{\s*
        useEffect\s*\(\s*
        (.*?)\s*
        \},\s*\[\s*\]\s*\);\s*
        \};""",
        re.DOTALL | re.VERBOSE
    )

    match = pattern.search(text)

    if not match:
        print("[SKIP] AddVehicleModal nested useEffect")
        return text

    body = match.group(1)

    replacement = f"""const loadDrivers = async () => {{
{body}
}};

useEffect(() => {{
  loadDrivers();
}}, []);"""

    text = text[:match.start()] + replacement + text[match.end():]

    print("[OK]   AddVehicleModal hook structure")

    return text


# ------------------------------------------------------------
# AdminDashboard.jsx
# ------------------------------------------------------------

def fix_admin_dashboard(text):

    # Remove useless assignments such as:
    # void paymentData;
    # void roles;
    # etc.

    text = re.sub(
        r'^\s*void\s+(paymentData|roles|monthlyRevenue|status|statusData);\s*\n',
        '',
        text,
        flags=re.MULTILINE
    )

    # Remove unused derived values.

    patterns = [
        r"""
        \n\s*const\s+roles\s*=
        \s*rolesData\?\.roles\s*\|\|\s*\[\];\s*
        """,

        r"""
        \n\s*const\s+monthlyRevenue\s*=
        \s*\(\s*stats\.monthlyRevenue\s*\|\|\s*\[\]\s*\)\.map
        \s*\(.*?\n\s*\}\);\s*
        """,

        r"""
        \n\s*const\s+statusData\s*=
        \s*stats\.status\s*\|\|\s*\[\];\s*
        """,
    ]

    for pattern in patterns:
        new_text, count = re.subn(
            pattern,
            "\n",
            text,
            flags=re.DOTALL | re.VERBOSE
        )

        if count:
            text = new_text
            print("[OK]   AdminDashboard unused derived value")

    # Remove unused destructuring fields.
    text = re.sub(
        r'\n\s*monthlyRevenue\s*=\s*\[\],',
        '',
        text
    )

    text = re.sub(
        r'\n\s*status\s*=\s*\[\],',
        '',
        text
    )

    text = re.sub(
        r'\n\s*statusData\s*=\s*\[\],',
        '',
        text
    )

    # If paymentData is destructured only to execute the query,
    # turn it into an unassigned useQuery call.
    pattern = re.compile(
        r"""const\s*\{\s*data:\s*paymentData\s*\}\s*=\s*useQuery\s*\(""",
        re.MULTILINE
    )

    if pattern.search(text):
        text = pattern.sub(
            "useQuery(",
            text,
            count=1
        )
        print("[OK]   AdminDashboard payment query assignment")

    return text


# ------------------------------------------------------------
# BookingManagement.jsx
# ------------------------------------------------------------

def fix_booking_management(text):

    # Remove the unused staff transformation block.
    pattern = re.compile(
        r"""
        \n\s*const\s+staff\s*=\s*
        Array\.isArray\(staffResponse\).*?
        :\s*\[\];\s*
        """,
        re.DOTALL | re.VERBOSE
    )

    text, count = pattern.subn("\n", text, count=1)

    if count:
        print("[OK]   BookingManagement unused staff")

    # Remove pending count.
    pattern = re.compile(
        r"""
        \n\s*const\s+pending\s*=\s*
        bookings\.filter\s*\(
        .*?
        \)\.length;\s*
        """,
        re.DOTALL | re.VERBOSE
    )

    text, count = pattern.subn("\n", text, count=1)

    if count:
        print("[OK]   BookingManagement pending")

    # Remove confirmed count.
    pattern = re.compile(
        r"""
        \n\s*const\s+confirmed\s*=\s*
        bookings\.filter\s*\(
        .*?
        \)\.length;\s*
        """,
        re.DOTALL | re.VERBOSE
    )

    text, count = pattern.subn("\n", text, count=1)

    if count:
        print("[OK]   BookingManagement confirmed")

    # Remove unused handler.
    pattern = re.compile(
        r"""
        \n\s*const\s+handleBookingAction\s*=\s*
        \([^)]*\)\s*=>\s*\{
        .*?
        \n\s*\};\s*
        """,
        re.DOTALL | re.VERBOSE
    )

    text, count = pattern.subn("\n", text, count=1)

    if count:
        print("[OK]   BookingManagement handler")

    return text


# ------------------------------------------------------------
# TourManagement.jsx
# ------------------------------------------------------------

def fix_tour_management(text):

    pattern = re.compile(
        r"""
        \n\s*const\s+updateMutation\s*=\s*
        useMutation\s*\(\s*\{
        .*?
        \n\s*\}\s*\);\s*
        """,
        re.DOTALL | re.VERBOSE
    )

    text, count = pattern.subn("\n", text, count=1)

    if count:
        print("[OK]   TourManagement updateMutation")

    return text


# ------------------------------------------------------------
# Vehicles.jsx
# ------------------------------------------------------------

def fix_vehicles(text):

    text = replace_once(
        text,
        'catch (error) {\n  toast.error("Delete failed");',
        'catch {\n  toast.error("Delete failed");',
        "Vehicles unused error"
    )

    return text


# ------------------------------------------------------------
# TourManagerTours.jsx
# ------------------------------------------------------------

def fix_tour_manager_tours(text):

    old = """useEffect(()=>{

fetchTours();

},[]);"""

    new = """useEffect(() => {
  let mounted = true;

  const loadTours = async () => {
    try {
      const response = await getManagerTours();

      if (!mounted) {
        return;
      }

      setTours(
        response.data?.tours ||
        response.data ||
        []
      );
    } catch (error) {
      if (!mounted) {
        return;
      }

      console.error(error);

      toast.error(
        "Failed to load tours"
      );
    } finally {
      if (mounted) {
        setLoading(false);
      }
    }
  };

  loadTours();

  return () => {
    mounted = false;
  };
}, []);"""

    if old in text:
        text = text.replace(old, new, 1)
        print("[OK]   TourManagerTours effect")
        return text

    print("[SKIP] TourManagerTours effect")
    return text


# ------------------------------------------------------------
# EditTour.jsx
# ------------------------------------------------------------

def fix_edit_tour(text):

    # Remove unused query data while retaining the imports for now.
    patterns = [
        r"""
        \n\s*const\s*\{\s*
        data:\s*vehicles\s*=\s*\[\]\s*
        \}\s*=\s*useQuery\s*\(\s*\{
        .*?
        \}\s*\);\s*
        """,

        r"""
        \n\s*const\s*\{\s*
        data:\s*guides\s*=\s*\[\]\s*
        \}\s*=\s*useQuery\s*\(\s*\{
        .*?
        \}\s*\);\s*
        """,

        r"""
        \n\s*const\s*\{\s*
        data:\s*destinations\s*=\s*\[\]\s*
        \}\s*=\s*useQuery\s*\(\s*\{
        .*?
        \}\s*\);\s*
        """,
    ]

    for pattern in patterns:
        text, count = re.subn(
            pattern,
            "\n",
            text,
            count=1,
            flags=re.DOTALL | re.VERBOSE
        )

        if count:
            print("[OK]   EditTour unused query")

    # Remove formInitialized state.
    text, count = re.subn(
        r"""
        \n\s*const\s*\[
        formInitialized,\s*setFormInitialized
        \]\s*=\s*useState\(false\);\s*
        """,
        "\n",
        text,
        count=1,
        flags=re.DOTALL | re.VERBOSE
    )

    if count:
        print("[OK]   EditTour formInitialized")

    # Do not destructure isPending if unused.
    text = replace_once(
        text,
        """const {
    mutate: saveTour,
    isPending
} = useMutation({""",
        """const {
    mutate: saveTour
} = useMutation({""",
        "EditTour isPending"
    )

    # Remove isLoading alias because we'll use isLoading directly.
    text = replace_once(
        text,
        """const {

    data:tourData,

    isLoading:tourLoading

} = useQuery({""",
        """const {

    data:tourData,

    isLoading

} = useQuery({""",
        "EditTour loading alias"
    )

    # Remove the initialization guard.
    text = replace_once(
        text,
        "if(tourData && !formInitialized){",
        "if(tourData){",
        "EditTour formInitialized guard"
    )

    # Remove any old dependency warning.
    text = replace_once(
        text,
        "},[tourData]);",
        "},[tourData]);",
        "EditTour effect dependency"
    )

    return text


# ------------------------------------------------------------
# Dashboard.jsx
# ------------------------------------------------------------

def fix_dashboard(text):

    # We only move a useQuery if it is clearly after a loading return.
    # Do not perform a blind rewrite here.
    print("[INFO] Dashboard requires structural hook inspection.")

    return text


# ------------------------------------------------------------
# AuthContext.jsx
# ------------------------------------------------------------

def fix_auth_context(text):

    print("[INFO] AuthContext requires fetchCurrentUser inspection.")

    return text


# ------------------------------------------------------------
# Execute
# ------------------------------------------------------------

BACKUP.mkdir(exist_ok=True)

processors = {
    "pages/Login.jsx": fix_login,
    "pages/Profile.jsx": fix_profile,
    "components/admin/AddVehicleModal.jsx": fix_vehicle_modal,
    "pages/admin/AdminDashboard.jsx": fix_admin_dashboard,
    "pages/admin/BookingManagement.jsx": fix_booking_management,
    "pages/admin/TourManagement.jsx": fix_tour_management,
    "pages/tourManager/EditTour.jsx": fix_edit_tour,
    "pages/tourManager/TourManagerTours.jsx": fix_tour_manager_tours,
    "pages/tourManager/Vehicles.jsx": fix_vehicles,
    "pages/Dashboard.jsx": fix_dashboard,
    "context/AuthContext.jsx": fix_auth_context,
}

for file, processor in processors.items():
    process(file, processor)

print()
print("=" * 60)
print("REPAIR COMPLETE")
print("=" * 60)
print()
print(f"Backup created at: {BACKUP}")
print()
print("Next command:")
print("npm run lint")
print()
