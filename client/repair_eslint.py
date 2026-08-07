from pathlib import Path
import re
import shutil
from datetime import datetime

ROOT = Path(".")
SRC = ROOT / "src"

BACKUP = ROOT / f"eslint-repair-backup-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
BACKUP.mkdir(parents=True, exist_ok=True)

FILES = [
    "pages/Profile.jsx",
    "pages/tourManager/EditTour.jsx",
    "pages/tourManager/TourManagerTours.jsx",
    "pages/Login.jsx",
    "pages/Dashboard.jsx",
    "pages/AdminDashboard.jsx",
    "pages/Vehicles.jsx",
    "pages/BookingManagement.jsx",
    "pages/TourManagement.jsx",
    "components/admin/AddVehicleModal.jsx",
    "context/AuthContext.jsx",
]


def path(rel):
    return SRC / rel


def backup_file(p):
    if p.exists():
        target = BACKUP / p.relative_to(SRC)
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(p, target)


def read(p):
    return p.read_text(encoding="utf-8")


def write(p, text):
    p.write_text(text, encoding="utf-8")


def replace_once(text, old, new, label):
    if old not in text:
        print(f"  [SKIP] {label}")
        return text

    text = text.replace(old, new, 1)
    print(f"  [OK]   {label}")
    return text


def remove_once(text, block, label):
    if block not in text:
        print(f"  [SKIP] {label}")
        return text

    text = text.replace(block, "", 1)
    print(f"  [OK]   {label}")
    return text


# ---------------------------------------------------------
# Profile.jsx
# ---------------------------------------------------------

p = path("pages/Profile.jsx")

if p.exists():
    backup_file(p)
    text = read(p)

    text = replace_once(
        text,
        "const [\n loading,\n setLoading\n ] = useState(true);",
        "const [\n loading,\n setLoading\n ] = useState(Boolean(user));",
        "Profile loading initialization",
    )

    text = replace_once(
        text,
        """// Wait until authentication is ready
if (!user) {

  setLoading(false);

  return;

}""",
        """// Wait until authentication is ready
if (!user) {
  return;
}""",
        "Profile conditional loading update",
    )

    write(p, text)


# ---------------------------------------------------------
# EditTour.jsx
# ---------------------------------------------------------

p = path("pages/tourManager/EditTour.jsx")

if p.exists():
    backup_file(p)
    text = read(p)

    text = remove_once(
        text,
        """const [formInitialized,setFormInitialized] = useState(false);""",
        "Remove unused formInitialized state",
    )

    text = replace_once(
        text,
        """useEffect(()=>{

    if(tourData && !formInitialized){

        console.log(
            "SETTING TOUR FORM:",
            tourData
        );""",
        """useEffect(()=>{

    if(!tourData){
        return;
    }

    console.log(
        "SETTING TOUR FORM:",
        tourData
    );""",
        "Fix EditTour form initialization",
    )

    text = replace_once(
        text,
        """},[tourData]);""",
        """},[tourData]);""",
        "EditTour effect dependency",
    )

    # Remove unreachable "Loading tour..." return when the exact
    # malformed pattern is present.
    text = replace_once(
        text,
        """return (

Loading tour...

);
 }""",
        """ }""",
        "Remove unreachable EditTour return",
    )

    # If isPending is not used, this changes it to a single mutation value.
    text = replace_once(
        text,
        """const {
    mutate: saveTour,
    isPending
} = useMutation({""",
        """const {
    mutate: saveTour
} = useMutation({""",
        "Remove unused EditTour isPending",
    )

    write(p, text)


# ---------------------------------------------------------
# TourManagerTours.jsx
# ---------------------------------------------------------

p = path("pages/tourManager/TourManagerTours.jsx")

if p.exists():
    backup_file(p)
    text = read(p)

    old = """useEffect(()=>{

fetchTours();

},[]);"""

    new = """useEffect(()=>{

let mounted = true;

const loadTours = async()=>{

try{

const response = await getManagerTours();

if(!mounted){
return;
}

setTours(
response.data?.tours ||
response.data ||
[]
);

}
catch(error){

if(!mounted){
return;
}

console.error(error);

toast.error(
"Failed to load tours"
);

}
finally{

if(mounted){
setLoading(false);
}

}

};

loadTours();

return ()=>{

mounted = false;

};

},[]);"""

    text = replace_once(
        text,
        old,
        new,
        "Fix TourManagerTours effect",
    )

    write(p, text)


# ---------------------------------------------------------
# Vehicles.jsx
# ---------------------------------------------------------

p = path("pages/Vehicles.jsx")

if p.exists():
    backup_file(p)
    text = read(p)

    text = replace_once(
        text,
        """catch(error){

toast.error(
"Delete failed"
);""",
        """catch{

toast.error(
"Delete failed"
);""",
        "Remove unused Vehicles catch error",
    )

    write(p, text)


# ---------------------------------------------------------
# AdminDashboard.jsx
# ---------------------------------------------------------

p = path("pages/admin/AdminDashboard.jsx")

if not p.exists():
    # Some projects use pages/AdminDashboard.jsx
    p = path("pages/AdminDashboard.jsx")

if p.exists():
    backup_file(p)
    text = read(p)

    block = """  // Preserve intentionally fetched values for future dashboard UI.
  void paymentData;
  void roles;
  void monthlyRevenue;
  void status;
  void statusData;


"""

    text = remove_once(
        text,
        block,
        "Remove invalid AdminDashboard void statements",
    )

    write(p, text)


# ---------------------------------------------------------
# Login.jsx
# ---------------------------------------------------------

p = path("pages/Login.jsx")

if p.exists():
    backup_file(p)
    text = read(p)

    # Normalize grouped role cases into explicit cases.
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
        "Make guide role cases explicit",
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
        "Make manager role cases explicit",
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
        "Make customer role cases explicit",
    )

    write(p, text)


print()
print("=" * 70)
print("ESLint targeted repair completed")
print("=" * 70)
print(f"Backup created at: {BACKUP}")
print()
print("IMPORTANT:")
print("The script intentionally does not blindly rewrite Dashboard,")
print("AuthContext, BookingManagement, TourManagement, or AddVehicleModal.")
print("Those files require structural inspection before automatic editing.")
print()
