from pathlib import Path
import shutil
from datetime import datetime


file = Path("routes/aiRoutes.js")

backup = Path(
    f"../.ai-router-clean-backup-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
)

backup.mkdir(exist_ok=True)

shutil.copy2(file, backup / "aiRoutes.js")


lines = file.read_text().splitlines()


new = []
router_found = False
rate_found = False
import_seen = set()


for line in lines:

    # remove duplicate router declarations
    if line.strip() == "const router = express.Router();":

        if router_found:
            continue

        router_found = True


    # remove duplicate rateLimiter blocks
    if line.strip().startswith("const rateLimiter"):

        if rate_found:
            continue

        rate_found = True


    # remove duplicate imports
    if line.startswith("import"):

        if line in import_seen:
            continue

        import_seen.add(line)


    new.append(line)



file.write_text("\n".join(new) + "\n")


print("AI ROUTER CLEANED")
print("Backup:", backup)
